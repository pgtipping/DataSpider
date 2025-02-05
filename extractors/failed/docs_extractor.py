import os
import json
import logging
from datetime import datetime
from urllib.parse import urlparse
from crawl4ai.web_crawler import WebCrawler
from crawl4ai.chunking_strategy import RegexChunking
from crawl4ai.extraction_strategy import NoExtractionStrategy

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocsExtractor:
    """Generic documentation extractor that can be customized for different doc sites"""
    
    # Common documentation section selectors for different sites
    SITE_CONFIGS = {
        'nextjs.org': {
            'sections': {
                'main_content': None,
                'getting_started': "div[id^='getting-started']",
                'features': "div[id^='main-features']",
                'routing': "div[id^='routing']"
            }
        },
        'api-docs.deepseek.com': {
            'sections': {
                'main_content': None,
                'quick_start': "div[id^='quick-start']",
                'api_reference': "div[id^='api-reference']",
                'api_guides': "div[id^='api-guides']"
            }
        },
        # Add more site configurations as needed
        'default': {
            'sections': {
                'main_content': None,  # Extract everything
                'navigation': "nav",   # Common navigation selector
                'main': "main",        # Common main content selector
                'sidebar': "aside"     # Common sidebar selector
            }
        }
    }
    
    def __init__(self, output_dir: str = "extracted_docs"):
        self.output_dir = output_dir
        try:
            logger.info("Initializing WebCrawler...")
            self.crawler = WebCrawler()
            # Ensure crawler is ready
            self.crawler.warmup()
            if not hasattr(self.crawler, 'ready') or not self.crawler.ready:
                raise Exception("Crawler failed to initialize properly")
            logger.info("WebCrawler initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize crawler: {str(e)}")
            raise
        
    def _get_site_config(self, url: str) -> dict:
        """Get the appropriate configuration for the given URL"""
        domain = urlparse(url).netloc
        config = self.SITE_CONFIGS.get(domain, self.SITE_CONFIGS['default'])
        logger.info(f"Using configuration for domain: {domain}")
        return config
    
    def extract(self, url: str) -> dict:
        """
        Extract content from a documentation site
        
        Args:
            url (str): The documentation site URL
            
        Returns:
            dict: Summary of extracted content
        """
        logger.info(f"Starting extraction from {url}")
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Get site-specific configuration
        config = self._get_site_config(url)
        site_name = urlparse(url).netloc.replace('.', '_')
        
        results = {}
        
        # Extract each section
        for section_name, css_selector in config['sections'].items():
            try:
                logger.info(f"Extracting section: {section_name}")
                logger.info(f"Using CSS selector: {css_selector}")
                
                # Run the crawler with error handling
                try:
                    result = self.crawler.run(
                        url=url,
                        word_count_threshold=5,
                        chunking_strategy=RegexChunking(),
                        extraction_strategy=NoExtractionStrategy(),
                        css_selector=css_selector,
                        bypass_cache=True,
                        verbose=True  # Enable verbose logging
                    )
                except Exception as e:
                    logger.error(f"Crawler run failed: {str(e)}")
                    raise
                
                if not result or not hasattr(result, 'success'):
                    raise Exception("Crawler returned invalid result")
                
                if not result.success:
                    logger.warning(f"Failed to extract {section_name}")
                    continue
                
                # Prepare section data
                section_data = {
                    'content': result.markdown if hasattr(result, 'markdown') else '',
                    'internal_links': result.links.get('internal', []) if hasattr(result, 'links') else [],
                    'external_links': result.links.get('external', []) if hasattr(result, 'links') else [],
                    'media': result.media if hasattr(result, 'media') else {'images': [], 'videos': [], 'audios': []}
                }
                
                # Save section to file
                section_filename = f"{site_name}_{section_name}_{timestamp}.json"
                section_path = os.path.join(self.output_dir, section_filename)
                
                with open(section_path, 'w', encoding='utf-8') as f:
                    json.dump(section_data, f, indent=2, ensure_ascii=False)
                logger.info(f"Saved JSON data to {section_path}")
                
                # Save markdown content separately
                markdown_filename = f"{site_name}_{section_name}_{timestamp}.md"
                markdown_path = os.path.join(self.output_dir, markdown_filename)
                
                with open(markdown_path, 'w', encoding='utf-8') as f:
                    f.write(section_data['content'])
                logger.info(f"Saved markdown to {markdown_path}")
                
                results[section_name] = {
                    'json_file': section_filename,
                    'markdown_file': markdown_filename,
                    'stats': {
                        'content_length': len(section_data['content']),
                        'internal_links': len(section_data['internal_links']),
                        'external_links': len(section_data['external_links']),
                        'images': len(section_data['media'].get('images', [])),
                        'videos': len(section_data['media'].get('videos', [])),
                        'audios': len(section_data['media'].get('audios', []))
                    }
                }
                
            except Exception as e:
                logger.error(f"Error extracting {section_name}: {str(e)}", exc_info=True)
                results[section_name] = {'error': str(e)}
        
        # Save summary
        try:
            summary_filename = f"{site_name}_summary_{timestamp}.json"
            summary_path = os.path.join(self.output_dir, summary_filename)
            
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            logger.info(f"Saved summary to {summary_path}")
            
        except Exception as e:
            logger.error(f"Error saving summary: {str(e)}", exc_info=True)
        
        return results

if __name__ == "__main__":
    try:
        # Example usage for different documentation sites
        urls = [
            "https://nextjs.org/docs",
            "https://api-docs.deepseek.com/"
        ]
        
        extractor = DocsExtractor()
        
        for url in urls:
            print(f"\nExtracting from {url}")
            print("-" * 50)
            
            results = extractor.extract(url)
            
            # Print summary
            for section_name, data in results.items():
                print(f"\n{section_name.replace('_', ' ').title()}:")
                if 'error' in data:
                    print(f"  Error: {data['error']}")
                else:
                    print(f"  JSON file: {data['json_file']}")
                    print(f"  Markdown file: {data['markdown_file']}")
                    print("  Stats:")
                    for stat_name, value in data['stats'].items():
                        print(f"    - {stat_name.replace('_', ' ').title()}: {value}")
                        
    except Exception as e:
        logger.error("Fatal error in main execution", exc_info=True)
        print(f"Fatal error: {str(e)}") 
from crawl4ai.web_crawler import WebCrawler
from crawl4ai.chunking_strategy import RegexChunking
from crawl4ai.extraction_strategy import NoExtractionStrategy
from typing import List, Dict
import json
import logging
from datetime import datetime
from urllib.parse import urljoin, urlparse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_nextjs_doc_links(base_url: str = "https://nextjs.org/docs", save_to_file: bool = True) -> Dict:
    """
    Extract all internal documentation links from Next.js docs.
    Only returns links that contain '/docs' in their path.
    
    Args:
        base_url: The starting URL to crawl (defaults to Next.js docs homepage)
        save_to_file: Whether to save results to a JSON file
        
    Returns:
        Dict containing:
            - internal_links: List of internal doc links
            - stats: Statistics about the extraction
    """
    logger.info(f"Starting extraction from {base_url}")
    
    # Initialize crawler
    crawler = WebCrawler(verbose=True)
    crawler.warmup()
    
    # JavaScript to extract all links from the page
    js_code = """
    function getAllLinks() {
        const links = Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.href)
            .filter(href => href.includes('/docs'))
            .filter(href => href.startsWith('https://nextjs.org/'));
            
        // Group links by section
        const sections = {
            'app_router': links.filter(href => href.includes('/docs/app')),
            'pages_router': links.filter(href => href.includes('/docs/pages')),
            'api_reference': links.filter(href => href.includes('/docs/api')),
            'other': links.filter(href => 
                !href.includes('/docs/app') && 
                !href.includes('/docs/pages') && 
                !href.includes('/docs/api')
            )
        };
        
        return {links, sections};
    }
    return getAllLinks();
    """
    
    try:
        # Crawl the page and execute JS
        result = crawler.run(
            url=base_url,
            js=js_code,
            bypass_cache=True,  # Ensure we get fresh content
            chunking_strategy=RegexChunking(),
            extraction_strategy=NoExtractionStrategy()
        )
        
        if not result.success:
            raise Exception("Failed to extract links")
            
        # Extract links from JS execution result
        links = []
        sections = {}
        
        if result.js_result:
            if 'links' in result.js_result:
                links = result.js_result['links']
            if 'sections' in result.js_result:
                sections = result.js_result['sections']
        
        # Clean and deduplicate links
        unique_links = sorted(list(set(links)))
        
        # Prepare results
        results = {
            'internal_links': unique_links,
            'sections': sections,
            'stats': {
                'total_links': len(unique_links),
                'app_router_links': len(sections.get('app_router', [])),
                'pages_router_links': len(sections.get('pages_router', [])),
                'api_reference_links': len(sections.get('api_reference', [])),
                'other_links': len(sections.get('other', []))
            }
        }
        
        # Save results if requested
        if save_to_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"nextjs_docs_links_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved results to {filename}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error extracting links: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        # Extract links
        results = extract_nextjs_doc_links()
        
        # Print results
        print(f"\nFound {results['stats']['total_links']} unique internal doc links:")
        print("\nBreakdown by section:")
        for section, count in results['stats'].items():
            if section != 'total_links':
                print(f"- {section.replace('_', ' ').title()}: {count}")
        
        print("\nAll Links:")
        for link in results['internal_links']:
            print(f"- {link}")
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}") 
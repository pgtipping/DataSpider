import os
import sys
# Add parent directory to path to find local crawl4ai package
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from crawl4ai.async_webcrawler import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from crawl4ai.config import MIN_WORD_THRESHOLD
from crawl4ai.chunking_strategy import RegexChunking
from crawl4ai.extraction_strategy import NoExtractionStrategy, JsonCssExtractionStrategy
from playwright.async_api import Page, BrowserContext
from crawl4ai.async_logger import AsyncLogger

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NextJsDocsLinkExtractor:
    """Extracts internal documentation links from Next.js docs using async crawler"""
    
    def __init__(self, output_dir: str = "extracted_docs"):
        self.output_dir = output_dir
        self.browser_config = BrowserConfig(
            headless=True,
            viewport_width=1920,
            viewport_height=1080
        )
        self.crawler = AsyncWebCrawler(config=self.browser_config)
        
    async def setup_hooks(self):
        """Set up hooks for the crawler."""
        # Create logger
        logger = AsyncLogger(
            log_file=os.path.join(os.path.expanduser('~'), '.crawl4ai', 'crawler.log'),
            verbose=True,
            tag_width=10
        )
        
        # Configure browser
        browser_config = BrowserConfig(
            viewport_width=1920,
            viewport_height=1080,
            headless=True,
            verbose=True
        )
        
        # Configure crawler
        self.crawler_config = CrawlerRunConfig(
            bypass_cache=True,
            word_count_threshold=MIN_WORD_THRESHOLD,
            wait_until='networkidle',
            page_timeout=30000,
            extraction_strategy=JsonCssExtractionStrategy({
                'base_selector': 'nav[aria-label="Navigation"]',
                'fields': {
                    'links': {
                        'selector': 'a[href]',
                        'type': 'list',
                        'fields': {
                            'href': {'type': 'attribute', 'name': 'href'},
                            'text': {'type': 'text'}
                        }
                    }
                }
            })
        )
        
        # Create crawler with logger
        self.crawler = AsyncWebCrawler(
            config=browser_config,
            always_bypass_cache=True,
            **{'logger': logger}
        )
        await self.crawler.start()
        
    async def extract_links(self, base_url: str = "https://nextjs.org/docs", save_to_file: bool = True) -> Dict:
        """Extract internal documentation links from Next.js docs."""
        try:
            logger.info(f"Starting link extraction from {base_url}")
            
            # Set up crawler and hooks
            await self.setup_hooks()
            
            # Execute crawl with extraction strategy
            result = await self.crawler.arun(
                base_url,
                config=self.crawler_config
            )
            
            if not result or not result.success:
                logger.error("Failed to extract links")
                raise Exception("Failed to extract links")
                
            # Process links from the result
            extracted_data = result.extracted_data if hasattr(result, 'extracted_data') else {}
            links_data = extracted_data.get('links', [])
            
            # Initialize results structure
            results = {
                'timestamp': datetime.now().isoformat(),
                'base_url': base_url,
                'all_links': [],
                'sections': {
                    'getting_started': [],
                    'app_router': [],
                    'pages_router': [],
                    'api_reference': [],
                    'other': []
                },
                'stats': {
                    'total_links': 0,
                    'getting_started_links': 0,
                    'app_router_links': 0,
                    'pages_router_links': 0,
                    'api_reference_links': 0,
                    'other_links': 0
                }
            }
            
            # Process each link
            for link in links_data:
                href = link.get('href', '')
                text = link.get('text', '')
                
                # Skip empty or external links
                if not href or not href.startswith('/docs/'):
                    continue
                    
                # Add to all links
                results['all_links'].append(link)
                results['stats']['total_links'] += 1
                
                # Categorize link
                section = 'other'
                if '/getting-started/' in href:
                    section = 'getting_started'
                elif '/app/' in href:
                    section = 'app_router'
                elif '/pages/' in href:
                    section = 'pages_router'
                elif '/api-reference/' in href:
                    section = 'api_reference'
                    
                # Add to sections
                results['sections'][section].append(link)
                
                # Update stats
                results['stats'][f'{section}_links'] += 1
            
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
        finally:
            # Clean up
            await self.crawler.close()
            
async def test_extractor():
    """Test the link extractor"""
    try:
        extractor = NextJsDocsLinkExtractor()
        results = await extractor.extract_links()
        
        # Print results
        print(f"\nFound {results['stats']['total_links']} unique internal doc links")
        print("\nBreakdown by section:")
        for section, count in results['stats'].items():
            if section != 'total_links':
                print(f"- {section.replace('_', ' ').title()}: {count}")
                
        print("\nSample of links by section:")
        for section, links in results['sections'].items():
            print(f"\n{section.replace('_', ' ').title()}:")
            # Show first 3 links from each section
            for link in links[:3]:
                print(f"- [{link['text']}]({link['href']})")
                
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_extractor()) 
import os
import time
import json
from datetime import datetime
from crawl4ai.crawlers.sync.web_crawler import WebCrawler
from crawl4ai.strategies.chunking.chunking_strategy import (
    ChunkingStrategy,
    RegexChunking,
    NlpSentenceChunking
)
from crawl4ai.strategies.extraction.extraction_strategy import (
    ExtractionStrategy,
    LLMExtractionStrategy,
    CosineStrategy
)
from crawl4ai.strategies.crawling.crawler_strategy import (
    CrawlerStrategy,
    LocalSeleniumCrawlerStrategy
)
from functools import lru_cache

@lru_cache()
def create_crawler():
    crawler = WebCrawler(verbose=True)
    crawler.warmup()
    return crawler

def extract_content(url: str) -> dict:
    """
    Extract content from a URL using WebCrawler
    
    Args:
        url: URL to extract content from
    """
    # Create output directory
    os.makedirs("extracted_docs", exist_ok=True)
    
    # Get or create crawler
    crawler = create_crawler()
    
    # Run the crawler with basic configuration
    result = crawler.run(
        url=url,
        only_text=True,  # We only want text content
        word_count_threshold=1  # Include all text blocks
    )
    
    if not result.success:
        raise Exception(f"Failed to extract content from {url}")
        
    # Save the output
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    site_name = url.replace('https://', '').replace('http://', '').split('/')[0].replace('.', '_')
    
    # Prepare output files
    json_file = os.path.join("extracted_docs", f"{site_name}_{timestamp}.json")
    markdown_file = os.path.join("extracted_docs", f"{site_name}_{timestamp}.md")
    
    # Prepare data
    data = {
        'content': result.extracted_content,  # Use extracted content directly
        'internal_links': result.internal_links,
        'external_links': result.external_links,
        'media': {
            'images': result.images,
            'videos': result.videos,
            'audios': []  # Not provided in sync version
        }
    }
    
    # Save JSON data
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    # Save markdown content separately
    with open(markdown_file, 'w', encoding='utf-8') as f:
        f.write(data['content'])
        
    return data

def main():
    # Example usage
    urls = [
        "https://nextjs.org/docs",
        "https://api-docs.deepseek.com/"
    ]
    
    for url in urls:
        print(f"\nExtracting from {url}")
        print("-" * 50)
        
        try:
            result = extract_content(url)
            print(f"\nContent saved to extracted_docs/")
            print(f"Content length: {len(result['content'])} characters")
            print(f"Internal links: {len(result['internal_links'])}")
            print(f"External links: {len(result['external_links'])}")
            print(f"Media items: {len(result['media']['images'])} images, "
                  f"{len(result['media']['videos'])} videos, "
                  f"{len(result['media']['audios'])} audio files")
                  
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 
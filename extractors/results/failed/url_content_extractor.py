from crawl4ai.web_crawler import WebCrawler
from crawl4ai.chunking_strategy import RegexChunking
from crawl4ai.extraction_strategy import NoExtractionStrategy

def extract_urls_and_content(url: str, css_selector: str = None) -> dict:
    """
    Extract URLs and content from a web page.
    
    Args:
        url (str): The URL of the web page to scrape
        css_selector (str, optional): CSS selector to target specific content
        
    Returns:
        dict: Dictionary containing:
            - internal_links: List of internal URLs
            - external_links: List of external URLs
            - content: Content in markdown format
            - media: Dictionary of media elements (images, videos, audio)
    """
    # Initialize the crawler
    crawler = WebCrawler()
    
    # Run the crawler with minimal processing (no content extraction)
    result = crawler.run(
        url=url,
        word_count_threshold=5,  # Minimum words to consider content relevant
        chunking_strategy=RegexChunking(),
        extraction_strategy=NoExtractionStrategy(),
        css_selector=css_selector,
        bypass_cache=True  # Get fresh content
    )
    
    if not result.success:
        raise Exception(f"Failed to crawl {url}")
        
    # Extract URLs and content
    return {
        'internal_links': result.links.get('internal', []),
        'external_links': result.links.get('external', []),
        'content': result.markdown,
        'media': result.media
    }

if __name__ == "__main__":
    # Example usage
    url = "https://python.org"
    
    try:
        # Extract from entire page
        result = extract_urls_and_content(url)
        print("\nExtracted URLs and content from entire page:")
        print(f"Internal links: {len(result['internal_links'])}")
        print(f"External links: {len(result['external_links'])}")
        print(f"Content length: {len(result['content'])} characters")
        print(f"Media items: {len(result['media'].get('images', []))} images, "
              f"{len(result['media'].get('videos', []))} videos, "
              f"{len(result['media'].get('audios', []))} audio files")
        
        # Extract from specific section using CSS selector
        result = extract_urls_and_content(url, css_selector="div.documentation-widget")
        print("\nExtracted URLs and content from documentation section:")
        print(f"Internal links: {len(result['internal_links'])}")
        print(f"External links: {len(result['external_links'])}")
        print(f"Content length: {len(result['content'])} characters")
        
    except Exception as e:
        print(f"Error: {str(e)}") 
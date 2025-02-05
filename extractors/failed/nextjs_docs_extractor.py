import os
import json
from datetime import datetime
from crawl4ai.web_crawler import WebCrawler
from crawl4ai.chunking_strategy import RegexChunking
from crawl4ai.extraction_strategy import NoExtractionStrategy

def extract_nextjs_docs(output_dir: str = "extracted_docs") -> dict:
    """
    Extract content from Next.js documentation and save it in a structured format.
    
    Args:
        output_dir (str): Directory to save the extracted content
        
    Returns:
        dict: Summary of extracted content
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Initialize the crawler
    crawler = WebCrawler()
    
    # URLs to extract
    base_url = "https://nextjs.org/docs"
    
    # Define sections to extract with their CSS selectors
    sections = {
        "main_content": None,  # None means extract everything
        "getting_started": "div[id^='getting-started']",
        "features": "div[id^='main-features']",
        "routing": "div[id^='routing']"
    }
    
    results = {}
    
    for section_name, css_selector in sections.items():
        try:
            # Run the crawler
            result = crawler.run(
                url=base_url,
                word_count_threshold=5,
                chunking_strategy=RegexChunking(),
                extraction_strategy=NoExtractionStrategy(),
                css_selector=css_selector,
                bypass_cache=True
            )
            
            if not result.success:
                print(f"Failed to extract {section_name}")
                continue
                
            # Prepare section data
            section_data = {
                'content': result.markdown,
                'internal_links': result.links.get('internal', []),
                'external_links': result.links.get('external', []),
                'media': result.media
            }
            
            # Save section to file
            section_filename = f"nextjs_docs_{section_name}_{timestamp}.json"
            section_path = os.path.join(output_dir, section_filename)
            
            with open(section_path, 'w', encoding='utf-8') as f:
                json.dump(section_data, f, indent=2, ensure_ascii=False)
                
            # Save markdown content separately for easy reading
            markdown_filename = f"nextjs_docs_{section_name}_{timestamp}.md"
            markdown_path = os.path.join(output_dir, markdown_filename)
            
            with open(markdown_path, 'w', encoding='utf-8') as f:
                f.write(result.markdown)
                
            results[section_name] = {
                'json_file': section_filename,
                'markdown_file': markdown_filename,
                'stats': {
                    'content_length': len(result.markdown),
                    'internal_links': len(result.links.get('internal', [])),
                    'external_links': len(result.links.get('external', [])),
                    'images': len(result.media.get('images', [])),
                    'videos': len(result.media.get('videos', [])),
                    'audios': len(result.media.get('audios', []))
                }
            }
            
        except Exception as e:
            print(f"Error extracting {section_name}: {str(e)}")
            results[section_name] = {'error': str(e)}
    
    # Save summary
    summary_filename = f"nextjs_docs_summary_{timestamp}.json"
    summary_path = os.path.join(output_dir, summary_filename)
    
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
        
    return results

if __name__ == "__main__":
    # Extract content and save to 'extracted_docs' directory
    results = extract_nextjs_docs()
    
    # Print summary
    print("\nExtraction Summary:")
    print("-" * 50)
    
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
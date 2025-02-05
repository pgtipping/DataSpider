import asyncio
from crawl4ai.crawlers.async_crawlers.async_webcrawler import AsyncWebCrawler
from bs4 import BeautifulSoup
from crawl4ai.utils.html2text import html2text
import os
import urllib.parse
import shutil
import re

crawled_urls = set()
new_files_created = False  # Flag to track if any new files were created

def sanitize_filename(filename):
    """Sanitizes a string to be used as a filename."""
    return "".join(c if c.isalnum() or c in ['.', '-', '_'] else "_" for c in filename)

async def crawl_page(crawler: AsyncWebCrawler, url: str, output_dir: str):
    global new_files_created  # Access the global flag
    if url in crawled_urls:
        return

    crawled_urls.add(url)

    print(f"Crawling: {url}")
    try:
        result = await crawler.arun(url=url)
        soup = BeautifulSoup(result.html, 'html.parser')

        # Extract the text from the main h1 tag
        h1_element = soup.find("h1", class_=lambda x: x != 'sr-only')
        h1_text = h1_element.text if h1_element else ""

        # Extract the page title
        title_element = soup.find("title")
        title_text = title_element.text if title_element else ""

        # Use title or H1 text for filename, fallback to URL if both are missing
        if title_text:
            filename = sanitize_filename(title_text) + ".md"
        elif h1_text:
            filename = sanitize_filename(h1_text) + ".md"
        else:
            filename = sanitize_filename(urllib.parse.quote_plus(url)) + ".md"

        # Extract the main content
        main_content = soup.find("article", class_="mt-4 w-full min-w-0 max-w-6xl px-1 md:px-6")
        main_content_html = ""
        if main_content:
            main_content_html = str(main_content)

        # Convert HTML to Markdown
        main_content_markdown = html2text(main_content_html)

        markdown_content = f"# {h1_text}\n\n{main_content_markdown}"

        # Extract all links from the page
        links = [a['href'] for a in soup.find_all('a', href=True)]

        # Store the Markdown output in a file
        if main_content_markdown and main_content_markdown.strip(): # Check if main_content_markdown is not empty
            filepath = os.path.join(output_dir, filename)
            # Check if the file already exists
            if not os.path.exists(filepath):
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(markdown_content)

                print(f"Markdown output saved to {filepath}")
                new_files_created = True  # Set the flag to True
            else:
                print(f"Skipping {url}: Markdown file already exists at {filepath}")
        else:
            print(f"Skipping {url}: No main content found")

        # Recursively crawl subpages
        for link in links:
            absolute_url = urllib.parse.urljoin(url, link)
            if absolute_url.startswith("https://nextjs.org/docs"):
                await crawl_page(crawler, absolute_url, output_dir)

    except Exception as e:
        print(f"Error crawling {url}: {e}")

async def main():
    start_url = "https://nextjs.org/docs"
    output_dir = "nextjs_docs"

    # Remove the output directory if it exists
    if os.path.exists(output_dir):
        try:
            shutil.rmtree(output_dir)
        except Exception as e:
            print(f"Error deleting directory {output_dir}: {e}")
            exit()

    # Create the output directory if it doesn't exist
    os.makedirs(output_dir)

    browser_config = None
    async with AsyncWebCrawler(config=browser_config) as crawler:
        await crawl_page(crawler, start_url, output_dir)

    if not new_files_created:
        print("No new content found. Stopping the crawler.")

if __name__ == "__main__":
    asyncio.run(main())
from crawl4ai import AsyncWebCrawler, CrawlResult
import unittest
import os
import asyncio
from bs4 import BeautifulSoup
import re

class TestTextExtractor(unittest.TestCase):
    async def asyncSetUp(self):
        self.crawler = AsyncWebCrawler()
        await self.crawler.start()
        self.test_url = "https://docs.python.org/3/"
        # Use absolute path in the current directory
        self.output_dir = os.path.abspath(os.path.dirname(__file__))
        self.output_file = os.path.join(self.output_dir, "python_docs_text.txt")
        print(f"Output will be saved to: {self.output_file}")

    async def asyncTearDown(self):
        # Comment out file cleanup to inspect the content after test
        # if os.path.exists(self.output_file):
        #     os.remove(self.output_file)
        if hasattr(self, 'crawler'):
            await self.crawler.close()

    def setUp(self):
        self.loop = asyncio.get_event_loop()
        self.loop.run_until_complete(self.asyncSetUp())

    def tearDown(self):
        self.loop.run_until_complete(self.asyncTearDown())

    def extract_text_from_html(self, html_content):
        """Extract clean text content from HTML."""
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space
        lines = (line.strip() for line in text.splitlines())
        
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        
        # Drop blank lines and normalize whitespace
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text

    async def async_test_extract_text_content(self):
        print(f"Crawling {self.test_url}...")
        try:
            result = await self.crawler.arun(url=self.test_url)
            self.assertIsNotNone(result.html)
            self.assertTrue(len(result.html) > 0)
            
            # Extract clean text from HTML
            text_content = self.extract_text_from_html(result.html)
            self.assertIsNotNone(text_content)
            self.assertTrue(len(text_content) > 0)
            
            # Save content to file
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(text_content)
            
            # Verify file exists and has content
            self.assertTrue(os.path.exists(self.output_file))
            self.assertTrue(os.path.getsize(self.output_file) > 0)
            print(f"Text content saved successfully to: {self.output_file}")
            
            # Print first few words as preview
            preview_words = ' '.join(text_content.split()[:20])
            print(f"\nPreview of extracted text:\n{preview_words}...")
            
        except Exception as e:
            self.fail(f"Error occurred: {e}")

    def test_extract_text_content(self):
        self.loop.run_until_complete(self.async_test_extract_text_content())

if __name__ == "__main__":
    unittest.main() 
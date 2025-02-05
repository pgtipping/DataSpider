from crawl4ai import AsyncWebCrawler, CrawlResult
import unittest
import os
import asyncio

class TestWebCrawler(unittest.TestCase):
    async def asyncSetUp(self):
        self.crawler = AsyncWebCrawler()
        await self.crawler.start()
        self.test_url = "https://docs.python.org/3/"
        # Use absolute path in the current directory
        self.output_dir = os.path.abspath(os.path.dirname(__file__))
        self.output_file = os.path.join(self.output_dir, "python_docs.txt")
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

    async def async_test_fetch_website_content(self):
        print(f"Crawling {self.test_url}...")
        try:
            result = await self.crawler.arun(url=self.test_url)
            self.assertIsNotNone(result.html)
            self.assertTrue(len(result.html) > 0)
            
            # Save content to file
            content = result.extracted_content if result.extracted_content else result.html
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Verify file exists and has content
            self.assertTrue(os.path.exists(self.output_file))
            self.assertTrue(os.path.getsize(self.output_file) > 0)
            print(f"Content saved successfully to: {self.output_file}")
            
        except Exception as e:
            self.fail(f"Error occurred: {e}")

    def test_fetch_website_content(self):
        self.loop.run_until_complete(self.async_test_fetch_website_content())

if __name__ == "__main__":
    unittest.main() 
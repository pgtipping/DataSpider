from typing import Dict, List, Optional, Any, Set
from urllib.parse import urljoin, urlparse
import json
import os
import asyncio
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup
from PIL import Image
import io
import base64
import logging

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.getenv("LOG_FILE", "logs/app.log")),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class Crawler:
    def __init__(
        self,
        max_depth: int = 1,
        max_pages: int = 10,
        follow_external: bool = False,
        extract_images: bool = True,
        extract_text: bool = True,
        extract_links: bool = True,
        user_agent: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.follow_external = follow_external
        self.extract_images = extract_images
        self.extract_text = extract_text
        self.extract_links = extract_links
        self.user_agent = user_agent
        self.headers = headers or {}
        self.visited_urls: Set[str] = set()
        self.browser: Optional[Browser] = None
        self.base_domain: Optional[str] = None
        
    async def __aenter__(self):
        await self.start()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
        
    async def start(self):
        """Initialize the browser instance."""
        try:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(
                headless=os.getenv("BROWSER_HEADLESS", "true").lower() == "true"
            )
        except Exception as e:
            logger.error(f"Failed to start browser: {str(e)}")
            raise
            
    async def close(self):
        """Close the browser instance."""
        if self.browser:
            await self.browser.close()
            self.browser = None
            
    def _is_same_domain(self, url: str) -> bool:
        """Check if URL is from the same domain."""
        if not self.base_domain:
            return True
        return urlparse(url).netloc == self.base_domain
        
    async def _process_images(self, page: Page) -> List[Dict[str, Any]]:
        """Extract and process images from the page."""
        images = []
        if self.extract_images:
            try:
                img_elements = await page.query_selector_all("img")
                for img in img_elements:
                    try:
                        src = await img.get_attribute("src")
                        if src:
                            # Convert relative URLs to absolute
                            abs_src = urljoin(page.url, src)
                            
                            # Get image dimensions
                            width = await img.get_attribute("width")
                            height = await img.get_attribute("height")
                            
                            images.append({
                                "url": abs_src,
                                "alt": await img.get_attribute("alt") or "",
                                "width": width,
                                "height": height
                            })
                    except Exception as e:
                        logger.warning(f"Failed to process image: {str(e)}")
                        continue
            except Exception as e:
                logger.error(f"Failed to extract images: {str(e)}")
        
        return images
        
    async def _process_links(self, page: Page) -> List[Dict[str, str]]:
        """Extract and process links from the page."""
        links = []
        if self.extract_links:
            try:
                a_elements = await page.query_selector_all("a")
                for a in a_elements:
                    try:
                        href = await a.get_attribute("href")
                        if href:
                            # Convert relative URLs to absolute
                            abs_href = urljoin(page.url, href)
                            
                            # Only include if it's same domain or following external is allowed
                            if self.follow_external or self._is_same_domain(abs_href):
                                links.append({
                                    "url": abs_href,
                                    "text": (await a.text_content()) or ""
                                })
                    except Exception as e:
                        logger.warning(f"Failed to process link: {str(e)}")
                        continue
            except Exception as e:
                logger.error(f"Failed to extract links: {str(e)}")
                
        return links
        
    async def _process_text(self, page: Page) -> str:
        """Extract and process text content from the page."""
        if self.extract_text:
            try:
                return await page.content()
            except Exception as e:
                logger.error(f"Failed to extract text: {str(e)}")
                
        return ""
        
    async def extract_page(
        self,
        url: str,
        depth: int = 0,
        selector: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extract data from a single page."""
        if not self.browser:
            await self.start()
            
        try:
            # Create new page
            page = await self.browser.new_page()
            
            # Set user agent if provided
            if self.user_agent:
                await page.set_extra_http_headers({"User-Agent": self.user_agent})
                
            # Add custom headers
            if self.headers:
                await page.set_extra_http_headers(self.headers)
                
            # Navigate to URL
            await page.goto(url, wait_until="networkidle")
            
            # Process selector if provided
            selector_matches = []
            if selector:
                elements = await page.query_selector_all(selector)
                for element in elements:
                    selector_matches.append(await element.inner_html())
                    
            # Extract data
            data = {
                "url": url,
                "title": await page.title(),
                "images": await self._process_images(page),
                "links": await self._process_links(page),
                "text": await self._process_text(page),
                "depth": depth,
                "timestamp": datetime.now().isoformat()
            }
            
            if selector_matches:
                data["selector_matches"] = selector_matches
                
            await page.close()
            return data
            
        except Exception as e:
            logger.error(f"Failed to extract page {url}: {str(e)}")
            raise
            
    async def crawl(self, start_url: str, task_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Start crawling from the given URL."""
        self.visited_urls.clear()
        self.base_domain = urlparse(start_url).netloc
        
        try:
            if not self.browser:
                await self.start()
                
            results = []
            queue = [(start_url, 0)]  # (url, depth)
            
            while queue and len(self.visited_urls) < self.max_pages:
                url, depth = queue.pop(0)
                
                if url in self.visited_urls or depth > self.max_depth:
                    continue
                    
                self.visited_urls.add(url)
                
                try:
                    data = await self.extract_page(url, depth)
                    results.append(data)
                    
                    # Save progress if task_id is provided
                    if task_id:
                        self._save_progress(task_id, results)
                    
                    # Add links to queue
                    if depth < self.max_depth:
                        for link in data["links"]:
                            if link["url"] not in self.visited_urls:
                                queue.append((link["url"], depth + 1))
                                
                except Exception as e:
                    logger.error(f"Failed to crawl {url}: {str(e)}")
                    continue
                    
            return results
            
        except Exception as e:
            logger.error(f"Crawl failed: {str(e)}")
            raise
            
        finally:
            await self.close()
            
    def _save_progress(self, task_id: str, results: List[Dict[str, Any]]):
        """Save crawling progress to a file."""
        try:
            data_dir = Path(os.getenv("DATA_DIR", "data"))
            task_file = data_dir / f"{task_id}.json"
            
            with open(task_file, "w") as f:
                json.dump({
                    "task_id": task_id,
                    "status": "in_progress" if len(results) < self.max_pages else "completed",
                    "pages_crawled": len(results),
                    "max_pages": self.max_pages,
                    "results": results,
                    "timestamp": datetime.now().isoformat()
                }, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save progress: {str(e)}")
            
    async def test_selector(self, url: str, selector: str) -> List[str]:
        """Test a CSS selector against a URL."""
        try:
            data = await self.extract_page(url, selector=selector)
            return data.get("selector_matches", [])
        except Exception as e:
            logger.error(f"Failed to test selector: {str(e)}")
            raise 
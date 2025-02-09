"""Service for handling web crawling playground functionality."""

import asyncio
from typing import Any, Dict, Optional

from crawl4ai import Crawler, CrawlerResult
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from crawl4ai.cache_context import CacheContext, CacheMode

from .ws_manager import ws_manager


class PlaygroundService:
    def __init__(self) -> None:
        """Initialize the playground service."""
        self.crawler = Crawler()
        self.cache = CacheContext(cache_mode=CacheMode.ENABLED)
        self.semaphore = asyncio.Semaphore(5)  # Limit concurrent crawls

    async def execute_crawl(self, config: Dict[str, Any], client_id: str) -> str:
        """Execute a crawl and return job ID."""
        try:
            browser_config = BrowserConfig.from_kwargs(config.get("browser", {}))
            crawler_config = CrawlerRunConfig.from_kwargs(config.get("crawler", {}))

            async with self.semaphore:
                job_id = f"playground_job_{id(config)}"
                await ws_manager.send_message(client_id, {"type": "status", "message": "Crawl started", "progress": 0})

                # Run the crawl and cache results
                result = await self.crawler.run_async(
                    url=crawler_config.url,
                    strategy=crawler_config.strategy,
                    browser_config=browser_config
                )

                self.cache.set(
                    job_id,
                    {
                        "status": "completed",
                        "result": result.to_dict() if hasattr(result, 'to_dict') else str(result),
                        "pdf_url": f"/results/{job_id}.pdf",  # Demo PDF placeholder
                    },
                    ttl=3600,
                )

                await ws_manager.send_message(
                    client_id,
                    {
                        "type": "status",
                        "message": "Crawl completed",
                        "progress": 100,
                        "job_id": job_id
                    }
                )

                return job_id

        except Exception as e:
            await ws_manager.send_message(client_id, {"type": "error", "message": str(e)})
            raise

    def get_results(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached results."""
        return self.cache.get(job_id)


playground_service = PlaygroundService()

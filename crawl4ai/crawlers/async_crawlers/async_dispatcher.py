from .base_strategy import BaseStrategy
from .models import CrawlResponse
from typing import Optional, Dict, Any

class AsyncDispatcher:
    def __init__(self, strategy: Optional[BaseStrategy] = None):
        self.strategy = strategy
        
    async def dispatch_crawl(
        self,
        url: str,
        config: Optional[Dict[str, Any]] = None
    ) -> CrawlResponse:
        """
        Dispatch a crawl job using the configured strategy
        """
        if not self.strategy:
            raise ValueError("No crawling strategy configured")
            
        return await self.strategy.execute(url, config)
        
    def set_strategy(self, strategy: BaseStrategy):
        """Set the crawling strategy dynamically"""
        self.strategy = strategy

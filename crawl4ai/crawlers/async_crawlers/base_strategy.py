from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from .models import CrawlResponse

class BaseStrategy(ABC):
    """Abstract base class for all async crawling strategies"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize strategy with optional configuration"""
        self.config = config or {}
        
    @abstractmethod
    async def execute(self, url: str, config: Optional[Dict[str, Any]] = None) -> CrawlResponse:
        """
        Execute the crawling strategy for a given URL
        Args:
            url: Target URL to crawl
            config: Optional runtime configuration overriding initial config
        Returns:
            CrawlResponse containing results and metadata
        Raises:
            NotImplementedError: If subclass doesn't implement this method
            RuntimeError: For execution errors with detailed context
        """
        pass

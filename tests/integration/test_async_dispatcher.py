import pytest
from crawl4ai.crawlers.async_crawlers.async_dispatcher import AsyncDispatcher
from crawl4ai.crawlers.async_crawlers.base_strategy import BaseStrategy
from crawl4ai.crawlers.async_crawlers.models import CrawlResponse
from typing import Optional, Dict, Any

class MockStrategy(BaseStrategy):
    """Test strategy that returns predictable responses"""
    
    async def execute(self, url: str, config: Optional[Dict[str, Any]] = None) -> CrawlResponse:
        return CrawlResponse(
            content=f"Mock content for {url}",
            status_code=200,
            url=url,
            metadata={
                "strategy": "mock",
                "config": config or {}
            }
        )

@pytest.mark.asyncio
async def test_dispatcher_basic_operation():
    dispatcher = AsyncDispatcher(strategy=MockStrategy())
    test_url = "http://example.com"
    
    response = await dispatcher.dispatch_crawl(test_url)
    
    assert response.status_code == 200
    assert test_url in response.content
    assert response.url == test_url
    assert response.metadata["strategy"] == "mock"

@pytest.mark.asyncio
async def test_dynamic_strategy_swapping():
    dispatcher = AsyncDispatcher()
    
    class AlternateStrategy(MockStrategy):
        async def execute(self, url: str, config: Optional[Dict[str, Any]] = None) -> CrawlResponse:
            return CrawlResponse(
                content="Alternate content",
                status_code=200,
                url=url,
                metadata={"strategy": "alternate"}
            )
    
    dispatcher.set_strategy(AlternateStrategy())
    response = await dispatcher.dispatch_crawl("http://test.com")
    
    assert response.metadata["strategy"] == "alternate"
    assert "Alternate content" in response.content

@pytest.mark.asyncio
async def test_error_handling():
    class ErrorStrategy(MockStrategy):
        async def execute(self, url: str, config: Optional[Dict[str, Any]] = None) -> CrawlResponse:
            raise ValueError("Simulated strategy failure")
    
    dispatcher = AsyncDispatcher(strategy=ErrorStrategy())
    
    with pytest.raises(ValueError) as exc_info:
        await dispatcher.dispatch_crawl("http://error.com")
    
    assert "Simulated strategy failure" in str(exc_info.value)

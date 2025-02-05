"""Web crawling strategies."""

from .crawler_strategy import (
    CrawlerStrategy,
    CloudCrawlerStrategy,
    LocalSeleniumCrawlerStrategy
)

__all__ = [
    'CrawlerStrategy',
    'CloudCrawlerStrategy',
    'LocalSeleniumCrawlerStrategy'
]

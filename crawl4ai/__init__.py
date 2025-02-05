"""
crawl4ai - A powerful web crawling and content extraction library.
"""

from .__version__ import __version__

# Core crawlers
from .crawlers import AsyncWebCrawler, WebCrawler, CacheMode

# Strategies
from .strategies.chunking import (
    ChunkingStrategy,
    RegexChunking,
    NlpSentenceChunking
)
from .strategies.extraction import (
    ExtractionStrategy,
    LLMExtractionStrategy,
    CosineStrategy,
    JsonCssExtractionStrategy
)
from .strategies.content_filtering import (
    RelevantContentFilter,
    PruningContentFilter,
    BM25ContentFilter
)
from .strategies.crawling import (
    CrawlerStrategy,
    CloudCrawlerStrategy,
    LocalSeleniumCrawlerStrategy
)

# Models
from .models import CrawlResult, CrawlConfig, ExtractedContent, MediaContent

# Utilities
from .utils import (
    html2text,
    sanitize_text,
    extract_text_from_html,
    get_domain_from_url,
    is_valid_url,
    create_directory_if_not_exists
)

__all__ = [
    '__version__',
    # Crawlers
    'AsyncWebCrawler',
    'WebCrawler',
    'CacheMode',
    # Chunking Strategies
    'ChunkingStrategy',
    'RegexChunking',
    'NlpSentenceChunking',
    # Extraction Strategies
    'ExtractionStrategy',
    'LLMExtractionStrategy',
    'CosineStrategy',
    'JsonCssExtractionStrategy',
    # Content Filtering
    'RelevantContentFilter',
    'PruningContentFilter',
    'BM25ContentFilter',
    # Crawler Strategies
    'CrawlerStrategy',
    'CloudCrawlerStrategy',
    'LocalSeleniumCrawlerStrategy',
    # Models
    'CrawlResult',
    'CrawlConfig',
    'ExtractedContent',
    'MediaContent',
    # Utilities
    'html2text',
    'sanitize_text',
    'extract_text_from_html',
    'get_domain_from_url',
    'is_valid_url',
    'create_directory_if_not_exists'
]

# Optional dependency checks
def _check_selenium_installed():
    """Check if selenium is installed without importing it directly."""
    try:
        import importlib.util
        return importlib.util.find_spec("selenium") is not None
    except ImportError:
        return False

# Initialize optional components
if _check_selenium_installed():
    try:
        from .crawlers.sync.web_crawler import WebCrawler
        __all__.append("WebCrawler")
    except ImportError:
        import warnings
        warnings.warn(
            "Failed to import WebCrawler even though selenium is installed. "
            "This might be due to other missing dependencies."
        )
else:
    WebCrawler = None
    import warnings
    warnings.warn(
        "Synchronous WebCrawler is not available. Install crawl4ai[sync] for synchronous support. "
        "Note: The synchronous version will be deprecated in a future release."
    )
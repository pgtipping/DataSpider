"""
API routers for the Crawl4AI backend.

This package contains the FastAPI router modules that define
the API endpoints for web crawling and playground functionality.
"""

from .crawler import router as crawler_router
from .playground import router as playground_router

__all__ = ['crawler_router', 'playground_router'] 
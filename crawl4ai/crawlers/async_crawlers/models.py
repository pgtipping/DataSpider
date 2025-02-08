from pydantic import BaseModel, ConfigDict
from typing import Any, Dict, Optional, List, Union
from datetime import datetime

class CrawlResponse(BaseModel):
    content: str
    status_code: int
    url: str
    metadata: Dict[str, Any] = {}
    
    model_config = ConfigDict(arbitrary_types_allowed=True)

class CrawlResult(CrawlResponse):
    """Extends base response with crawl-specific metadata"""
    load_time: float
    screenshot: Optional[bytes] = None
    dom: Optional[str] = None

class MarkdownGenerationResult(BaseModel):
    markdown: str
    metadata: Dict[str, Any] = {}

class CrawlerTaskResult(BaseModel):
    url: str
    results: List[Union[CrawlResult, MarkdownGenerationResult]]
    error: Optional[str] = None

class DispatchResult(BaseModel):
    strategy_used: str
    results: List[CrawlerTaskResult]
    timestamp: datetime = datetime.now()

from pydantic import BaseModel
from typing import Optional, Dict, Any, Callable
from enum import Enum

class AsyncCrawlResponse(BaseModel):
    html: str
    response_headers: Dict[str, str]
    status_code: int
    screenshot: Optional[str] = None
    pdf_data: Optional[bytes] = None
    get_delayed_content: Optional[Callable[[], Any]] = None
    ssl_certificate: Optional[Any] = None
    downloaded_files: Optional[list] = None

class CrawlResult(BaseModel):
    url: str
    html: Optional[str] = None
    text: Optional[str] = None
    screenshot_path: Optional[str] = None
    metadata: Dict[str, Any] = {}
    
    def to_dict(self):
        return self.dict()

class MarkdownGenerationResult(BaseModel):
    url: str
    markdown: str
    summary: Optional[str] = None
    sections: Dict[str, str] = {}
    
    def to_dict(self):
        return self.dict()

class CrawlerTaskResult(BaseModel):
    task_id: str
    status: str
    result: Optional[CrawlResult] = None
    error: Optional[str] = None
    timestamp: float

class DispatchResult(BaseModel):
    task_id: str
    status: str
    url: str
    callback_url: Optional[str] = None
    metadata: Dict[str, Any] = {}

class CacheMode(str, Enum):
    MEMORY = "memory"
    DISK = "disk"
    NONE = "none"

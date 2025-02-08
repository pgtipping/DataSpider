from pydantic import BaseModel

class BrowserConfig(BaseModel):
    browser_type: str = "chromium"
    headless: bool = True
    viewport_width: int = 1920
    viewport_height: int = 1080

class CrawlerRunConfig(BaseModel):
    cache_mode: str = "use"
    timeout: int = 30

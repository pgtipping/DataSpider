from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel
from bs4 import BeautifulSoup

class ExtractionStrategy(BaseModel):
    include_html: bool = False
    include_text: bool = True
    
    class Config:
        arbitrary_types_allowed = True

    def extract(self, html: str) -> str:
        raise NotImplementedError

class BasicExtraction(ExtractionStrategy):
    def extract(self, html: str) -> str:
        soup = BeautifulSoup(html, 'html.parser')
        if self.include_html and self.include_text:
            return str(soup)
        if self.include_html:
            return html
        return soup.get_text()

# Default extraction strategy
default_extraction_strategy = BasicExtraction()

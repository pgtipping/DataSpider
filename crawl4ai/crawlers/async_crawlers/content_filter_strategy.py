from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel

class ContentFilterStrategy(BaseModel):
    min_length: int = 100
    max_length: int = 5000
    allowed_tags: List[str] = ['p', 'div', 'article', 'main']
    
    class Config:
        arbitrary_types_allowed = True

    def filter(self, elements: List[str]) -> List[str]:
        raise NotImplementedError

class BasicContentFilter(ContentFilterStrategy):
    def filter(self, elements: List[str]) -> List[str]:
        return [
            elem for elem in elements 
            if self.min_length <= len(elem) <= self.max_length
        ]

class RelevantContentFilter(ContentFilterStrategy):
    def __init__(self, keywords: List[str] = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.keywords = keywords or []
        
    def filter(self, elements: List[str]) -> List[str]:
        filtered = []
        for elem in elements:
            if self.min_length <= len(elem) <= self.max_length:
                if not self.keywords or any(kw in elem.lower() for kw in self.keywords):
                    filtered.append(elem)
        return filtered

    def filter(self, elements: List[str]) -> List[str]:
        return [
            elem for elem in elements 
            if self.min_length <= len(elem) <= self.max_length
        ]

# Default content filter strategy
default_content_filter_strategy = BasicContentFilter()

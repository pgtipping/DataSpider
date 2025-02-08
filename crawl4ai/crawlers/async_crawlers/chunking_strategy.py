from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel
import re

class ChunkingStrategy(BaseModel):
    max_chunk_size: int = 2000
    overlap: int = 200
    
    class Config:
        arbitrary_types_allowed = True

    def chunk(self, text: str) -> List[str]:
        raise NotImplementedError

class IdentityChunking(ChunkingStrategy):
    """Returns the whole text as a single chunk"""
    def chunk(self, text: str) -> List[str]:
        return [text]

class NaiveChunking(ChunkingStrategy):
    def chunk(self, text: str) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + self.max_chunk_size, len(text))
            chunks.append(text[start:end])
            start = end - self.overlap
        return chunks

class RegexChunking(ChunkingStrategy):
    def __init__(self, pattern: str = r'\n\n', *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pattern = re.compile(pattern)
        
    def chunk(self, text: str) -> List[str]:
        splits = self.pattern.split(text)
        chunks = []
        current_chunk = ""
        
        for split in splits:
            if len(current_chunk) + len(split) <= self.max_chunk_size:
                current_chunk += split
            else:
                chunks.append(current_chunk)
                current_chunk = split[-self.overlap:] + split
                
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks

# Default chunking strategy
default_chunking_strategy = NaiveChunking()

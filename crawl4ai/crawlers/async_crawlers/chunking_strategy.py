from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel

class ChunkingStrategy(BaseModel):
    max_chunk_size: int = 2000
    overlap: int = 200
    
    class Config:
        arbitrary_types_allowed = True

    def chunk(self, text: str) -> List[str]:
        raise NotImplementedError

class NaiveChunking(ChunkingStrategy):
    def chunk(self, text: str) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + self.max_chunk_size, len(text))
            chunks.append(text[start:end])
            start = end - self.overlap
        return chunks

# Default chunking strategy
default_chunking_strategy = NaiveChunking()

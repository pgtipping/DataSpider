from enum import Enum
import time
from typing import Dict, Any, Optional

class CacheMode(Enum):
    NONE = "none"
    MEMORY = "memory"
    DISK = "disk"
    CLOUD = "cloud"

def _legacy_to_cache_mode(mode: str) -> CacheMode:
    """Convert legacy string cache mode to CacheMode enum"""
    mode = mode.lower()
    if mode == "memory":
        return CacheMode.MEMORY
    elif mode == "disk":
        return CacheMode.DISK
    elif mode == "cloud":
        return CacheMode.CLOUD
    return CacheMode.NONE

class CacheContext:
    """Context manager for caching data in async crawlers"""
    
    def __init__(self, max_age: int = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_age = max_age

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if it exists and is not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.max_age:
                return entry['value']
            del self.cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        """Set a value in the cache"""
        self.cache[key] = {
            'value': value,
            'timestamp': time.time()
        }

    def clear(self) -> None:
        """Clear the entire cache"""
        self.cache.clear()

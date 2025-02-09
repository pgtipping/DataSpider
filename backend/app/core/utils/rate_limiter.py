"""Rate limiting utilities for the Crawl4AI backend."""

import time
from typing import Dict, Callable, Any, Awaitable
from functools import wraps
import logging
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiter implementation using token bucket algorithm."""
    
    def __init__(self, requests: int, period: int):
        """
        Initialize rate limiter.
        
        Args:
            requests: Number of requests allowed per period
            period: Time period in seconds
        """
        self.requests = requests
        self.period = period
        self.tokens: Dict[str, tuple[int, float]] = {}
        self.last_check: Dict[str, float] = {}
        
    def _get_tokens(self, key: str) -> int:
        """Get current number of tokens for a key."""
        now = time.time()
        last_check = self.last_check.get(key, 0.0)
        current_tokens = self.tokens.get(key, (self.requests, now))[0]
        
        # Calculate token replenishment
        time_passed = now - last_check
        tokens_to_add = int((time_passed * self.requests) / self.period)
        new_tokens = min(current_tokens + tokens_to_add, self.requests)
        
        self.tokens[key] = (new_tokens, now)
        self.last_check[key] = now
        return new_tokens
        
    def _update_tokens(self, key: str, tokens: int):
        """Update tokens for a key."""
        self.tokens[key] = (tokens, time.time())
        
    def can_request(self, key: str) -> bool:
        """Check if a request is allowed for the given key."""
        current_tokens = self._get_tokens(key)
        if current_tokens > 0:
            self._update_tokens(key, current_tokens - 1)
            return True
        return False

def rate_limit(requests: int, period: int = 60):
    """
    Rate limiting decorator for FastAPI endpoints.
    
    Args:
        requests: Number of requests allowed per period
        period: Time period in seconds (default: 60)
        
    Returns:
        Callable: Decorated function
        
    Raises:
        HTTPException: When rate limit is exceeded
    """
    limiter = RateLimiter(requests, period)
    
    def decorator(func: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Use client IP as rate limit key
            # In production, you might want to use X-Forwarded-For or similar
            request: Request = kwargs.get("request", args[0])
            if not request or not request.client:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid request"
                )
            client_ip = request.client.host
            
            if not limiter.can_request(client_ip):
                logger.warning(f"Rate limit exceeded for {client_ip}")
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again later."
                )
                
            return await func(*args, **kwargs)
            
        return wrapper
        
    return decorator 
"""Tests for utility functions."""

import pytest
from fastapi import HTTPException
from app.core.utils.validation import (
    validate_url,
    validate_selector,
    validate_file_path,
    validate_json_data
)
from app.core.utils.rate_limiter import RateLimiter, rate_limit

def test_validate_url():
    """Test URL validation."""
    # Valid URLs
    assert validate_url("https://example.com")
    assert validate_url("http://localhost:8000")
    assert validate_url("https://sub.domain.com/path?query=1")
    
    # Invalid URLs
    assert not validate_url("not_a_url")
    assert not validate_url("ftp://example.com")
    assert not validate_url("http://")
    assert not validate_url("https://")

def test_validate_selector():
    """Test CSS selector validation."""
    # Valid selectors
    assert validate_selector("div.class")
    assert validate_selector("#id")
    assert validate_selector("div > p")
    assert validate_selector("div[attr='value']")
    
    # Invalid selectors
    assert not validate_selector("")
    assert not validate_selector("<div>")
    assert not validate_selector("div{color:red}")
    assert not validate_selector("div[attr='value'")

def test_validate_file_path():
    """Test file path validation."""
    # Valid paths
    assert validate_file_path("file.txt")
    assert validate_file_path("folder/file.txt")
    assert validate_file_path("folder\\file.txt")
    
    # Invalid paths
    assert not validate_file_path("")
    assert not validate_file_path("/absolute/path")
    assert not validate_file_path("../parent/path")
    assert not validate_file_path("file*.txt")

def test_validate_json_data():
    """Test JSON data validation."""
    # Valid JSON
    assert validate_json_data('{"key": "value"}')
    assert validate_json_data('[1, 2, 3]')
    assert validate_json_data('null')
    
    # Invalid JSON
    assert not validate_json_data('{key: "value"}')
    assert not validate_json_data('[1, 2,]')
    assert not validate_json_data('{"key": value}')

def test_rate_limiter():
    """Test rate limiter functionality."""
    limiter = RateLimiter(requests=2, period=1)
    
    # First two requests should be allowed
    assert limiter.can_request("test_key")
    assert limiter.can_request("test_key")
    
    # Third request should be denied
    assert not limiter.can_request("test_key")
    
    # Different key should be allowed
    assert limiter.can_request("different_key")
    
    # Wait for token replenishment
    import time
    time.sleep(1)
    assert limiter.can_request("test_key")

@pytest.mark.asyncio
async def test_rate_limit_decorator():
    """Test rate limit decorator."""
    # Create a test endpoint
    @rate_limit(requests=2, period=1)
    async def test_endpoint(request):
        return {"status": "success"}
        
    # Create a mock request
    class MockClient:
        host = "127.0.0.1"
        
    class MockRequest:
        client = MockClient()
        
    request = MockRequest()
    
    # First two requests should succeed
    await test_endpoint(request)
    await test_endpoint(request)
    
    # Third request should raise HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await test_endpoint(request)
    assert exc_info.value.status_code == 429
    
    # Wait for token replenishment
    time.sleep(1)
    # Should succeed again
    await test_endpoint(request) 
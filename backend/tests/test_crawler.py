import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.crawler import Crawler
from app.core.utils.validation import validate_url
import os
import json
from pathlib import Path

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_validate_url():
    """Test URL validation function."""
    # Valid URLs
    assert validate_url("https://example.com")
    assert validate_url("http://localhost:8000")
    assert validate_url("https://sub.domain.com/path?query=1")
    
    # Invalid URLs
    assert not validate_url("not_a_url")
    assert not validate_url("ftp://example.com")
    assert not validate_url("http://")

@pytest.mark.asyncio
async def test_crawler_initialization():
    """Test crawler initialization."""
    crawler = Crawler(
        max_depth=2,
        max_pages=5,
        follow_external=False,
        extract_images=True,
        extract_text=True,
        extract_links=True
    )
    
    assert crawler.max_depth == 2
    assert crawler.max_pages == 5
    assert not crawler.follow_external
    assert crawler.extract_images
    assert crawler.extract_text
    assert crawler.extract_links

@pytest.mark.asyncio
async def test_crawler_extract_page():
    """Test single page extraction."""
    # Create test HTML file
    test_html = """
    <!DOCTYPE html>
    <html>
    <head><title>Test Page</title></head>
    <body>
        <h1>Test Content</h1>
        <img src="test.jpg" alt="Test Image">
        <a href="https://example.com">Test Link</a>
    </body>
    </html>
    """
    
    test_dir = Path("tests/data")
    test_dir.mkdir(parents=True, exist_ok=True)
    test_file = test_dir / "test.html"
    
    with open(test_file, "w") as f:
        f.write(test_html)
        
    # Test extraction
    crawler = Crawler(max_depth=1, max_pages=1)
    data = await crawler.extract_page(f"file://{test_file}")
    
    assert data["title"] == "Test Page"
    assert len(data["images"]) == 1
    assert len(data["links"]) == 1
    assert "Test Content" in data["text"]
    
    # Cleanup
    test_file.unlink()
    test_dir.rmdir()

@pytest.mark.asyncio
async def test_crawler_with_selector():
    """Test page extraction with selector."""
    crawler = Crawler(max_depth=1, max_pages=1)
    
    # Test with a simple selector
    data = await crawler.extract_page(
        "https://example.com",
        selector="h1"
    )
    
    assert "selector_matches" in data
    assert isinstance(data["selector_matches"], list)

def test_crawler_api_endpoints():
    """Test crawler API endpoints."""
    # Test crawl endpoint
    response = client.post(
        "/api/v1/crawler/crawl",
        json={
            "url": "https://example.com",
            "max_depth": 1,
            "max_pages": 1
        }
    )
    assert response.status_code in [200, 202]
    
    if response.status_code == 200:
        data = response.json()
        assert "task_id" in data
        assert data["status"] == "started"
        
        # Test status endpoint
        status_response = client.get(f"/api/v1/crawler/status/{data['task_id']}")
        assert status_response.status_code in [200, 404]

def test_playground_api_endpoints():
    """Test playground API endpoints."""
    # Test extract endpoint
    response = client.post(
        "/api/v1/playground/extract",
        json={
            "url": "https://example.com",
            "selector": "h1"
        }
    )
    assert response.status_code == 200
    
    data = response.json()
    assert "url" in data
    assert "data" in data
    assert "selector_matches" in data 
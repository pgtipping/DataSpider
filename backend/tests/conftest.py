import pytest
import os
import asyncio
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.core.crawler import Crawler

# Set up test environment variables
os.environ["TESTING"] = "true"
os.environ["DATA_DIR"] = "tests/data"
os.environ["CACHE_DIR"] = "tests/data/cache"
os.environ["LOG_FILE"] = "tests/logs/test.log"

# Create test directories
for dir_path in ["tests/data", "tests/data/cache", "tests/logs"]:
    Path(dir_path).mkdir(parents=True, exist_ok=True)

@pytest.fixture
def test_client():
    """Create a test client for the FastAPI application."""
    with TestClient(app) as client:
        yield client

@pytest.fixture
async def crawler():
    """Create a Crawler instance for testing."""
    crawler = Crawler(
        max_depth=1,
        max_pages=1,
        follow_external=False,
        extract_images=True,
        extract_text=True,
        extract_links=True
    )
    
    await crawler.start()
    yield crawler
    await crawler.close()

@pytest.fixture
def test_url():
    """Return a test URL."""
    return "https://example.com"

@pytest.fixture
def test_html():
    """Return test HTML content."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Test Page</title></head>
    <body>
        <h1>Test Content</h1>
        <img src="test.jpg" alt="Test Image">
        <a href="https://example.com">Test Link</a>
        <div class="content">
            <p>Test paragraph 1</p>
            <p>Test paragraph 2</p>
        </div>
    </body>
    </html>
    """

@pytest.fixture
def test_html_file(test_html):
    """Create a temporary test HTML file."""
    test_file = Path("tests/data/test.html")
    
    with open(test_file, "w") as f:
        f.write(test_html)
        
    yield test_file
    
    # Cleanup
    if test_file.exists():
        test_file.unlink()

@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

def pytest_configure(config):
    """Configure pytest settings."""
    config.addinivalue_line(
        "markers",
        "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers",
        "integration: marks tests as integration tests"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection."""
    # Add slow marker to tests that take longer than 1 second
    for item in items:
        if "crawler" in item.keywords:
            item.add_marker(pytest.mark.slow)
            
        if "api" in item.keywords:
            item.add_marker(pytest.mark.integration) 
"""Tests for playground service."""

import pytest
from fastapi import WebSocket
from app.services.playground_service import PlaygroundService

@pytest.fixture
def playground_service():
    """Create a PlaygroundService instance for testing."""
    return PlaygroundService()

class MockWebSocket:
    """Mock WebSocket for testing."""
    
    def __init__(self):
        self.messages = []
        self.closed = False
        
    async def accept(self):
        pass
        
    async def send_json(self, data):
        self.messages.append(data)
        
    async def close(self):
        self.closed = True

@pytest.mark.asyncio
async def test_websocket_connection(playground_service):
    """Test WebSocket connection handling."""
    client_id = "test_client"
    websocket = MockWebSocket()
    
    # Test connection
    await playground_service.connect(client_id, websocket)
    assert client_id in playground_service.websockets
    
    # Test sending update
    test_data = {"status": "test"}
    await playground_service.send_update(client_id, test_data)
    assert len(websocket.messages) == 1
    assert websocket.messages[0] == test_data
    
    # Test disconnection
    await playground_service.disconnect(client_id)
    assert client_id not in playground_service.websockets

@pytest.mark.asyncio
async def test_execute_crawl(playground_service):
    """Test crawl execution."""
    # Test with valid URL
    result = await playground_service.execute_crawl(
        url="https://example.com",
        extract_images=True,
        extract_text=True,
        extract_links=True
    )
    assert isinstance(result, dict)
    assert "text" in result
    
    # Test with invalid URL
    with pytest.raises(ValueError):
        await playground_service.execute_crawl("not_a_url")
        
    # Test with invalid selector
    with pytest.raises(ValueError):
        await playground_service.execute_crawl(
            url="https://example.com",
            selector="invalid<selector>"
        )

@pytest.mark.asyncio
async def test_validate_selector(playground_service):
    """Test selector validation."""
    # Test with valid selector
    matches = await playground_service.validate_selector(
        url="https://example.com",
        selector="div.content"
    )
    assert isinstance(matches, list)
    
    # Test with invalid URL
    with pytest.raises(ValueError):
        await playground_service.validate_selector(
            url="not_a_url",
            selector="div"
        )
        
    # Test with invalid selector
    with pytest.raises(ValueError):
        await playground_service.validate_selector(
            url="https://example.com",
            selector="div{color:red}"
        )

def test_cleanup_old_sessions(playground_service):
    """Test session cleanup."""
    from datetime import datetime, timedelta
    
    # Add test sessions
    old_time = datetime.now() - timedelta(hours=2)
    recent_time = datetime.now() - timedelta(minutes=30)
    
    playground_service.active_sessions = {
        "old_session": {
            "start_time": old_time,
            "data": {}
        },
        "recent_session": {
            "start_time": recent_time,
            "data": {}
        }
    }
    
    # Run cleanup (1 hour max age)
    playground_service.cleanup_old_sessions(max_age_hours=1)
    
    # Verify old session is removed
    assert "old_session" not in playground_service.active_sessions
    # Verify recent session remains
    assert "recent_session" in playground_service.active_sessions 
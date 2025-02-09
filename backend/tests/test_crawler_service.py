"""Tests for crawler service."""

import pytest
from datetime import datetime, timedelta
from pathlib import Path
import json
import asyncio
from app.services.crawler_service import CrawlerService

@pytest.fixture
def crawler_service():
    """Create a CrawlerService instance for testing."""
    service = CrawlerService()
    # Override results directory for testing
    service.results_dir = Path("tests/data/results")
    service.results_dir.mkdir(parents=True, exist_ok=True)
    yield service
    # Cleanup after tests
    for file in service.results_dir.glob("*.json"):
        file.unlink()
    service.results_dir.rmdir()

@pytest.mark.asyncio
async def test_start_crawl(crawler_service):
    """Test starting a crawl operation."""
    # Test with valid URL
    task_id = await crawler_service.start_crawl(
        url="https://example.com",
        max_depth=1,
        max_pages=1
    )
    assert task_id.startswith("crawl_")
    assert task_id in crawler_service.active_crawls
    
    # Test with invalid URL
    with pytest.raises(ValueError):
        await crawler_service.start_crawl("not_a_url")

@pytest.mark.asyncio
async def test_get_status(crawler_service):
    """Test getting crawl status."""
    # Start a test crawl
    task_id = await crawler_service.start_crawl(
        url="https://example.com",
        max_depth=1,
        max_pages=1
    )
    
    # Test status retrieval
    status = crawler_service.get_status(task_id)
    assert "status" in status
    assert "start_time" in status
    assert status["status"] in ["starting", "running"]
    
    # Test with invalid task ID
    with pytest.raises(KeyError):
        crawler_service.get_status("invalid_task_id")

@pytest.mark.asyncio
async def test_delete_task(crawler_service):
    """Test deleting a crawl task."""
    # Start a test crawl
    task_id = await crawler_service.start_crawl(
        url="https://example.com",
        max_depth=1,
        max_pages=1
    )
    
    # Create a test result file
    result_file = crawler_service.results_dir / f"{task_id}.json"
    result_file.write_text("[]")
    
    # Delete task
    crawler_service.delete_task(task_id)
    
    # Verify task and results are deleted
    assert task_id not in crawler_service.active_crawls
    assert not result_file.exists()
    
    # Test with invalid task ID
    with pytest.raises(KeyError):
        crawler_service.delete_task("invalid_task_id")

def test_cleanup_old_tasks(crawler_service):
    """Test cleaning up old tasks."""
    # Add some test tasks
    old_time = datetime.now() - timedelta(hours=25)
    recent_time = datetime.now() - timedelta(hours=1)
    
    crawler_service.active_crawls = {
        "old_completed": {
            "status": "completed",
            "start_time": old_time,
            "url": "https://example.com"
        },
        "old_failed": {
            "status": "failed",
            "start_time": old_time,
            "url": "https://example.com"
        },
        "recent_completed": {
            "status": "completed",
            "start_time": recent_time,
            "url": "https://example.com"
        },
        "running": {
            "status": "running",
            "start_time": old_time,
            "url": "https://example.com"
        }
    }
    
    # Run cleanup
    crawler_service.cleanup_old_tasks(max_age_hours=24)
    
    # Verify old completed/failed tasks are removed
    assert "old_completed" not in crawler_service.active_crawls
    assert "old_failed" not in crawler_service.active_crawls
    
    # Verify recent and running tasks remain
    assert "recent_completed" in crawler_service.active_crawls
    assert "running" in crawler_service.active_crawls

def test_get_active_tasks(crawler_service):
    """Test getting list of active tasks."""
    # Add some test tasks
    now = datetime.now()
    crawler_service.active_crawls = {
        "task1": {
            "status": "running",
            "start_time": now,
            "url": "https://example1.com"
        },
        "task2": {
            "status": "completed",
            "start_time": now,
            "url": "https://example2.com"
        },
        "task3": {
            "status": "running",
            "start_time": now,
            "url": "https://example3.com"
        }
    }
    
    # Get active tasks
    active_tasks = crawler_service.get_active_tasks()
    
    # Verify only running tasks are returned
    assert len(active_tasks) == 2
    assert all(task["status"] == "running" for task in active_tasks)
    assert {task["url"] for task in active_tasks} == {
        "https://example1.com",
        "https://example3.com"
    } 
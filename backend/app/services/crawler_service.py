"""Service layer for web crawling operations."""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from pathlib import Path
import json
import os

from ..core.crawler import Crawler
from ..core.utils.validation import validate_url
from ..core.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

class CrawlerService:
    """Service for managing web crawling operations."""
    
    def __init__(self):
        """Initialize the crawler service."""
        self.active_crawls: Dict[str, Dict[str, Any]] = {}
        self.results_dir = Path("data/results")
        self.results_dir.mkdir(parents=True, exist_ok=True)
        
        # Rate limiter for crawling (5 requests per minute per domain)
        self.rate_limiter = RateLimiter(requests=5, period=60)
        
    async def start_crawl(
        self,
        url: str,
        max_depth: int = 1,
        max_pages: int = 10,
        follow_external: bool = False,
        extract_images: bool = True,
        extract_text: bool = True,
        extract_links: bool = True,
        user_agent: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Start a new crawl operation.
        
        Args:
            url: Target URL to crawl
            max_depth: Maximum depth to crawl (default: 1)
            max_pages: Maximum number of pages to crawl (default: 10)
            follow_external: Whether to follow external links (default: False)
            extract_images: Whether to extract images (default: True)
            extract_text: Whether to extract text content (default: True)
            extract_links: Whether to extract links (default: True)
            user_agent: Custom user agent string (default: None)
            headers: Custom HTTP headers (default: None)
            
        Returns:
            str: Task ID for the crawl operation
            
        Raises:
            ValueError: If URL is invalid
        """
        # Validate URL
        if not validate_url(url):
            raise ValueError(f"Invalid URL: {url}")
            
        # Generate task ID
        task_id = f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(url)}"
        
        # Initialize crawler with configuration
        crawler = Crawler(
            max_depth=max_depth,
            max_pages=max_pages,
            follow_external=follow_external,
            extract_images=extract_images,
            extract_text=extract_text,
            extract_links=extract_links,
            user_agent=user_agent,
            headers=headers
        )
        
        # Store crawl info
        self.active_crawls[task_id] = {
            "url": url,
            "status": "starting",
            "start_time": datetime.now(),
            "crawler": crawler,
            "results": []
        }
        
        # Start crawling in background
        asyncio.create_task(self._run_crawl(task_id, url))
        
        return task_id
        
    async def _run_crawl(self, task_id: str, url: str):
        """
        Run the crawl operation in background.
        
        Args:
            task_id: Task identifier
            url: Target URL
        """
        try:
            crawl_info = self.active_crawls[task_id]
            crawler = crawl_info["crawler"]
            
            # Update status
            crawl_info["status"] = "running"
            
            # Start crawler
            async with crawler:
                results = await crawler.crawl(url, task_id)
                
            # Store results
            self._save_results(task_id, results)
            
            # Update status
            crawl_info["status"] = "completed"
            crawl_info["end_time"] = datetime.now()
            crawl_info["results"] = results
            
        except Exception as e:
            logger.error(f"Crawl failed for task {task_id}: {str(e)}")
            if task_id in self.active_crawls:
                self.active_crawls[task_id]["status"] = "failed"
                self.active_crawls[task_id]["error"] = str(e)
                
    def _save_results(self, task_id: str, results: List[Dict[str, Any]]):
        """
        Save crawl results to file.
        
        Args:
            task_id: Task identifier
            results: Crawl results to save
        """
        try:
            result_file = self.results_dir / f"{task_id}.json"
            with open(result_file, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Failed to save results for task {task_id}: {str(e)}")
            
    def get_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get status of a crawl operation.
        
        Args:
            task_id: Task identifier
            
        Returns:
            dict: Status information including:
                - status: Current status (starting/running/completed/failed)
                - start_time: When the crawl started
                - end_time: When the crawl completed (if finished)
                - error: Error message (if failed)
                - results: Crawl results (if completed)
                
        Raises:
            KeyError: If task_id is not found
        """
        if task_id not in self.active_crawls:
            raise KeyError(f"Task {task_id} not found")
            
        crawl_info = self.active_crawls[task_id]
        return {
            "status": crawl_info["status"],
            "start_time": crawl_info["start_time"].isoformat(),
            "end_time": crawl_info.get("end_time", "").isoformat() if crawl_info.get("end_time") else None,
            "error": crawl_info.get("error"),
            "results": crawl_info.get("results", [])
        }
        
    def delete_task(self, task_id: str):
        """
        Delete a crawl task and its results.
        
        Args:
            task_id: Task identifier
            
        Raises:
            KeyError: If task_id is not found
        """
        if task_id not in self.active_crawls:
            raise KeyError(f"Task {task_id} not found")
            
        # Remove from active crawls
        del self.active_crawls[task_id]
        
        # Delete results file if exists
        result_file = self.results_dir / f"{task_id}.json"
        if result_file.exists():
            result_file.unlink()
            
    def cleanup_old_tasks(self, max_age_hours: int = 24):
        """
        Clean up old completed or failed tasks.
        
        Args:
            max_age_hours: Maximum age in hours before cleanup (default: 24)
        """
        now = datetime.now()
        tasks_to_delete = []
        
        for task_id, info in self.active_crawls.items():
            if info["status"] in ["completed", "failed"]:
                age = now - info["start_time"]
                if age.total_seconds() > max_age_hours * 3600:
                    tasks_to_delete.append(task_id)
                    
        for task_id in tasks_to_delete:
            try:
                self.delete_task(task_id)
            except Exception as e:
                logger.error(f"Failed to cleanup task {task_id}: {str(e)}")
                
    def get_active_tasks(self) -> List[Dict[str, Any]]:
        """
        Get list of all active tasks.
        
        Returns:
            list: List of task information dictionaries
        """
        return [
            {
                "task_id": task_id,
                "url": info["url"],
                "status": info["status"],
                "start_time": info["start_time"].isoformat()
            }
            for task_id, info in self.active_crawls.items()
            if info["status"] == "running"
        ] 
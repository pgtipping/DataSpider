from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
import os
from pathlib import Path
from datetime import datetime
from ..core.crawler import Crawler
from ..core.utils.validation import validate_url
from ..core.utils.rate_limiter import rate_limit
import json

router = APIRouter()

class CrawlRequest(BaseModel):
    url: HttpUrl
    max_depth: Optional[int] = 1
    max_pages: Optional[int] = 10
    follow_external: Optional[bool] = False
    extract_images: Optional[bool] = True
    extract_text: Optional[bool] = True
    extract_links: Optional[bool] = True
    user_agent: Optional[str] = None
    headers: Optional[Dict[str, str]] = None

class CrawlResponse(BaseModel):
    task_id: str
    status: str
    message: str
    timestamp: datetime

@router.post("/crawl", response_model=CrawlResponse)
@rate_limit(requests=1, period=60)
async def start_crawl(
    request: CrawlRequest,
    background_tasks: BackgroundTasks
) -> CrawlResponse:
    """
    Start a new crawling task.
    """
    try:
        # Validate URL
        if not validate_url(str(request.url)):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Create crawler instance
        crawler = Crawler(
            max_depth=request.max_depth,
            max_pages=request.max_pages,
            follow_external=request.follow_external,
            extract_images=request.extract_images,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            user_agent=request.user_agent or os.getenv("USER_AGENT"),
            headers=request.headers or {}
        )
        
        # Generate task ID
        task_id = f"crawl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"
        
        # Add task to background
        background_tasks.add_task(
            crawler.crawl,
            str(request.url),
            task_id=task_id
        )
        
        return CrawlResponse(
            task_id=task_id,
            status="started",
            message="Crawling task has been started",
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{task_id}", response_model=Dict[str, Any])
async def get_status(task_id: str) -> Dict[str, Any]:
    """
    Get the status of a crawling task.
    """
    try:
        # Check if task exists
        task_file = Path(os.getenv("DATA_DIR")) / f"{task_id}.json"
        if not task_file.exists():
            raise HTTPException(status_code=404, detail="Task not found")
            
        # Read task status
        with open(task_file, "r") as f:
            status = json.load(f)
            
        return status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/task/{task_id}")
async def delete_task(task_id: str) -> JSONResponse:
    """
    Delete a crawling task and its associated data.
    """
    try:
        # Check if task exists
        task_file = Path(os.getenv("DATA_DIR")) / f"{task_id}.json"
        if not task_file.exists():
            raise HTTPException(status_code=404, detail="Task not found")
            
        # Delete task file
        task_file.unlink()
        
        return JSONResponse(
            content={
                "status": "success",
                "message": f"Task {task_id} has been deleted",
                "timestamp": datetime.now().isoformat()
            },
            status_code=200
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
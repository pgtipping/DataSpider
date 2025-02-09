from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
import json
import os
from pathlib import Path
from datetime import datetime
from ..core.crawler import Crawler
from ..core.utils.validation import validate_url
from ..core.utils.rate_limiter import rate_limit

router = APIRouter()

class PlaygroundRequest(BaseModel):
    url: HttpUrl
    selector: Optional[str] = None
    extract_images: Optional[bool] = True
    extract_text: Optional[bool] = True
    extract_links: Optional[bool] = True
    user_agent: Optional[str] = None
    headers: Optional[Dict[str, str]] = None

class PlaygroundResponse(BaseModel):
    url: str
    timestamp: datetime
    data: Dict[str, Any]
    selector_matches: Optional[List[str]] = None

@router.post("/extract", response_model=PlaygroundResponse)
@rate_limit(requests=5, period=60)
async def extract_data(request: PlaygroundRequest) -> PlaygroundResponse:
    """
    Extract data from a single URL for testing purposes.
    """
    try:
        # Validate URL
        if not validate_url(str(request.url)):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Create crawler instance for single-page extraction
        crawler = Crawler(
            max_depth=0,
            max_pages=1,
            extract_images=request.extract_images,
            extract_text=request.extract_text,
            extract_links=request.extract_links,
            user_agent=request.user_agent or os.getenv("USER_AGENT"),
            headers=request.headers or {}
        )
        
        # Extract data
        data = await crawler.extract_page(
            str(request.url),
            selector=request.selector
        )
        
        return PlaygroundResponse(
            url=str(request.url),
            timestamp=datetime.now(),
            data=data,
            selector_matches=data.get("selector_matches")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/preview")
async def websocket_preview(websocket: WebSocket):
    """
    WebSocket endpoint for real-time preview of crawling results.
    """
    try:
        await websocket.accept()
        
        while True:
            try:
                # Receive message
                data = await websocket.receive_json()
                
                # Validate request
                request = PlaygroundRequest(**data)
                
                # Extract data
                result = await extract_data(request)
                
                # Send result
                await websocket.send_json(result.dict())
                
            except WebSocketDisconnect:
                break
                
            except Exception as e:
                await websocket.send_json({
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                
    except Exception as e:
        if websocket.client_state.connected:
            await websocket.close(code=1011, reason=str(e))

@router.post("/validate-selector")
async def validate_selector(
    request: Dict[str, str]
) -> JSONResponse:
    """
    Validate a CSS selector against a URL.
    """
    try:
        url = request.get("url")
        selector = request.get("selector")
        
        if not url or not selector:
            raise HTTPException(
                status_code=400,
                detail="Both URL and selector are required"
            )
            
        # Validate URL
        if not validate_url(url):
            raise HTTPException(
                status_code=400,
                detail="Invalid URL format"
            )
            
        # Create crawler instance
        crawler = Crawler(max_depth=0, max_pages=1)
        
        # Test selector
        matches = await crawler.test_selector(url, selector)
        
        return JSONResponse(
            content={
                "valid": True,
                "matches": len(matches),
                "sample": matches[:5] if matches else [],
                "timestamp": datetime.now().isoformat()
            },
            status_code=200
        )
        
    except Exception as e:
        return JSONResponse(
            content={
                "valid": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            },
            status_code=400
        ) 
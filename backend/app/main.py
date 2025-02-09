"""Main FastAPI application module."""

import json
import asyncio
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
from dotenv import load_dotenv
import datetime
from .services.playground_service import PlaygroundService

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(
    title="Web Crawler Service",
    description="A WebSocket-based web crawler service for extracting content from web pages.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

# Rate limiting middleware
if os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true":
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_middleware(BaseHTTPMiddleware, dispatch=limiter.middleware)

# Initialize services
playground_service = PlaygroundService()

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Web Crawler Service API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# Import and include routers
from app.routers import crawler, playground

app.include_router(crawler.router, prefix="/api/v1/crawler", tags=["crawler"])
app.include_router(playground.router, prefix="/api/v1/playground", tags=["playground"])

@app.websocket("/ws/playground/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for playground functionality.
    
    Args:
        websocket: WebSocket connection instance
        client_id: Unique identifier for the client
    """
    try:
        await playground_service.connect(client_id, websocket)
        
        while True:
            try:
                # Receive and parse message
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Handle different actions
                if data["action"] == "crawl":
                    result = await playground_service.execute_crawl(
                        url=data["url"],
                        selector=data.get("options", {}).get("selector"),
                        extract_images=data.get("options", {}).get("extract_images", False),
                        extract_text=data.get("options", {}).get("extract_text", True),
                        extract_links=data.get("options", {}).get("extract_links", False)
                    )
                    await playground_service.send_update(client_id, {
                        "status": "completed",
                        "data": result
                    })
                    
                elif data["action"] == "validate_selector":
                    matches = await playground_service.validate_selector(
                        url=data["url"],
                        selector=data["selector"]
                    )
                    await playground_service.send_update(client_id, {
                        "status": "completed",
                        "matches": matches
                    })
                    
                else:
                    await playground_service.send_update(client_id, {
                        "status": "error",
                        "error": f"Unknown action: {data['action']}"
                    })
                    
            except json.JSONDecodeError:
                await playground_service.send_update(client_id, {
                    "status": "error",
                    "error": "Invalid JSON message"
                })
                
            except KeyError as e:
                await playground_service.send_update(client_id, {
                    "status": "error",
                    "error": f"Missing required field: {str(e)}"
                })
                
            except ValueError as e:
                await playground_service.send_update(client_id, {
                    "status": "error",
                    "error": str(e)
                })
                
            except Exception as e:
                await playground_service.send_update(client_id, {
                    "status": "error",
                    "error": f"Internal error: {str(e)}"
                })
                
    except WebSocketDisconnect:
        await playground_service.disconnect(client_id)
        
    except Exception as e:
        # Ensure cleanup on any error
        await playground_service.disconnect(client_id)
        raise

# Cleanup task
@app.on_event("startup")
async def startup_event():
    """Run cleanup task on startup."""
    async def cleanup_task():
        while True:
            playground_service.cleanup_old_sessions()
            await asyncio.sleep(3600)  # Run every hour
            
    asyncio.create_task(cleanup_task())

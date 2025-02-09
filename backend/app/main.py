"""Main FastAPI application module."""

import os
import json
import asyncio
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette.datastructures import Secret
from pathlib import Path
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from .services.playground_service import PlaygroundService

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI application."""
    # Startup
    yield
    # Shutdown
    await playground_service.close()

app = FastAPI(
    title="Web Crawler Service",
    description="A WebSocket-based web crawler service for extracting content from web pages.",
    version="1.0.0",
    lifespan=lifespan
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

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
secret_key = Secret(str(os.getenv("SECRET_KEY", "")))
app.add_middleware(SessionMiddleware, secret_key=secret_key)

# Rate limiting middleware
if os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true":
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.middleware import SlowAPIMiddleware
    
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

# Initialize services
playground_service = PlaygroundService()

# Import and include routers
from .routers import playground
app.include_router(playground.router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Web Crawler Service API"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

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
                data: Dict[str, Any] = json.loads(message)
                
                # Handle different actions
                if data["action"] == "crawl":
                    result = await playground_service.execute_crawl(
                        url=str(data["url"]),
                        selector=str(data.get("options", {}).get("selector")),
                        extract_images=bool(data.get("options", {}).get("extract_images", False)),
                        extract_text=bool(data.get("options", {}).get("extract_text", True)),
                        extract_links=bool(data.get("options", {}).get("extract_links", False))
                    )
                    await playground_service.send_update(client_id, {
                        "type": "crawl_result",
                        "data": result
                    })
                    
                    # Schedule cleanup task
                    asyncio.create_task(cleanup_task())
                    
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

async def cleanup_task():
    """Background task to clean up resources."""
    await asyncio.sleep(60)  # Wait for 60 seconds
    # Add cleanup logic here if needed

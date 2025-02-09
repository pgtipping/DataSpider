"""Service for handling playground functionality."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import WebSocket
import validators
import cssselect
import asyncio

class PlaygroundService:
    """Service for handling playground functionality and WebSocket connections."""
    
    def __init__(self):
        """Initialize the playground service."""
        self.websockets: Dict[str, WebSocket] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, client_id: str, websocket: WebSocket) -> None:
        """Connect a client to the WebSocket service.
        
        Args:
            client_id: Unique identifier for the client
            websocket: WebSocket connection instance
        """
        await websocket.accept()
        self.websockets[client_id] = websocket
        self.active_sessions[client_id] = {
            "start_time": datetime.now(),
            "data": {}
        }
        
    async def disconnect(self, client_id: str) -> None:
        """Disconnect a client from the WebSocket service.
        
        Args:
            client_id: Unique identifier for the client
        """
        if client_id in self.websockets:
            await self.websockets[client_id].close()
            del self.websockets[client_id]
        if client_id in self.active_sessions:
            del self.active_sessions[client_id]
            
    async def send_update(self, client_id: str, data: Dict[str, Any]) -> None:
        """Send an update to a connected client.
        
        Args:
            client_id: Unique identifier for the client
            data: Update data to send
        """
        if client_id in self.websockets:
            await self.websockets[client_id].send_json(data)
            
    async def close(self) -> None:
        """Close all active WebSocket connections."""
        for client_id in list(self.websockets.keys()):
            await self.disconnect(client_id)
            
    async def execute_crawl(
        self,
        url: str,
        selector: Optional[str] = None,
        extract_images: bool = False,
        extract_text: bool = True,
        extract_links: bool = False
    ) -> Dict[str, Any]:
        """Execute a crawl operation on the specified URL.
        
        Args:
            url: Target URL to crawl
            selector: Optional CSS selector to filter content
            extract_images: Whether to extract image URLs
            extract_text: Whether to extract text content
            extract_links: Whether to extract links
            
        Returns:
            Dict containing extracted data
            
        Raises:
            ValueError: If URL or selector is invalid
        """
        if not validators.url(str(url)):
            raise ValueError("Invalid URL provided")
            
        if selector:
            try:
                cssselect.parse(selector)
            except Exception as e:
                raise ValueError(f"Invalid CSS selector: {str(e)}")
                
        # TODO: Implement actual crawling logic
        # This is a placeholder return
        return {
            "url": url,
            "text": "Sample extracted text",
            "images": [] if extract_images else None,
            "links": [] if extract_links else None
        }
        
    async def validate_selector(self, url: str, selector: str) -> List[str]:
        """Validate a CSS selector against a URL and return matching elements.
        
        Args:
            url: Target URL to validate against
            selector: CSS selector to validate
            
        Returns:
            List of matching element descriptions
            
        Raises:
            ValueError: If URL or selector is invalid
        """
        if not validators.url(str(url)):
            raise ValueError("Invalid URL provided")
            
        try:
            cssselect.parse(selector)
        except Exception as e:
            raise ValueError(f"Invalid CSS selector: {str(e)}")
            
        # TODO: Implement actual validation logic
        # This is a placeholder return
        return ["Sample matching element"]
        
    def cleanup_old_sessions(self, max_age_hours: float = 1.0) -> None:
        """Clean up sessions older than the specified age.
        
        Args:
            max_age_hours: Maximum age of sessions in hours
        """
        current_time = datetime.now()
        sessions_to_remove: List[str] = []
        
        for client_id, session in self.active_sessions.items():
            age = current_time - session["start_time"]
            if age.total_seconds() > max_age_hours * 3600:
                sessions_to_remove.append(client_id)
                
        for client_id in sessions_to_remove:
            if client_id in self.websockets:
                # Schedule disconnection in the background
                asyncio.create_task(self.disconnect(client_id))
            else:
                del self.active_sessions[client_id]

import asyncio
from typing import Dict, Any
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.lock = asyncio.Lock()

    async def connect(self, client_id: str, websocket: WebSocket):
        async with self.lock:
            await websocket.accept()
            self.active_connections[client_id] = websocket

    async def disconnect(self, client_id: str):
        async with self.lock:
            if client_id in self.active_connections:
                del self.active_connections[client_id]

    async def send_message(self, client_id: str, message: Dict[str, Any]):
        async with self.lock:
            if client_id in self.active_connections:
                await self.active_connections[client_id].send_json(message)

    async def broadcast(self, message: Dict[str, Any]):
        async with self.lock:
            for connection in self.active_connections.values():
                await connection.send_json(message)

ws_manager = WebSocketManager()

from fastapi import APIRouter, HTTPException, WebSocket
from pydantic import BaseModel
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from app.services.playground_service import playground_service
from app.services.ws_manager import ws_manager
import uuid

router = APIRouter()

# Existing validation models and endpoint kept intact

class CrawlExecutionRequest(BaseModel):
    config: dict
    client_id: str

class CrawlResultResponse(BaseModel):
    status: str
    result: dict = None
    pdf_url: str = None
    error: str = None

@router.post("/execute")
async def execute_crawl(request: CrawlExecutionRequest):
    try:
        job_id = await playground_service.execute_crawl(
            config=request.config,
            client_id=request.client_id
        )
        return {"job_id": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{job_id}", response_model=CrawlResultResponse)
async def get_results(job_id: str):
    results = playground_service.get_results(job_id)
    if not results:
        raise HTTPException(status_code=404, detail="Job not found")
    return results

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await ws_manager.connect(client_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except:
        await ws_manager.disconnect(client_id)

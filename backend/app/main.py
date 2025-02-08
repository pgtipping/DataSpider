from fastapi import FastAPI
from app.api.v1 import playground_router
from backend.app.core.security.security import setup_security

app = FastAPI(
    title="Crawl4AI Playground API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None
)

# Setup security middleware
setup_security(app)

# Include API routers
app.include_router(playground_router, prefix="/api/v1/playground")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

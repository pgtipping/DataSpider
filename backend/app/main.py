"""Main FastAPI application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import datetime

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(
    title="Crawl4AI API",
    description="API for web crawling and data extraction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]'))
methods = json.loads(os.getenv("CORS_METHODS", '["*"]'))
headers = json.loads(os.getenv("CORS_HEADERS", '["*"]'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=methods,
    allow_headers=headers,
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

@app.get("/")
async def root():
    return {"message": "Welcome to Crawl4AI API", "status": "active"}

@app.get("/health")
async def health_check():
    return JSONResponse(
        content={
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.datetime.now().isoformat()
        },
        status_code=200
    )

# Import and include routers
from app.routers import crawler, playground

app.include_router(crawler.router, prefix="/api/v1/crawler", tags=["crawler"])
app.include_router(playground.router, prefix="/api/v1/playground", tags=["playground"])

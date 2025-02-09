"""Script to run the FastAPI application."""

import os
import sys
from pathlib import Path

# Get absolute paths
backend_dir = Path(__file__).parent.absolute()
project_root = backend_dir.parent

# Add backend directory to Python path first (higher priority)
sys.path.insert(0, str(backend_dir))

# Set environment variables
os.environ["PYTHONPATH"] = str(backend_dir)
os.environ["CRAWL4AI_BASE_DIRECTORY"] = str(backend_dir / "data")
os.environ["CRAWL4AI_CACHE_DIR"] = str(backend_dir / "data" / "cache")
os.environ["CRAWL4AI_LOG_DIR"] = str(backend_dir / "data" / "logs")

# Create necessary directories
os.makedirs(os.environ["CRAWL4AI_CACHE_DIR"], exist_ok=True)
os.makedirs(os.environ["CRAWL4AI_LOG_DIR"], exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)],
        log_level="info"
    ) 
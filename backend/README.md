# Crawl4AI Backend

This is the backend server component of the Crawl4AI project. It provides a FastAPI-based server that handles web crawling requests and manages the playground functionality.

## Features

- FastAPI-based REST API
- WebSocket support for real-time updates
- Browser automation with Playwright
- Caching system for improved performance
- Rate limiting and security features

## Installation

1. Create a virtual environment:

```bash
python -m venv venv
source venv/Scripts/activate  # Windows
source venv/bin/activate      # Linux/Mac
```

2. Install dependencies:

```bash
pip install -r requirements.txt
pip install crawl4ai[all]
playwright install --with-deps
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create necessary directories:

```bash
mkdir -p data/temp data/cache logs
```

5. Install the package in development mode:

```bash
pip install -e .
```

## Running the Server

Development mode:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT License

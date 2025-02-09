# Crawl4AI Backend Setup Guide

## Overview

This document provides comprehensive instructions for setting up and running the Crawl4AI backend server, which powers the interactive playground.

## Prerequisites

- Python 3.10 or higher
- pip (Python package installer)
- Git
- Virtual environment tool (venv, conda, etc.)
- Node.js 18+ (for frontend)

## Directory Structure

```structure
backend/
├── app/                    # Main application code
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality
│   └── services/          # Business logic
├── data/                  # Data storage
│   ├── cache/            # Cache storage
│   └── logs/             # Log files
├── tests/                 # Test files
├── .env                   # Environment variables
├── requirements.txt       # Python dependencies
├── setup.py              # Package setup
└── run.py                # Application entry point
```

## Step-by-Step Setup

### 1. Environment Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development tools
pip install pip-tools black isort mypy pylint
```

### 2. Dependencies Installation

```bash
# Install backend dependencies
pip install -r requirements.txt

# Install crawl4ai with all features
pip install crawl4ai[all]

# Install playwright dependencies
playwright install --with-deps
```

### 3. Environment Configuration

Create a `.env` file in the backend directory with:

```env
PYTHONPATH=.
CRAWL4AI_BASE_DIRECTORY=./data
CRAWL4AI_CACHE_DIR=./data/cache
CRAWL4AI_LOG_DIR=./data/logs
```

### 4. Directory Structure Setup

```bash
# Create necessary directories
mkdir -p data/cache data/logs
```

### 5. Package Installation

```bash
# Install backend package in development mode
pip install -e .
```

## Running the Backend

### Development Mode

```bash
python run.py
```

The server will start at `http://localhost:8000` with:

- API documentation at `/api/docs`
- WebSocket endpoint at `/api/v1/playground/ws`
- Health check at `/health`

### Production Mode

For production deployment:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Troubleshooting

### Common Issues and Solutions

1. Import Errors

   - Ensure PYTHONPATH is set correctly
   - Verify all dependencies are installed
   - Check package versions compatibility

2. Module Not Found Errors

   - Run `pip install -e .` in backend directory
   - Verify virtual environment is activated
   - Check import paths in Python files

3. WebSocket Connection Issues

   - Ensure CORS settings are correct
   - Check client connection configuration
   - Verify WebSocket endpoint is accessible

4. Browser Automation Issues
   - Run `playwright install --with-deps`
   - Check browser dependencies are installed
   - Verify browser configurations

### Dependency Versions

Key package versions that are known to work together:

```txt
fastapi>=0.100.0
uvicorn>=0.22.0
pydantic>=2.0.0
python-multipart>=0.0.6
crawl4ai>=0.1.0
websockets>=11.0.3
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-dotenv>=1.0.0
aiofiles>=23.1.0
jinja2>=3.1.2
selenium>=4.15.0
webdriver-manager>=4.0.1
```

## Security Considerations

1. API Security

   - CORS is configured to allow all origins in development
   - Security headers are added via middleware
   - Input validation is enforced

2. File System Security

   - Cache directory permissions should be restricted
   - Log files should be properly rotated
   - Temporary files are cleaned up

3. Browser Automation Security
   - Sandbox is enabled by default
   - User data directory is isolated
   - Network requests are monitored

## Development Guidelines

1. Code Style

   - Follow PEP 8
   - Use type hints
   - Document public APIs

2. Testing

   - Write unit tests for new features
   - Run tests before commits
   - Maintain test coverage

3. Error Handling
   - Use proper exception classes
   - Log errors appropriately
   - Return meaningful error messages

## Monitoring and Maintenance

1. Logging

   - Check logs in `data/logs`
   - Monitor WebSocket connections
   - Track API usage

2. Cache Management

   - Monitor cache size
   - Implement cache cleanup
   - Handle cache invalidation

3. Performance
   - Monitor memory usage
   - Track response times
   - Optimize resource usage

## Additional Resources

- FastAPI Documentation: <https://fastapi.tiangolo.com/>
- Crawl4AI Documentation: [Link to docs]
- Playwright Documentation: <https://playwright.dev/python/>
- WebSocket Guide: <https://fastapi.tiangolo.com/advanced/websockets/>

## Support

For issues and support:

1. Check the troubleshooting guide above
2. Review the logs
3. Open an issue on GitHub
4. Contact the development team

---

Last Updated: [Current Date]
Version: 1.0.0

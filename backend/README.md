# Backend Service

This is the backend service for the web crawler application. It provides a WebSocket-based playground for testing and experimenting with web crawling functionality.

## Features

- Real-time web crawling with WebSocket updates
- CSS selector validation
- Configurable content extraction (text, images, links)
- Session management with automatic cleanup

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn app.main:app --reload
```

The server will start on `http://localhost:8000` by default.

## Testing

Run the tests using pytest:

```bash
pytest
```

## API Documentation

Once the server is running, you can access:

- API documentation: `http://localhost:8000/docs`
- Alternative documentation: `http://localhost:8000/redoc`

## WebSocket Endpoints

### Playground WebSocket

Connect to `/ws/playground/{client_id}` to start a playground session.

Example client usage:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/playground/my-client-id");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

// Example crawl request
ws.send(
  JSON.stringify({
    action: "crawl",
    url: "https://example.com",
    options: {
      extract_text: true,
      extract_images: true,
      extract_links: true,
      selector: "div.content",
    },
  })
);
```

## Development

The service is built with:

- FastAPI for the web framework
- WebSockets for real-time communication
- Pytest for testing
- Type hints for better code quality

### Project Structure

```
backend/
├── app/
│   ├── services/
│   │   ├── __init__.py
│   │   └── playground_service.py
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_playground_service.py
├── requirements.txt
└── README.md
```

## License

MIT License

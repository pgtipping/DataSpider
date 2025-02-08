from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

def setup_security(app):
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response

    # Input validation middleware
    @app.middleware("http")
    async def validate_inputs(request: Request, call_next):
        try:
            if request.method in ["POST", "PUT"]:
                await request.json()
            return await call_next(request)
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid JSON payload"}
            )

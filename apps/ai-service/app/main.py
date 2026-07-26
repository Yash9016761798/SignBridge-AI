"""SignBridge AI Service - Main Application"""

import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.v1 import health, prediction
from app.core.logging import setup_logging

# Setup logging
setup_logging(level="DEBUG" if settings.debug else "INFO")
logger = logging.getLogger("signbridge.ai")

app = FastAPI(
    title="SignBridge AI Service",
    description="AI-powered Indian Sign Language recognition and translation service",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(prediction.router, prefix="/api/v1/ai", tags=["ai"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "errors": [{"field": "server", "message": "An unexpected error occurred"}],
            "meta": {"timestamp": datetime.utcnow().isoformat()},
        },
    )


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "SignBridge AI Service is running",
        "data": {
            "name": "SignBridge AI Service",
            "version": "0.1.0",
            "docs": "/api/docs",
            "status": "infrastructure_ready",
            "model_loaded": False,
        },
    }

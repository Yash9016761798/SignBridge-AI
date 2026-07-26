"""Global error handling for SignBridge AI Service"""

import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

logger = logging.getLogger("signbridge.ai")


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unhandled exceptions globally"""
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "errors": [{"field": "server", "message": "An unexpected error occurred"}],
            "meta": {"timestamp": datetime.utcnow().isoformat() if 'datetime' in dir() else ""},
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "errors": [{"field": "request", "message": str(exc.detail)}],
            "meta": {},
        },
    )

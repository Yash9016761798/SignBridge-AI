"""Health check endpoints for SignBridge AI Service"""

from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Check API health"""
    return {
        "success": True,
        "message": "AI Service is healthy",
        "data": {
            "status": "up",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "0.1.0",
        },
    }


@router.get("/ready")
async def readiness_check():
    """Check API readiness"""
    return {
        "success": True,
        "message": "AI Service is ready",
        "data": {
            "status": "ready",
        },
    }

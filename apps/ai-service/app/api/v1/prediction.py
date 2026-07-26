"""Prediction endpoints for SignBridge AI Service

All predictions are mock/stub responses until ML model integration.
DO NOT implement real inference yet.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.prediction import predict_mock, get_model_info

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make a mock gesture prediction

    Returns a simulated prediction with confidence score.
    This endpoint will be replaced with real ML inference later.
    """
    try:
        result = predict_mock(
            prediction_type=request.type.value,
            session_id=request.session_id,
            user_id=request.user_id,
        )

        return PredictionResponse(
            success=True,
            message="Mock prediction completed",
            data=result,
            meta={"timestamp": datetime.utcnow().isoformat()},
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/model/info")
async def model_info():
    """Get model information (stub)

    Returns metadata about the current model version and capabilities.
    """
    info = get_model_info()
    return {
        "success": True,
        "message": "Model info retrieved",
        "data": info,
        "meta": {"timestamp": datetime.utcnow().isoformat()},
    }


@router.get("/version")
async def version():
    """Get AI service version"""
    return {
        "success": True,
        "message": "Version retrieved",
        "data": {
            "service": "SignBridge AI Service",
            "version": "0.1.0",
            "model_version": "mock-v1.0.0",
            "status": "infrastructure_ready",
            "model_loaded": False,
            "python_version": "3.11+",
            "framework": "FastAPI",
        },
        "meta": {"timestamp": datetime.utcnow().isoformat()},
    }

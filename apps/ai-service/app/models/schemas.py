"""Pydantic schemas for SignBridge AI Service"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PredictionType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    LANDMARKS = "landmarks"


class PredictionRequest(BaseModel):
    """Request schema for gesture prediction"""
    type: PredictionType = Field(..., description="Type of input for prediction")
    session_id: Optional[str] = Field(None, description="Practice session ID")
    user_id: Optional[str] = Field(None, description="User ID")

    class Config:
        json_schema_extra = {
            "example": {
                "type": "image",
                "session_id": "session-123",
                "user_id": "user-456",
            }
        }


class PredictionResult(BaseModel):
    """Single prediction result"""
    gesture: str = Field(..., description="Predicted gesture label")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    alternatives: List[dict] = Field(default_factory=list, description="Alternative predictions")


class PredictionResponse(BaseModel):
    """Response schema for gesture prediction"""
    success: bool = True
    message: str = "Prediction completed"
    data: dict = Field(default_factory=dict, description="Prediction result")
    meta: dict = Field(default_factory=dict, description="Metadata")


class TranslationRequest(BaseModel):
    """Request schema for text-to-sign translation"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    target_language: str = Field(default="isl", description="Target sign language")
    session_id: Optional[str] = Field(None, description="Translation session ID")


class TranslationResponse(BaseModel):
    """Response schema for translation"""
    success: bool = True
    message: str = "Translation completed"
    data: dict = Field(default_factory=dict, description="Translation result")
    meta: dict = Field(default_factory=dict, description="Metadata")


class ModelInfoResponse(BaseModel):
    """Model information response"""
    success: bool = True
    message: str = "Model info retrieved"
    data: dict = Field(default_factory=dict, description="Model information")


class HealthResponse(BaseModel):
    """Health check response"""
    success: bool = True
    message: str = "Service is healthy"
    data: dict = Field(default_factory=dict)

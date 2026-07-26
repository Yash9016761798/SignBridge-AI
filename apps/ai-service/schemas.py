"""
Pydantic schemas for SignBridge AI request/response payloads.
"""
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    status: str = Field(..., description="Service health status")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    model_version: str = Field(..., description="Model version identifier")
    uptime_seconds: float = Field(..., description="Seconds since service start")


class ModelInfoResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str = Field(..., description="Model architecture name")
    model_version: str = Field(..., description="Model version")
    vocab_size: int = Field(..., description="Vocabulary size")
    d_model: int = Field(..., description="Model embedding dimension")
    num_heads: int = Field(..., description="Number of attention heads")
    num_encoder_layers: int = Field(..., description="Number of encoder layers")
    num_decoder_layers: int = Field(..., description="Number of decoder layers")
    num_parameters: int = Field(..., description="Total model parameters")
    max_seq_length: int = Field(..., description="Maximum sequence length")
    num_landmarks: int = Field(..., description="Number of pose landmarks")
    num_features: int = Field(..., description="Number of features per landmark")
    device: str = Field(..., description="Inference device")


class PoseFrame(BaseModel):
    landmarks: List[List[float]] = Field(
        ..., description="Pose landmarks as [[x, y, z, visibility, ...], ...], shape (33, 5)"
    )
    timestamp: Optional[float] = Field(None, description="Frame timestamp")


class PredictRequest(BaseModel):
    pose_sequence: List[List[List[float]]] = Field(
        ...,
        description="Sequence of pose frames, shape (T, 33, 5). Each frame is a list of 33 landmarks with 5 features.",
        min_length=1,
    )
    max_length: Optional[int] = Field(None, ge=1, le=100, description="Max generation length override")
    temperature: Optional[float] = Field(None, ge=0.1, le=2.0, description="Sampling temperature")


class TranslateRequest(BaseModel):
    frame: PoseFrame = Field(..., description="Single pose frame to translate")
    max_length: Optional[int] = Field(None, ge=1, le=100, description="Max generation length override")


class WebcamFrameRequest(BaseModel):
    frame_data: List[List[List[float]]] = Field(
        ...,
        description="Webcam pose frame sequence, shape (T, 33, 5)",
        min_length=1,
    )
    session_id: Optional[str] = Field(None, description="Client session identifier")


class Prediction(BaseModel):
    text: str = Field(..., description="Translated text")
    tokens: List[int] = Field(default_factory=list, description="Generated token IDs")


class PredictionResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prediction: Prediction = Field(..., description="Model prediction")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")
    processing_time_ms: float = Field(..., description="Inference time in milliseconds")
    model_version: str = Field(..., description="Model version used")


class TranslateResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prediction: Prediction = Field(..., description="Model prediction")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")
    processing_time_ms: float = Field(..., description="Inference time in milliseconds")
    model_version: str = Field(..., description="Model version used")


class WebcamResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    prediction: Prediction = Field(..., description="Model prediction")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")
    processing_time_ms: float = Field(..., description="Inference time in milliseconds")
    model_version: str = Field(..., description="Model version used")
    session_id: Optional[str] = Field(None, description="Session identifier echoed back")


class ErrorResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    error: str = Field(..., description="Error type")
    detail: str = Field(..., description="Error detail message")
    model_version: Optional[str] = Field(None, description="Model version if available")

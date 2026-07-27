"""
SignBridge AI Inference Service.
FastAPI application for ISL-to-text translation.
"""
import os
import random
import time
import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from collections import defaultdict
from datetime import datetime, timedelta

from config import Settings
from schemas import (
    HealthResponse, ModelInfoResponse,
    PredictRequest, TranslateRequest, WebcamFrameRequest,
    Prediction, PredictionResult, TranslateResult, WebcamResult,
    ErrorResponse,
)
from model_loader import load_model, ModelBundle
from inference_engine import InferenceEngine
from text_decoder import decode_prediction

# Demo mode imports
from demo import (
    generate_demo_sequence, get_demo_signs, get_demo_prediction, DEMO_SIGNS
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("signbridge.app")

settings = Settings.from_env()
DEMO_MODE = os.getenv("SIGNBRIDGE_DEMO_MODE", "false").lower() in ("true", "1", "yes")

bundle: Optional[ModelBundle] = None
engine: Optional[InferenceEngine] = None
_start_time: float = 0.0


@asynccontextmanager
async def lifespan(app: FastAPI):
    global bundle, engine, _start_time
    _start_time = time.time()

    if DEMO_MODE:
        logger.info("Running in DEMO MODE - using sample sequences")
        bundle = None
        engine = None
    else:
        ckpt = settings.resolve_checkpoint_path()
        vcb = settings.resolve_vocab_path()

        logger.info("Loading model from %s", ckpt)
        try:
            bundle = load_model(str(ckpt), str(vcb), device_str="cpu")
            engine = InferenceEngine(bundle)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error("Failed to load model: %s", e)
            bundle = None
            engine = None

    yield

    logger.info("Shutting down SignBridge AI service")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production AI inference service for Indian Sign Language to English translation.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


rate_limit_store: dict[str, list[datetime]] = defaultdict(list)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path in ("/health", "/readiness", "/liveness", "/docs", "/redoc", "/openapi.json"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    window = now - timedelta(minutes=1)
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if t > window
    ]
    if len(rate_limit_store[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=429,
            content={"error": "Rate limit exceeded", "detail": "Too many requests. Please try again later."},
        )
    rate_limit_store[client_ip].append(now)
    response = await call_next(request)
    return response


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="InternalServerError",
            detail=str(exc),
            model_version=settings.MODEL_VERSION,
        ).model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error="HTTPError",
            detail=str(exc.detail),
            model_version=settings.MODEL_VERSION,
        ).model_dump(),
    )


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    if DEMO_MODE:
        status = "demo"
    elif bundle is not None:
        status = "healthy"
    else:
        status = "degraded"

    return HealthResponse(
        status=status,
        model_loaded=bundle is not None,
        model_version=settings.MODEL_VERSION,
        uptime_seconds=round(time.time() - _start_time, 2),
    )


@app.get("/model/info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    """Return model architecture and configuration details."""
    if bundle is None:
        if DEMO_MODE:
            return ModelInfoResponse(
                model_name="PoseTransformer (Demo Mode)",
                model_version=settings.MODEL_VERSION,
                vocab_size=978,
                d_model=32,
                num_heads=4,
                num_encoder_layers=1,
                num_decoder_layers=1,
                num_parameters=90450,
                max_seq_length=30,
                num_landmarks=settings.NUM_LANDMARKS,
                num_features=settings.NUM_FEATURES,
                device="demo",
            )
        raise HTTPException(status_code=503, detail="Model not loaded")

    return ModelInfoResponse(
        model_name="PoseTransformer",
        model_version=settings.MODEL_VERSION,
        vocab_size=bundle.vocab_size,
        d_model=bundle.d_model,
        num_heads=bundle.num_heads,
        num_encoder_layers=bundle.num_encoder_layers,
        num_decoder_layers=bundle.num_decoder_layers,
        num_parameters=bundle.num_parameters,
        max_seq_length=bundle.max_seq_length,
        num_landmarks=settings.NUM_LANDMARKS,
        num_features=settings.NUM_FEATURES,
        device=str(bundle.device),
    )


@app.post("/predict", response_model=PredictionResult, tags=["Prediction"])
async def predict(request: PredictRequest):
    """Translate a sequence of pose frames to text."""
    if engine is None:
        if DEMO_MODE:
            sign_name = random.choice(list(DEMO_SIGNS.keys()))
            demo_pred = get_demo_prediction(sign_name)
            return PredictionResult(
                prediction=Prediction(text=demo_pred["text"], tokens=demo_pred["tokens"]),
                confidence=demo_pred["confidence"],
                processing_time_ms=demo_pred["processing_time_ms"],
                model_version=settings.MODEL_VERSION,
            )
        raise HTTPException(status_code=503, detail="Model not loaded")

    max_length = request.max_length or settings.MAX_GENERATION_LENGTH
    temperature = request.temperature or settings.TEMPERATURE

    raw = engine.predict(
        pose_sequence=request.pose_sequence,
        max_length=max_length,
        temperature=temperature,
    )

    decoded = decode_prediction(raw)

    return PredictionResult(
        prediction=Prediction(text=decoded["text"], tokens=decoded["tokens"]),
        confidence=round(decoded["confidence"], 4),
        processing_time_ms=round(decoded["processing_time_ms"], 2),
        model_version=settings.MODEL_VERSION,
    )


@app.post("/translate", response_model=TranslateResult, tags=["Translation"])
async def translate(request: TranslateRequest):
    """Translate a single pose frame to text."""
    if engine is None:
        if DEMO_MODE:
            sign_name = random.choice(list(DEMO_SIGNS.keys()))
            demo_pred = get_demo_prediction(sign_name)
            return TranslateResult(
                prediction=Prediction(text=demo_pred["text"], tokens=demo_pred["tokens"]),
                confidence=demo_pred["confidence"],
                processing_time_ms=demo_pred["processing_time_ms"],
                model_version=settings.MODEL_VERSION,
            )
        raise HTTPException(status_code=503, detail="Model not loaded")

    max_length = request.max_length or settings.MAX_GENERATION_LENGTH
    pose_data = [request.frame.landmarks]

    raw = engine.predict(
        pose_sequence=pose_data,
        max_length=max_length,
    )

    decoded = decode_prediction(raw)

    return TranslateResult(
        prediction=Prediction(text=decoded["text"], tokens=decoded["tokens"]),
        confidence=round(decoded["confidence"], 4),
        processing_time_ms=round(decoded["processing_time_ms"], 2),
        model_version=settings.MODEL_VERSION,
    )


@app.post("/webcam/frame", response_model=WebcamResult, tags=["Webcam"])
async def webcam_frame(request: WebcamFrameRequest):
    """Process a webcam frame for real-time translation."""
    if engine is None:
        if DEMO_MODE:
            # Demo mode: return a random demo prediction
            sign_name = random.choice(list(DEMO_SIGNS.keys()))
            demo_pred = get_demo_prediction(sign_name)
            return WebcamResult(
                prediction=Prediction(text=demo_pred["text"], tokens=demo_pred["tokens"]),
                confidence=demo_pred["confidence"],
                processing_time_ms=demo_pred["processing_time_ms"],
                model_version=settings.MODEL_VERSION,
                session_id=request.session_id,
            )
        raise HTTPException(status_code=503, detail="Model not loaded")

    raw = engine.predict(
        pose_sequence=request.frame_data,
        max_length=settings.MAX_GENERATION_LENGTH,
    )

    decoded = decode_prediction(raw)

    return WebcamResult(
        prediction=Prediction(text=decoded["text"], tokens=decoded["tokens"]),
        confidence=round(decoded["confidence"], 4),
        processing_time_ms=round(decoded["processing_time_ms"], 2),
        model_version=settings.MODEL_VERSION,
        session_id=request.session_id,
    )


# ============================================================
# Demo Mode Endpoints
# ============================================================

@app.get("/demo/signs", tags=["Demo"])
async def demo_list_signs():
    """List available demo signs for testing without a webcam."""
    return {"signs": get_demo_signs(), "demo_mode": DEMO_MODE}


@app.get("/demo/sequence/{sign_name}", tags=["Demo"])
async def demo_get_sequence(sign_name: str):
    """Get a sample pose sequence for a specific sign.
    
    Use this to test the prediction pipeline without a webcam.
    """
    if sign_name not in DEMO_SIGNS:
        available = list(DEMO_SIGNS.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Sign '{sign_name}' not found. Available: {available}",
        )
    
    sequence = generate_demo_sequence(sign_name)
    sign_info = DEMO_SIGNS[sign_name]
    
    return {
        "sign_name": sign_name,
        "description": sign_info["description"],
        "pose_sequence": sequence,
        "expected_text": sign_info["text"],
        "num_frames": len(sequence),
        "num_landmarks": 33,
        "num_features": 5,
    }


@app.post("/demo/predict/{sign_name}", response_model=PredictionResult, tags=["Demo"])
async def demo_predict(sign_name: str):
    """Run prediction on a demo sign sequence.
    
    In demo mode, this returns a simulated prediction.
    In normal mode, this runs the actual model on sample data.
    """
    if sign_name not in DEMO_SIGNS:
        available = list(DEMO_SIGNS.keys())
        raise HTTPException(
            status_code=404,
            detail=f"Sign '{sign_name}' not found. Available: {available}",
        )
    
    if DEMO_MODE or engine is None:
        # Demo mode: return simulated prediction
        demo_pred = get_demo_prediction(sign_name)
        return PredictionResult(
            prediction=Prediction(text=demo_pred["text"], tokens=demo_pred["tokens"]),
            confidence=demo_pred["confidence"],
            processing_time_ms=demo_pred["processing_time_ms"],
            model_version=settings.MODEL_VERSION,
        )
    
    # Normal mode: run actual model
    sequence = generate_demo_sequence(sign_name)
    raw = engine.predict(
        pose_sequence=sequence,
        max_length=settings.MAX_GENERATION_LENGTH,
    )
    decoded = decode_prediction(raw)
    
    return PredictionResult(
        prediction=Prediction(text=decoded["text"], tokens=decoded["tokens"]),
        confidence=round(decoded["confidence"], 4),
        processing_time_ms=round(decoded["processing_time_ms"], 2),
        model_version=settings.MODEL_VERSION,
    )


def create_app() -> FastAPI:
    """Factory for creating the FastAPI app (useful for testing)."""
    return app

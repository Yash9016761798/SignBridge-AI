# SignBridge AI — Inference Service

Production FastAPI application for Indian Sign Language to English translation.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Open Swagger docs
open http://localhost:8000/docs
```

## Docker

```bash
cd /path/to/project
docker build -f ai-training/Dockerfile -t signbridge-ai .
docker run -p 8000:8000 signbridge-ai
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SIGNBRIDGE_PORT | 8000 | Server port |
| SIGNBRIDGE_DEBUG | false | Debug mode |
| SIGNBRIDGE_MODEL_CHECKPOINT | experiments/representative/checkpoints/best.pt | Model checkpoint path |
| SIGNBRIDGE_VOCAB_PATH | experiments/representative/vocabulary.json | Vocabulary path |
| SIGNBRIDGE_MODEL_VERSION | 1.0.0 | Model version string |
| SIGNBRIDGE_CORS_ORIGINS | * | Allowed CORS origins |
| SIGNBRIDGE_LOG_LEVEL | INFO | Logging level |

## API Endpoints

### GET /health
Health check. Returns service status, model load state, and uptime.

### GET /model/info
Model architecture details, parameter count, device info.

### POST /predict
Translate a sequence of pose frames to text.

**Request:**
```json
{
  "pose_sequence": [[[x, y, z, v, ...], ...], ...],
  "max_length": 30,
  "temperature": 1.0
}
```

**Response:**
```json
{
  "prediction": { "text": "Hello", "tokens": [1, 5, 2] },
  "confidence": 0.85,
  "processing_time_ms": 12.5,
  "model_version": "1.0.0"
}
```

### POST /translate
Translate a single pose frame to text.

### POST /webcam/frame
Process a webcam frame for real-time translation with session tracking.

## Architecture

```
main.py              — FastAPI app, routes, middleware
config.py            — Settings from environment variables
schemas.py           — Pydantic request/response models
model_loader.py      — Checkpoint and vocabulary loading
preprocessor.py      — Pose tensor normalization and validation
inference_engine.py  — Model inference wrapper
decoder.py           — Post-processing and text cleaning
```

## Testing

```bash
pytest tests/ -v
```

## Swagger Documentation

Available at `/docs` when the server is running.

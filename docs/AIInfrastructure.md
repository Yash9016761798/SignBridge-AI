# AI Infrastructure & Translation Foundation

## Overview

Phase 6 establishes the complete AI infrastructure: contracts, APIs, storage, and communication between Next.js, NestJS, and FastAPI — without implementing ML models.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Next.js    │────▶│  NestJS     │────▶│  FastAPI AI     │
│  Frontend   │     │  Backend    │     │  Service        │
└─────────────┘     └─────────────┘     └─────────────────┘
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │ PostgreSQL  │      │ Mock Models │
                     │ (Prisma)    │      │ (stubs)     │
                     └─────────────┘      └─────────────┘
```

**Rule:** Frontend never communicates directly with FastAPI. All AI interactions go through NestJS.

## Services

### FastAPI AI Service (`apps/ai-service/`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health/` | GET | Health check |
| `/api/v1/health/ready` | GET | Readiness check |
| `/api/v1/ai/predict` | POST | Mock gesture prediction |
| `/api/v1/ai/model/info` | GET | Model metadata (stub) |
| `/api/v1/ai/version` | GET | Service version info |
| `/` | GET | Root info |
| `/api/docs` | GET | Swagger UI |

**Key files:**
- `app/main.py` — FastAPI app with CORS, logging, exception handler
- `app/config.py` — Pydantic settings
- `app/models/schemas.py` — Pydantic request/response schemas
- `app/services/prediction.py` — Mock prediction service
- `app/api/v1/prediction.py` — Prediction endpoints
- `app/api/v1/health.py` — Health endpoints
- `app/core/logging.py` — Structured logging setup
- `app/core/error_handler.py` — Global error handling

### NestJS Backend AI Module (`apps/backend/src/ai/`)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/translation/session` | POST | User | Create translation session |
| `/translation/session/:id` | GET | User | Get session with messages |
| `/translation/translate` | POST | User | Translate text to ISL |
| `/translation/history` | GET | User | User translation history |
| `/practice/session` | POST | User | Create practice session |
| `/practice/session/:id` | GET | User | Get session with predictions |
| `/practice/predict` | POST | User | Submit a prediction |
| `/practice/session/:id/end` | POST | User | End practice session |
| `/practice/history` | GET | User | User practice history |
| `/ai/predict` | POST | User | Mock prediction (stub) |
| `/ai/health` | GET | Public | AI service health |

**Key files:**
- `ai/ai.module.ts` — Module registration
- `ai/ai.controller.ts` — REST endpoints with Swagger
- `ai/ai.service.ts` — Business logic (Prisma + mock AI calls)
- `ai/dto/translation.dto.ts` — Translation DTOs
- `ai/dto/practice.dto.ts` — Practice DTOs
- `ai/dto/ai.dto.ts` — Prediction DTOs

## Shared Contracts (Types)

### PredictionRequest
```json
{
  "type": "image" | "video" | "landmarks",
  "session_id": "string (optional)",
  "user_id": "string (optional)"
}
```

### PredictionResponse
```json
{
  "success": true,
  "message": "Mock prediction completed",
  "data": {
    "gesture": "Hello",
    "confidence": 0.92,
    "alternatives": [{ "gesture": "Thank You", "confidence": 0.78 }],
    "processing_time_ms": 120,
    "model_version": "mock-v1.0.0",
    "prediction_type": "image"
  }
}
```

### TranslationRequest
```json
{
  "text": "Hello, how are you?",
  "target_language": "isl",
  "session_id": "string (optional)"
}
```

### TranslationResponse
```json
{
  "sessionId": "uuid",
  "translation": {
    "outputText": "[ISL Translation of: Hello, how are you?]",
    "confidence": 0.91,
    "signs": [{ "word": "Hello", "signVideoUrl": null, "duration": 2 }],
    "totalDuration": 10
  }
}
```

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/practice` | AI Practice | Camera view, start session, capture & predict, results |
| `/translation` | Translator | Text input, ISL translation output, sign breakdown |
| `/history` | Session History | Practice and translation session history with tabs |

**Frontend Components:**
- `CameraPermission` — Camera access request with status handling
- `PredictionResultDisplay` — Prediction result with confidence bar and alternatives

## Database Models (Prisma)

- **TranslationSession:** id, type (enum), status (enum), startedAt, endedAt, userId
- **TranslationMessage:** id, inputText, outputText, confidence, language, sessionId
- **PracticeSession:** id, confidenceScore, accuracy, feedback, duration, userId, lessonId
- **GesturePrediction:** id, predictedGesture, confidence, processingTime, modelVersion, practiceSessionId

## Data Flow

### Practice Flow
1. Frontend requests camera permission
2. User starts practice session → `POST /practice/session`
3. User captures frame → `POST /ai/predict` (returns mock prediction)
4. Frontend displays prediction result
5. Prediction submitted → `POST /practice/predict` (stored in DB)
6. User ends session → `POST /practice/session/:id/end`

### Translation Flow
1. User types text in textarea
2. Frontend calls `POST /translation/translate`
3. Backend creates/uses translation session
4. Backend returns mock translation with sign breakdown
5. History stored in TranslationMessage

## Mock Predictions

The mock prediction service returns random gestures from a predefined list of 32 ISL signs with simulated confidence scores (0.65-0.98) and processing times (50-200ms). This allows full infrastructure testing without ML models.

## Future Model Integration

When ready to integrate the real model:
1. Replace `app/services/prediction.py` with actual TensorFlow/MediaPipe inference
2. Update `POST /ai/predict` to accept image/video data
3. Add model loading in `app/main.py` startup event
4. Update frontend to send captured frames instead of mock calls
5. Add model versioning and evaluation metrics

## Running the AI Service

```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger docs: http://localhost:8000/api/docs

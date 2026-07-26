# SignBridge AI — Architecture Review

**Date:** 2026-07-26

---

## System Architecture

### Overview

SignBridge AI is a monorepo application with three main services:

1. **Frontend** (Next.js 14) — User interface for learning, practice, and translation
2. **AI Service** (FastAPI + PyTorch) — PoseTransformer model inference
3. **Backend** (NestJS + Prisma) — Business logic, authentication, data persistence

### Architecture Pattern

**Microservices with shared monorepo:**
- Turborepo for build orchestration
- Each service has its own Dockerfile
- Docker Compose for orchestration
- Services communicate via HTTP REST APIs

---

## Component Architecture

### Frontend (`apps/web/`)

```
app/
├── (auth)/          # Login, register, forgot/reset password
├── (dashboard)/     # Main app pages
│   ├── dashboard/   # Home dashboard
│   ├── practice/    # AI practice with camera
│   ├── translation/ # Text-to-ISL
│   ├── dictionary/  # Sign dictionary
│   ├── learn/       # Course catalog + lessons + quizzes
│   ├── settings/    # User settings
│   ├── profile/     # User profile
│   ├── history/     # Practice + translation history
│   ├── certificates/# Earned certificates
│   └── my-courses/  # Enrolled courses
├── error.tsx        # Global error boundary
├── not-found.tsx    # 404 page
└── layout.tsx       # Root layout with AuthProvider

components/
├── auth/            # Auth forms, ProtectedRoute, LoadingScreen
├── ai/              # Camera, predictions, confidence, session controls
├── dashboard/       # Layout, sidebar, navbar, stat cards, modals
└── dictionary/      # Sign cards, category browser, filters

hooks/
├── useCamera              # WebRTC camera management
├── useAIInference         # AI service health + prediction
├── useRealtimeTranslation # Full pipeline orchestrator
├── useSlidingWindow       # Frame buffer
├── usePredictionSmoothing # Temporal smoothing
└── usePerformanceMetrics  # FPS, latency, confidence tracking

lib/
├── firebase.ts            # Conditional Firebase initialization
├── api.ts                 # Axios client with auth interceptors
├── ai-inference-api.ts    # Direct AI service client
├── pose-extraction.ts     # Canvas-based pose extraction
├── ai-api.ts              # Backend AI endpoints
├── dictionary-api.ts      # Backend dictionary endpoints
└── learning-api.ts        # Backend learning endpoints

stores/
├── auth-store.ts          # Authentication state (Firebase + demo)
└── ui-store.ts            # UI state (sidebar)
```

**Key Design Decisions:**
- `useRealtimeTranslation` orchestrates the entire camera → pose → AI → display pipeline
- Firebase is conditionally initialized (disabled when no API key)
- Pose extraction uses canvas brightness heuristic (no MediaPipe dependency)
- AI inference client is separate from backend API client

### AI Service (`apps/ai-service/`)

```
main.py              # FastAPI app, routes, lifespan
config.py            # Settings from environment
schemas.py           # Pydantic request/response models
model_loader.py      # Load PoseTransformer from checkpoint
inference_engine.py  # Run model inference with torch.no_grad()
preprocessor.py      # Normalize and validate pose data
text_decoder.py      # Convert token IDs to text
demo.py              # Demo mode with 8 sample signs
```

**Key Design Decisions:**
- Single-file FastAPI app (no router splitting)
- Demo mode when `SIGNBRIDGE_DEMO_MODE=true` or no checkpoint found
- Model loaded once at startup via lifespan handler
- CORS middleware for frontend communication

### AI Training (`ai-training/`)

```
models/
├── transformer.py        # PoseTransformer (encoder-decoder)
├── attention.py          # Multi-head attention
├── encoder.py            # Transformer encoder
├── decoder.py            # Transformer decoder
├── embedding.py          # Pose embedding
├── positional_encoding.py # Sinusoidal positional encoding
└── loss.py               # Label smoothing loss

training/
├── engine.py             # Training loop with mixed precision
├── early_stopping.py     # Patience-based stopping
├── dataset_loader.py     # CSV data loading and batching
└── logger.py             # Training metrics logging

tokenizer/
├── tokenizer.py          # Word-level tokenizer
└── vocab.json            # 45K word vocabulary

checkpoints/              # 16 checkpoints, 237MB total
configs/                  # YAML configs for training
scripts/                  # Training, evaluation, export scripts
```

**Key Design Decisions:**
- Encoder-decoder transformer (not encoder-only)
- Autoregressive generation with temperature sampling
- Label smoothing loss for regularization
- Small representative model (90K params) for development

### Backend (`apps/backend/`)

```
src/
├── auth/          # Firebase auth, login, register
├── dictionary/    # Sign words, categories, favorites
├── learning/      # Courses, modules, lessons, quizzes, certificates
├── ai/            # Translation sessions, practice sessions
├── database/      # Prisma service
├── health/        # Health check endpoints
├── common/        # Guards, filters, interceptors, decorators
├── logger/        # Pino logging
└── swagger/       # OpenAPI documentation

prisma/
├── schema.prisma  # 25 models, 10 enums
├── seed.ts        # Database seeding
└── migrations/    # Schema migrations
```

**Key Design Decisions:**
- Firebase Admin SDK for token verification
- Prisma ORM for database access
- Global guards for auth (except `@Public()` routes)
- Response transformation interceptor

---

## Data Flow

### Real-time Translation Pipeline

```
Camera → useCamera → extractPoseFromVideo → slidingWindow
    → aiInference.predict() → AI Service /predict
    → predictionSmoothing → TranslationCard display
```

### Authentication Flow

```
Login Form → useAuthStore.login()
    → signInWithEmailAndPassword (Firebase)
    → getIdToken()
    → POST /auth/login (Backend)
    → User stored in Zustand
```

### Course Learning Flow

```
Learn Page → GET /learning/courses (Backend)
    → Course Detail → GET /learning/courses/:id
    → Enroll → POST /learning/courses/:id/enroll
    → Lesson → GET /learning/lessons/:id
    → Quiz → GET /learning/quizzes/:id
    → Submit → POST /learning/quizzes/attempt
    → Certificate → POST /learning/courses/:id/certificate
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14.1.0 |
| UI | Tailwind CSS | 3.x |
| State | Zustand | Latest |
| Forms | react-hook-form + Zod | Latest |
| Animation | Framer Motion | Latest |
| Icons | Lucide React | Latest |
| AI Service | FastAPI | Latest |
| ML Framework | PyTorch | CPU |
| Backend | NestJS | Latest |
| ORM | Prisma | Latest |
| Database | PostgreSQL | 16 |
| Auth | Firebase Auth | 12.x |
| Container | Docker | Multi-stage |
| Orchestration | Docker Compose | 3.8 |
| Monorepo | Turborepo | Latest |

---

## Scalability Considerations

### Current Limitations
- Single AI service instance (no horizontal scaling)
- Model loaded in memory (limited by GPU/RAM)
- No caching layer (Redis)
- No message queue for async processing
- Synchronous inference (blocks on GPU)

### Production Scaling Path
1. Add Redis for session caching
2. Add load balancer for AI service instances
3. Move to GPU instances for real-time inference
4. Add WebSocket for streaming predictions
5. Add CDN for static assets
6. Add read replicas for PostgreSQL

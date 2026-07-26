# SignBridge AI — Architecture Overview

System architecture for the SignBridge AI platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Desktop    │      │
│  │  (React UI)  │  │   (Future)   │  │   (Future)   │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
└─────────┼───────────────────────────────────────────────────┘
          │ HTTP
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js 14 (App Router)                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Pages   │  │ Components│  │  Hooks   │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Stores  │  │ Providers│  │ Services │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│  Port: 3000                                                  │
└─────────┬───────────────────────────────────────────────────┘
          │ HTTP (axios)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI SERVICE                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               FastAPI + Uvicorn                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Endpoints │  │Middleware│  │ Schemas  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Model   │  │Inference │  │ Text     │           │   │
│  │  │  Loader  │  │ Engine   │  │ Decoder  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│  Port: 8000                                                  │
└─────────┬───────────────────────────────────────────────────┘
          │ PyTorch
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  POSETRANSFORMER MODEL                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Input: (B, T, 33, 5) — 33 landmarks × 5 features  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │  Encoder │  │  Decoder │  │  Output  │           │   │
│  │  │ (1 layer)│  │ (1 layer)│  │  (vocab) │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │  Output: English text tokens                         │   │
│  │  Parameters: 90,450                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14.1 (App Router) | Server-side rendering, routing |
| UI Library | React 18.2 | Component rendering |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| State | Zustand 4.5 | Global state management |
| Forms | React Hook Form + Zod | Form validation |
| HTTP | Axios | API communication |
| Auth | Firebase Auth | User authentication |
| Animation | Framer Motion | UI transitions |
| Icons | Lucide React | Icon library |

### Component Hierarchy

```
RootLayout
├── ThemeProvider (dark mode)
│   └── AuthProvider (authentication)
│       └── Page Router
│           ├── (auth)/
│           │   ├── Login
│           │   ├── Register
│           │   ├── ForgotPassword
│           │   └── ResetPassword
│           └── (dashboard)/
│               ├── Sidebar
│               ├── TopNavbar (ThemeToggle)
│               ├── Dashboard
│               ├── Translation
│               │   ├── CameraView
│               │   ├── PredictionDisplay
│               │   ├── TranslationControls
│               │   └── ConfidenceMeter
│               ├── Practice
│               ├── Dictionary
│               ├── Learn
│               ├── Settings
│               └── Profile
```

### State Management

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `auth-store.ts` | User auth state, demo fallback | localStorage |
| `ui-store.ts` | UI preferences (theme, sidebar) | localStorage |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useCamera` | Webcam access, frame capture, start/stop |
| `useAIInference` | Send frames to AI service, get predictions |
| `useRealtimeTranslation` | End-to-end translation pipeline |
| `usePredictionSmoothing` | Smooth noisy predictions over time |
| `useSlidingWindow` | Manage sliding window of pose frames |
| `usePerformanceMetrics` | Track FPS, latency, frame count |

---

## Backend Architecture (Optional)

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | NestJS 10.3 | Node.js backend framework |
| ORM | Prisma 5.8 | Database access |
| Database | PostgreSQL 16 | Relational data |
| Auth | Firebase Admin | Server-side auth verification |
| API Docs | Swagger 7.2 | API documentation |
| Logging | Pino | Structured logging |
| Security | Helmet, Compression | HTTP security |

### Module Structure

```
AppModule
├── AuthModule (Firebase verification)
├── UserModule (profile management)
├── ProgressModule (learning tracking)
├── DictionaryModule (ISL signs)
├── HealthModule (Terminus health checks)
└── ConfigModule (environment variables)
```

---

## AI Pipeline

### Pose Extraction Pipeline

```
Webcam Frame (RGB)
    │
    ▼
MediaPipe Holistic
    │
    ├──→ Pose Landmarks (33 points)
    │    Each point: (x, y, z, visibility)
    │
    └──→ Feature Extraction
         │
         ▼
    Pose Vector (33 × 5)
    [x, y, z, visibility, timestamp]
    │
    ▼
Normalization (0-1 range)
    │
    ▼
Sequence Buffer (T frames)
    │
    ▼
Tensor (B, T, 33, 5)
```

### Inference Pipeline

```
Pose Tensor (B, T, 33, 5)
    │
    ▼
Pose Embedding Layer
    │ Projects 5 features → d_model (32)
    ▼
Positional Encoding (sinusoidal)
    │
    ▼
Transformer Encoder (1 layer, 4 heads)
    │ Self-attention on spatial landmarks
    ▼
Transformer Decoder (1 layer, 4 heads)
    │ Cross-attention with encoder output
    │ Autoregressive token generation
    ▼
Linear Output Layer
    │ Projects d_model → vocab_size (978)
    ▼
Token Probabilities
    │
    ▼
Greedy/Beam Search Decode
    │
    ▼
Token Sequence [CLS, tok1, tok2, ..., EOS]
    │
    ▼
Text Decoder (token → English text)
    │
    ▼
English Text Output
```

### Translation Pipeline (Frontend)

```
Webcam (useCamera)
    │ 5 FPS capture
    ▼
Frame Buffer (useSlidingWindow)
    │ Sliding window of 30 frames
    ▼
AI Inference (useAIInference)
    │ POST /webcam/frame
    ▼
Prediction Smoothing (usePredictionSmoothing)
    │ Debounce + confidence threshold
    ▼
Display Update
    │ Show translated text
    ▼
History Log (future: persist to DB)
```

---

## Database Flow (Full Stack)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Frontend │────▶│  Backend  │────▶│PostgreSQL│
│  (Next.js)│     │ (NestJS)  │     │  (Prisma)│
└──────────┘     └──────────┘     └──────────┘
                       │
                       ▼
                 ┌──────────┐
                 │ Firebase │
                 │  Admin   │
                 └──────────┘
```

**Tables (Prisma Schema):**
- `users` — User profiles
- `progress` — Learning progress
- `translations` — Translation history
- `courses` — Learning courses
- `achievements` — Certificates and badges

---

## Authentication Flow

### With Firebase

```
1. User enters credentials
2. Frontend calls Firebase Auth SDK
3. Firebase returns ID token
4. Frontend stores token in localStorage
5. API requests include Authorization header
6. Backend verifies token with Firebase Admin
7. Backend returns user data
```

### Without Firebase (Demo Mode)

```
1. User enters any email/password
2. AuthProvider checks isFirebaseEnabled
3. Falls back to Zustand mock auth
4. Mock user created with email
5. No backend verification needed
6. All features work with mock data
```

---

## API Flow

### Frontend → AI Service

```
Browser → localhost:8000
         │
         ├── GET  /health              → Health status
         ├── GET  /model/info          → Model details
         ├── POST /predict             → Sequence translation
         ├── POST /translate           → Single frame translation
         ├── POST /webcam/frame        → Real-time processing
         ├── GET  /demo/signs          → List demo signs
         ├── GET  /demo/sequence/{id}  → Sample pose data
         └── POST /demo/predict/{id}   → Demo prediction
```

### Frontend → Backend (Full Stack)

```
Browser → localhost:3001/api/v1
         │
         ├── POST /auth/login          → Login
         ├── POST /auth/register       → Register
         ├── GET  /users/me            → Current user
         ├── GET  /progress            → Learning progress
         ├── POST /translations        → Save translation
         └── GET  /dictionary          → ISL dictionary
```

---

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│                signbridge-network (bridge)                   │
│                                                             │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │  signbridge-ai  │     │ signbridge-web  │               │
│  │  (FastAPI)      │◄────│ (Next.js)       │               │
│  │  Port: 8000     │     │ Port: 3000      │               │
│  │  Python 3.11    │     │ Node.js 18      │               │
│  │  Non-root user  │     │ Non-root user   │               │
│  └─────────────────┘     └─────────────────┘               │
│                                                             │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │signbridge-      │     │signbridge-      │  (full profile)│
│  │  backend        │────▶│  postgres       │               │
│  │  (NestJS)       │     │  (PostgreSQL)   │               │
│  │  Port: 3001     │     │  Port: 5432     │               │
│  └─────────────────┘     └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Docker Volumes

| Volume | Mount | Purpose |
|--------|-------|---------|
| `ai-training/experiments` | Read-only | Model checkpoints |
| `ai-training/checkpoints` | Read-only | Training checkpoints |
| `ai-training/tokenizer` | Read-only | Tokenizer files |
| `ai-training/models` | Read-only | Model architecture |
| `logs/ai-service` | Read-write | AI service logs |
| `postgres-data` | Named volume | Database persistence |

---

## Data Flow — End to End

```
1. User opens webcam on /translation page
2. useCamera hook captures frames at 5 FPS
3. useSlidingWindow maintains 30-frame buffer
4. useRealtimeTranslation orchestrates the pipeline
5. Every 200ms, frame sent to AI service
6. AI service preprocesses pose data
7. PoseTransformer generates token sequence
8. Text decoder converts tokens to English
9. Response sent back to frontend
10. usePredictionSmoothing debounces output
11. PredictionDisplay shows translated text
12. Translation logged (future: saved to DB)
```

### Latency Budget

| Step | Target | Actual |
|------|--------|--------|
| Frame capture | 20ms | ~15ms |
| Network round-trip | 50ms | ~40ms |
| Pose preprocessing | 10ms | ~8ms |
| Model inference | 200ms | ~150ms |
| Text decoding | 5ms | ~3ms |
| UI update | 16ms | ~10ms |
| **Total** | **~300ms** | **~225ms** |

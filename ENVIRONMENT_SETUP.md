# SignBridge AI — Environment Setup

Complete guide to configuring environment variables.

---

## Overview

SignBridge AI uses environment variables for configuration. Variables are split across:

1. **Root `.env`** — Used by Docker Compose and shared settings
2. **`apps/web/.env.local`** — Frontend-specific (Next.js)
3. **`apps/ai-service/.env`** — AI service-specific
4. **`apps/backend/.env`** — Backend-specific (optional)

---

## Root `.env`

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_PORT` | `3000` | Frontend port |
| `NEXT_PUBLIC_AI_SERVICE_URL` | `http://localhost:8000` | AI service URL (browser-side) |
| `NEXT_PUBLIC_APP_NAME` | `SignBridge AI` | Application name |
| `NEXT_PUBLIC_APP_ENV` | `development` | Environment (development/production) |
| `AI_PORT` | `8000` | AI service port |
| `MODEL_CHECKPOINT` | `experiments/representative/checkpoints/best.pt` | Model checkpoint path |
| `VOCAB_PATH` | `experiments/representative/vocabulary.json` | Vocabulary file path |
| `MODEL_VERSION` | `1.0.0` | Model version string |
| `SIGNBRIDGE_DEBUG` | `false` | Enable debug mode |
| `SIGNBRIDGE_LOG_LEVEL` | `INFO` | Logging level |
| `DEMO_MODE` | `false` | Enable demo mode |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | Backend API URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | — | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | — | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | — | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | — | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | — | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | — | Firebase app ID |
| `BACKEND_PORT` | `3001` | Backend API port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/signbridge_ai` | PostgreSQL URL |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |

---

## AI Service Variables (`apps/ai-service/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SIGNBRIDGE_HOST` | `0.0.0.0` | Bind host |
| `SIGNBRIDGE_PORT` | `8000` | Server port |
| `SIGNBRIDGE_DEBUG` | `false` | Debug mode |
| `SIGNBRIDGE_LOG_LEVEL` | `INFO` | Log level |
| `SIGNBRIDGE_CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `SIGNBRIDGE_RATE_LIMIT_PER_MINUTE` | `60` | Max requests per minute per IP |
| `SIGNBRIDGE_RATE_LIMIT_BURST` | `10` | Burst limit |
| `SIGNBRIDGE_MODEL_CHECKPOINT` | `experiments/representative/checkpoints/best.pt` | Model checkpoint |
| `SIGNBRIDGE_VOCAB_PATH` | `experiments/representative/vocabulary.json` | Vocabulary path |
| `SIGNBRIDGE_MODEL_VERSION` | `1.0.0` | Model version |
| `SIGNBRIDGE_NUM_LANDMARKS` | `33` | Pose landmarks count |
| `SIGNBRIDGE_NUM_FEATURES` | `5` | Features per landmark |
| `SIGNBRIDGE_MAX_SEQ_LENGTH` | `30` | Max sequence length |
| `SIGNBRIDGE_DEMO_MODE` | `false` | Demo mode |

---

## Frontend Variables (`apps/web/.env.local`)

Next.js uses `NEXT_PUBLIC_` prefix for client-side variables.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_AI_SERVICE_URL` | AI service URL |
| `NEXT_PUBLIC_APP_NAME` | App name |
| `NEXT_PUBLIC_APP_ENV` | Environment |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase config |

---

## Demo Mode

Demo mode allows running without a real model or webcam.

### Enable Demo Mode

```bash
# In root .env
DEMO_MODE=true

# Or via environment variable
SIGNBRIDGE_DEMO_MODE=true

# Or via Docker
DEMO_MODE=true docker compose up --build
```

### What Demo Mode Does

| Feature | Demo Mode | Normal Mode |
|---------|-----------|-------------|
| Model loading | Skipped | Loads checkpoint |
| Predictions | Random from 8 sample signs | Real model inference |
| Webcam | Optional | Required |
| Firebase | Optional | Optional |
| API responses | Simulated | Real |

### Demo Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /demo/signs` | List 8 available demo signs |
| `GET /demo/sequence/{sign}` | Get sample pose sequence |
| `POST /demo/predict/{sign}` | Run prediction on sample data |

---

## Firebase Configuration

Firebase is **optional**. The app works without it using demo authentication.

### Without Firebase (Default)

- No configuration needed
- Mock users are created automatically
- Auth state persisted in localStorage

### With Firebase

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Add your web app to the project
4. Copy the config values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Database Configuration (Full Stack Only)

Required only when running the NestJS backend.

```bash
# PostgreSQL connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/signbridge_ai

# Backend port
BACKEND_PORT=3001

# Firebase Admin (server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## Docker Environment

Docker Compose reads from the root `.env` file. Environment variables are passed to containers.

### Docker-Specific Variables

| Variable | Used By | Default |
|----------|---------|---------|
| `WEB_PORT` | web | `3000` |
| `AI_PORT` | ai-service | `8000` |
| `BACKEND_PORT` | backend | `3001` |
| `POSTGRES_PORT` | postgres | `5432` |
| `DEMO_MODE` | ai-service | `false` |

### Override in Docker

```bash
# Override port
WEB_PORT=3001 docker compose up

# Override demo mode
DEMO_MODE=true docker compose up

# Override AI port
AI_PORT=8001 docker compose up
```

---

## Environment File Template

```bash
# ============================================================
# SignBridge AI - Environment Variables
# ============================================================

# Frontend
WEB_PORT=3000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=SignBridge AI
NEXT_PUBLIC_APP_ENV=development

# Backend (optional)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Firebase (optional)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Service
AI_PORT=8000
MODEL_CHECKPOINT=experiments/representative/checkpoints/best.pt
VOCAB_PATH=experiments/representative/vocabulary.json
MODEL_VERSION=1.0.0
SIGNBRIDGE_DEBUG=false
SIGNBRIDGE_LOG_LEVEL=INFO

# Demo Mode
DEMO_MODE=false

# Full Stack (optional)
# BACKEND_PORT=3001
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/signbridge_ai
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `NEXT_PUBLIC_*` not available | Variable not in `.env.local` | Add to `apps/web/.env.local` and restart dev server |
| Firebase not initializing | No API key | Add Firebase credentials or leave empty for demo mode |
| AI service can't find model | Wrong checkpoint path | Verify `MODEL_CHECKPOINT` points to existing `.pt` file |
| CORS errors | Origins mismatch | Update `SIGNBRIDGE_CORS_ORIGINS` to include frontend URL |
| Port conflict | Another service on port | Change `WEB_PORT`, `AI_PORT`, or kill conflicting process |

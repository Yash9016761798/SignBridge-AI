# SignBridge AI — Team Setup Guide

> **Breaking Communication Barriers Through Indian Sign Language**

This guide walks a new developer from zero to a fully running local environment. Follow every section in order.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [VS Code Extensions](#3-vs-code-extensions)
4. [Clone Repository](#4-clone-repository)
5. [Install Dependencies](#5-install-dependencies)
6. [Environment Variables](#6-environment-variables)
7. [Running the Project](#7-running-the-project)
8. [Verify Everything Works](#8-verify-everything-works)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Project Overview

### What is SignBridge AI?

SignBridge AI is a real-time Indian Sign Language (ISL) to English translation platform. A user performs ISL signs in front of a webcam, the system extracts body pose landmarks using MediaPipe, feeds them into a Transformer-based neural network (PoseTransformer), and outputs English text.

### Problem Statement

Over 63 million deaf and hard-of-hearing individuals in India use ISL. There is a severe shortage of qualified sign language interpreters. SignBridge AI bridges this gap by providing automated, real-time translation.

### Features

| Feature | Status |
|---------|--------|
| Real-time webcam ISL translation | Working |
| Pose landmark extraction (MediaPipe) | Working |
| PoseTransformer model inference | Working |
| Camera control UI | Working |
| Real-time translation display | Working |
| Demo mode (no webcam required) | Working |
| User authentication (Firebase) | Working |
| Dashboard with statistics | Working |
| Settings page | Working |
| ISL dictionary browser | Working |
| Practice mode | Working |
| Learning modules | Working |
| Dark mode toggle | Working |
| Docker deployment | Working |
| CI/CD pipeline | Working |
| E2E testing (Playwright) | Working |
| NestJS backend + PostgreSQL | Scaffolded (optional) |

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 14.1.0 |
| **Frontend** | React | 18.2.x |
| **Frontend** | Tailwind CSS | 3.4.x |
| **Frontend** | Zustand | 4.5.x |
| **Frontend** | TypeScript | 5.3.x |
| **AI Service** | FastAPI | 0.104+ |
| **AI Service** | PyTorch | 2.1+ |
| **AI Service** | Python | 3.11 |
| **AI Service** | Uvicorn | 0.24+ |
| **AI Service** | Pydantic | 2.5+ |
| **AI Training** | MediaPipe | 0.10+ |
| **AI Training** | TensorFlow | 2.15+ |
| **AI Training** | OpenCV | 4.8+ |
| **Backend** | NestJS | 10.3.x |
| **Backend** | Prisma ORM | 5.8.x |
| **Backend** | PostgreSQL | 16 |
| **Database** | PostgreSQL (Alpine) | 16 |
| **Auth** | Firebase Auth | 12.16.x |
| **Testing** | Jest | 29.7.x |
| **Testing** | Playwright | 1.62.x |
| **Testing** | pytest | 7.4+ |
| **Build** | Turborepo | 1.12.x |
| **Package Mgr** | pnpm | 8.15.0 |
| **Container** | Docker Compose | 3.8 |
| **CI/CD** | GitHub Actions | Latest |

### AI Model

- **Architecture:** PoseTransformer (encoder-decoder Transformer)
- **Parameters:** 90,450
- **Input:** Pose sequence `(B, T, 33, 5)` — 33 MediaPipe landmarks, 5 features each (x, y, z, visibility, timestamp)
- **Output:** English text tokens
- **Checkpoint:** `ai-training/experiments/representative/checkpoints/best.pt` (1,162 KB)
- **Vocabulary:** `ai-training/experiments/representative/vocabulary.json` (978 tokens)

---

## 2. Prerequisites

Install **exact versions** before cloning.

| Tool | Version | Required | Install |
|------|---------|----------|---------|
| **Node.js** | >= 18.x (18 LTS recommended) | Yes | https://nodejs.org |
| **pnpm** | >= 8.x (8.15.0 pinned) | Yes | `corepack enable && corepack prepare pnpm@8.15.0 --activate` |
| **Python** | 3.11.x | Yes | https://www.python.org/downloads/ |
| **pip** | >= 23.x | Yes | Bundled with Python |
| **Docker Desktop** | >= 24.x | Recommended | https://docs.docker.com/get-docker/ |
| **Docker Compose** | >= 2.20.x | Recommended | Bundled with Docker Desktop |
| **Git** | >= 2.40 | Yes | https://git-scm.com |
| **VS Code** | Latest | Recommended | https://code.visualstudio.com |
| **PostgreSQL** | 16 | Only for full stack | https://www.postgresql.org/download/ |
| **CUDA** | >= 12.1 | Optional (GPU) | https://developer.nvidia.com/cuda-toolkit |

### Hardware Recommendations

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 8 GB | 16 GB+ |
| **Disk** | 5 GB free | 10 GB+ free |
| **GPU** | Not required | NVIDIA CUDA-capable GPU for model training |
| **CPU** | 4 cores | 8+ cores |

### Supported Operating Systems

- **Windows** 10/11 (primary development environment)
- **macOS** 12+ (Monterey and later)
- **Ubuntu** 20.04+ / Debian 11+
- **Docker** (any OS with Docker Desktop)

---

## 3. VS Code Extensions

Install these extensions for the best development experience.

| Extension | ID | Purpose |
|-----------|----|---------|
| **Python** | `ms-python.python` | Python language support, debugging |
| **Pylance** | `ms-python.vscode-pylance` | Python type checking |
| **Docker** | `ms-azuretools.vscode-docker` | Dockerfile editing, container management |
| **ESLint** | `dbaeumer.vscode-eslint` | JavaScript/TypeScript linting |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **GitLens** | `eamodio.gitlens` | Git blame, history, branches |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind class autocomplete |
| **Thunder Client** | `rangav.vscode-thunder-client` | REST API testing |
| **REST Client** | `humao.rest-client` | HTTP request files |
| **Error Lens** | `usernamehw.errorlint` | Inline error display |
| **Material Icon Theme** | `pkief.material-icon-theme` | File icons |
| **Error Lens** | `usernamehw.errorlint` | Inline error highlights |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind autocomplete |

### Recommended VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "files.associations": {
    "*.py": "python"
  }
}
```

---

## 4. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/SignBridge-AI.git

# Navigate into the project
cd SignBridge-AI

# Verify the clone
ls -la
```

You should see:

```
.github/          apps/             packages/
ai-training/      scripts/          docs/
e2e/              docker-compose.yml
package.json      pnpm-workspace.yaml
Makefile          turbo.json
```

---

## 5. Install Dependencies

### 5.1 Enable Corepack (pnpm)

```bash
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

### 5.2 Install Node.js Dependencies (Monorepo)

```bash
# From the project root
pnpm install
```

This installs dependencies for:

| Package | Purpose |
|---------|---------|
| `@signbridge/web` | Next.js frontend |
| `@signbridge/backend` | NestJS backend API |
| `signbridge-ai` (root) | Turborepo, Husky, Prettier, Playwright |

### 5.3 Install AI Service Python Dependencies

```bash
cd apps/ai-service
pip install -r requirements.txt
cd ../..
```

**What gets installed:**

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework for AI inference API |
| `uvicorn` | ASGI server |
| `pydantic` | Data validation and settings |
| `torch` | PyTorch — neural network inference |
| `numpy` | Numerical operations |
| `python-multipart` | File upload support |
| `httpx` | HTTP client |
| `pytest` | Testing framework |
| `pytest-asyncio` | Async test support |

### 5.4 Install AI Training Dependencies (Optional — for model training)

```bash
cd ai-training
pip install -r requirements.txt
cd ..
```

**What gets installed:** TensorFlow, MediaPipe, OpenCV, scikit-learn, matplotlib, Hugging Face Hub, and more.

### 5.5 Install Backend Dependencies (Optional — for full stack)

```bash
cd apps/backend
npm install
cd ../..
```

---

## 6. Environment Variables

### 6.1 Copy the Template

```bash
cp .env.example .env
```

### 6.2 Root `.env` (Required)

```bash
# Frontend port
WEB_PORT=3000

# AI service URL (from browser perspective)
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# App metadata
NEXT_PUBLIC_APP_NAME=SignBridge AI
NEXT_PUBLIC_APP_ENV=development

# Backend API URL (optional)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# AI service settings
AI_PORT=8000
MODEL_CHECKPOINT=experiments/representative/checkpoints/best.pt
VOCAB_PATH=experiments/representative/vocabulary.json
MODEL_VERSION=1.0.0

# Debug mode
SIGNBRIDGE_DEBUG=false
SIGNBRIDGE_LOG_LEVEL=INFO

# Demo mode (true = no webcam needed, uses sample data)
DEMO_MODE=false
```

### 6.3 Firebase Configuration (Optional)

Firebase is **optional**. When no Firebase credentials are provided, the app runs in demo authentication mode with mock users.

To enable Firebase:

1. Create a project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Copy the config values into `.env`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 6.4 Backend Configuration (Optional — Full Stack Only)

```bash
BACKEND_PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/signbridge_ai
```

### 6.5 AI Service `.env` (Optional)

The AI service reads from the root `.env` via Docker Compose, or you can set `apps/ai-service/.env`:

```bash
SIGNBRIDGE_HOST=0.0.0.0
SIGNBRIDGE_PORT=8000
SIGNBRIDGE_DEBUG=false
SIGNBRIDGE_LOG_LEVEL=INFO
SIGNBRIDGE_CORS_ORIGINS=http://localhost:3000
SIGNBRIDGE_RATE_LIMIT_PER_MINUTE=60
SIGNBRIDGE_DEMO_MODE=false
```

---

## 7. Running the Project

### Method 1: Docker (Recommended)

```bash
# Start all services (AI + Web)
docker compose up --build

# Or in detached mode
docker compose up --build -d

# With demo mode (no model loading)
DEMO_MODE=true docker compose up --build

# Full stack (with PostgreSQL + NestJS backend)
docker compose --profile full up --build
```

**Docker Services:**

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| `ai-service` | signbridge-ai | 8000 | FastAPI + PyTorch inference |
| `web` | signbridge-web | 3000 | Next.js frontend |
| `backend` | signbridge-backend | 3001 | NestJS API (full profile) |
| `postgres` | signbridge-postgres | 5432 | PostgreSQL (full profile) |

### Method 2: Manual (Development)

Open **3 separate terminals**:

**Terminal 1 — AI Service:**

```bash
cd apps/ai-service
set SIGNBRIDGE_DEMO_MODE=true
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**

```bash
cd apps/web
pnpm dev
```

**Terminal 3 — Backend (Optional):**

```bash
cd apps/backend
pnpm run start:dev
```

### Method 3: Make Commands

```bash
# Install everything
make install

# Start development
make dev

# Build all
make build

# Run tests
make test

# Docker commands
make docker-up
make docker-down
```

---

## 8. Verify Everything Works

### Service URLs

| Service | URL | Expected |
|---------|-----|----------|
| **Frontend** | http://localhost:3000 | Login page or dashboard |
| **AI Service Health** | http://localhost:8000/health | `{"status":"healthy"}` or `{"status":"demo"}` |
| **AI Service Docs** | http://localhost:8000/docs | Swagger UI |
| **AI Service ReDoc** | http://localhost:8000/redoc | ReDoc documentation |
| **Model Info** | http://localhost:8000/model/info | Model architecture details |

### Quick Health Check

```bash
# AI Service
curl http://localhost:8000/health

# Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Or use the health check script
./scripts/health_check.sh
```

### Pages to Verify

| Page | URL | Expected |
|------|-----|----------|
| Login | http://localhost:3000/login | Login form |
| Register | http://localhost:3000/register | Registration form |
| Dashboard | http://localhost:3000/dashboard | Stats + cards |
| Translation | http://localhost:3000/translation | Camera + translation view |
| Settings | http://localhost:3000/settings | Settings form |
| Profile | http://localhost:3000/profile | User profile |
| Dictionary | http://localhost:3000/dictionary | ISL dictionary |
| Practice | http://localhost:3000/practice | Practice mode |
| Learn | http://localhost:3000/learn | Learning modules |

### AI Service Endpoints

```bash
# List demo signs
curl http://localhost:8000/demo/signs

# Run a demo prediction
curl -X POST http://localhost:8000/demo/predict/hello

# Get a sample pose sequence
curl http://localhost:8000/demo/sequence/hello
```

---

## 9. Troubleshooting

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `pnpm: command not found` | pnpm not installed | Run `corepack enable && corepack prepare pnpm@8.15.0 --activate` |
| `ModuleNotFoundError: No module named 'torch'` | PyTorch not installed | Run `pip install -r apps/ai-service/requirements.txt` |
| `ECONNREFUSED :8000` | AI service not started | Start it: `cd apps/ai-service && python -m uvicorn main:app --port 8000` |
| `ECONNREFUSED :3000` | Frontend not started | Start it: `cd apps/web && pnpm dev` |
| Docker build fails | Out of disk space | Run `docker system prune -a` |
| Port already in use | Another process on port | Kill it: `netstat -ano \| findstr :3000` then `taskkill /PID <pid> /F` |
| Firebase auth not working | No API key configured | Add Firebase credentials to `.env` or use demo mode |
| Model not loaded | Checkpoint file missing | Verify `ai-training/experiments/representative/checkpoints/best.pt` exists |

### Getting Help

1. Check the `docs/` folder for additional documentation
2. Review existing issues on GitHub
3. Run `./scripts/health_check.sh` to diagnose service issues
4. Check logs: `docker compose logs ai-service` or `docker compose logs web`

---

## Quick Start (TL;DR)

```bash
# Clone
git clone https://github.com/your-org/SignBridge-AI.git
cd SignBridge-AI

# Setup
corepack enable && corepack prepare pnpm@8.15.0 --activate
cp .env.example .env
pnpm install
pip install -r apps/ai-service/requirements.txt

# Run (Docker)
docker compose up --build

# OR Run (Manual — 3 terminals)
cd apps/ai-service && python -m uvicorn main:app --port 8000
cd apps/web && pnpm dev

# Verify
open http://localhost:3000
curl http://localhost:8000/health
```

**Open your browser to http://localhost:3000 and you're running!**

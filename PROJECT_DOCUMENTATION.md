# SignBridge AI — Master Documentation

> **Official Comprehensive Documentation for SignBridge AI**  
> _Breaking Communication Barriers Through Indian Sign Language_

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Features & Capabilities](#2-features--capabilities)
3. [Technology Stack](#3-technology-stack)
4. [Repository & Project Structure](#4-repository--project-structure)
5. [Quick Start & Environment Setup](#5-quick-start--environment-setup)
6. [System Architecture](#6-system-architecture)
7. [Frontend Application (Next.js)](#7-frontend-application-nextjs)
8. [AI Inference Engine & Training (FastAPI & MediaPipe)](#8-ai-inference-engine--training-fastapi--mediapipe)
9. [Backend Service & Database (NestJS & Prisma)](#9-backend-service--database-nestjs--prisma)
10. [Docker Containerization & Production Deployment](#10-docker-containerization--production-deployment)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [Security, Performance & Command Reference](#12-security-performance--command-reference)
13. [Project Status & Roadmap](#13-project-status--roadmap)

---

## 1. Executive Summary

**SignBridge AI** is an AI-powered accessibility platform designed to eliminate communication
barriers between individuals who use **Indian Sign Language (ISL)** and those who do not.

### Problem Statement

Over 63 million deaf and hard-of-hearing individuals in India rely on Indian Sign Language. There is
a critical shortage of certified ISL interpreters, severely hindering access to healthcare,
education, legal services, and daily communications.

### Solution

SignBridge AI provides real-time, camera-based gesture recognition that captures sign gestures via
standard webcams, extracts body/hand landmarks with MediaPipe Holistic, processes landmark sequences
through a custom Transformer neural network (**PoseTransformer**), and outputs clear English text
and speech in real time.

---

## 2. Features & Capabilities

- 📷 **Real-Time Webcam Translation**: Live video processing at ~225ms latency with instant
  confidence scores and text rendering.
- 🎓 **Interactive Learning Platform**: Structured ISL courses (`/learn`), progress tracking
  (`/my-courses`), and verifiable certificates (`/certificates`).
- ✋ **AI Gesture Practice**: Interactive practice suite (`/practice`) with real-time pose tracking,
  landmark overlays, and instant feedback.
- 📖 **Comprehensive ISL Dictionary**: Searchable sign vocabulary (`/dictionary`) featuring demo
  video loops and landmark frame references.
- 📊 **Multi-Role Dashboards**: Customized role-based dashboards (`/dashboard`) for Learners,
  Teachers, Hospitals, NGOs, and Government organizations.
- ⚡ **Demo Fallback Mode**: Standalone demo capability enabling instant trial and verification
  without requiring full AI model weight downloads.
- 🌙 **Dark Mode & Accessibility**: Theme persistence (light/dark/system), keyboard navigation,
  screen-reader support, and skip-to-content links.

---

## 3. Technology Stack

### Monorepo Architecture

- **Package Manager**: `pnpm` (v8.15.0) with workspace configuration (`pnpm-workspace.yaml`).
- **Build Orchestration**: `Turborepo` (v1.13.4).

### Core Stack Summary

| Domain              | Service           | Technology & Libraries                                                 |
| :------------------ | :---------------- | :--------------------------------------------------------------------- |
| **Frontend**        | `apps/web`        | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, Zustand  |
| **AI Engine**       | `apps/ai-service` | Python 3.10+, FastAPI, MediaPipe Holistic, PyTorch / TensorFlow, NumPy |
| **Backend**         | `apps/backend`    | NestJS, TypeScript, Prisma ORM, PostgreSQL, Firebase Admin             |
| **Mobile**          | `apps/mobile`     | Flutter, Dart, Riverpod                                                |
| **Shared Packages** | `packages/*`      | `@signbridge/ui`, `@signbridge/types`, `@signbridge/config`            |
| **DevOps**          | Infrastructure    | Docker, Docker Compose, GitHub Actions, Playwright, Jest, Pytest       |

---

## 4. Repository & Project Structure

```
SignBridge-AI/
├── apps/                  # Core Applications & Services
│   ├── web/               # Next.js 14 Frontend Application
│   ├── backend/           # NestJS REST & Prisma API
│   ├── ai-service/        # FastAPI Python AI Inference Service
│   ├── ai-training/       # AI Pipeline & PoseTransformer Model Training
│   └── mobile/            # Flutter Mobile Application
├── packages/              # Shared Monorepo Packages & Libraries
│   ├── ui/                # Shared React UI Components
│   ├── types/             # Shared TypeScript Data Types
│   ├── config/            # Shared Environment & System Configs
│   ├── eslint-config/     # Shared ESLint Configuration
│   ├── tsconfig/          # Shared TypeScript Configuration
│   └── api-client/        # Shared API Client Helper
├── tools/                 # Tooling, E2E Testing & Logs
│   ├── scripts/           # Start, health check & verification scripts
│   ├── e2e/               # Playwright End-to-End browser tests
│   └── logs/              # Service runtime logs
├── docker-compose.yml     # Multi-container Docker compose configuration
├── Makefile               # Task automation helper
└── PROJECT_DOCUMENTATION.md # Single Master Documentation File
```

---

## 5. Quick Start & Environment Setup

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.15.0`
- **Python**: `>= 3.10.0`
- **Docker**: (Optional, for containerized run)

### Installation Steps

1. **Clone & Install Dependencies**

   ```bash
   git clone https://github.com/signbridge/signbridge-ai.git
   cd SignBridge-AI
   pnpm install
   ```

2. **Setup Environment Files**

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/backend/.env.example apps/backend/.env
   cp apps/ai-service/.env.example apps/ai-service/.env
   ```

3. **Generate Database Client**

   ```bash
   pnpm --filter @signbridge/backend exec prisma generate
   ```

4. **Start Development Servers**

   ```bash
   # Run all monorepo apps
   pnpm dev

   # Or run specific service
   pnpm --filter @signbridge/web dev       # Runs Next.js frontend at http://localhost:3000
   pnpm --filter @signbridge/backend dev   # Runs NestJS backend at http://localhost:3001
   ```

5. **Start Python AI Service**
   ```bash
   cd apps/ai-service
   python -m uvicorn main:app --reload --port 8000
   ```

---

## 6. System Architecture

```
                               ┌────────────────────────────────┐
                               │     Web Frontend (Next.js)     │
                               │     http://localhost:3000      │
                               └───────────────┬────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │   AI Service (FastAPI)    │                   │   Backend API (NestJS)    │
         │   http://localhost:8000    │                   │   http://localhost:3001    │
         └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                       │                                               │
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │  MediaPipe Pose Pipeline  │                   │   PostgreSQL & Prisma     │
         │  & PoseTransformer Model  │                   │   Database (Port 5432)    │
         └───────────────────────────┘                   └───────────────────────────┘
```

---

## 7. Frontend Application (Next.js)

The Next.js frontend provides 13 core pages and accessible UI components:

- **Routes**: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/dashboard`,
  `/translation`, `/settings`, `/profile`, `/dictionary`, `/practice`, `/learn`, `/history`,
  `/my-courses`, `/certificates`.
- **Custom Hooks**: `useCamera`, `useAIInference`, `usePredictionSmoothing`, `useSlidingWindow`,
  `usePerformanceMetrics`.
- **UI Components**: `TranslationCard`, `ConfidenceMeter`, `ConnectionStatus`,
  `PerformanceDashboard`, `SettingsPanel`.

---

## 8. AI Inference Engine & Training (FastAPI & MediaPipe)

### Architecture

- **Pose Extraction**: MediaPipe Holistic (extracts 33 body landmarks, 21 left hand landmarks, 21
  right hand landmarks).
- **Model Architecture**: **PoseTransformer** (encoder-decoder model, 90K parameters, `d_model=32`).
- **Dataset Integration**: Exploration-Lab/iSign dataset (127K video clips, 978 token vocabulary).

### API Endpoints

- `GET /health` — Service health check.
- `GET /model/info` — Returns model architecture metadata.
- `POST /predict` — Sequence landmark array → text prediction.
- `POST /webcam/frame` — Single image frame landmark extraction and prediction.
- `GET /demo/signs` & `POST /demo/predict/{sign}` — Interactive demo fallback suite.

---

## 9. Backend Service & Database (NestJS & Prisma)

- **Framework**: NestJS with TypeScript.
- **ORM**: Prisma ORM (`apps/backend/prisma/schema.prisma`).
- **Database**: PostgreSQL (Entities: `User`, `Course`, `Module`, `Lesson`, `Enrollment`, `Quiz`,
  `Certificate`).
- **Authentication**: Firebase Admin integration with local demo mock auth fallback.

---

## 10. Docker Containerization & Production Deployment

### Docker Setup

Launch the complete stack with a single command:

```bash
docker-compose up -d
```

### Docker Services

- **`ai-service`**: Runs FastAPI on Port `8000` (Python 3.10 slim image).
- **`web`**: Runs Next.js frontend on Port `3000` (Node 18 slim multi-stage image).
- **`backend`**: Runs NestJS API on Port `3001` (Node 18 slim image).
- **`postgres`**: PostgreSQL database on Port `5432`.

---

## 11. Testing & Quality Assurance

### Executing Tests

1. **Frontend Unit Tests (Jest)**

   ```bash
   pnpm --filter @signbridge/web test
   # Result: 14 test suites, 86 unit tests passing (100% pass rate)
   ```

2. **AI Service Unit Tests (Pytest)**

   ```bash
   cd apps/ai-service
   pytest
   # Result: 22 endpoint tests passing (100% pass rate)
   ```

3. **End-to-End Tests (Playwright)**
   ```bash
   pnpm test:e2e
   ```

---

## 12. Security, Performance & Command Reference

### Security Hardening

- **CORS Whitelist**: Restricted cross-origin access.
- **Rate Limiting**: 60 requests/minute per client IP.
- **Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`,
  `Referrer-Policy`, `Permissions-Policy`.
- **Non-Root Containers**: Docker containers run under unprivileged dedicated service users.

### Helpful Commands (`Makefile`)

```bash
make help          # List all make commands
make dev           # Start development servers
make build         # Build production bundles
make test          # Run test suites
make docker-up     # Launch Docker compose services
make docker-down   # Stop Docker services
```

---

## 13. Project Status & Roadmap

### Current Status: Production-Ready Demo

- ✅ Real-time gesture prediction pipeline complete
- ✅ Next.js frontend complete (13 pages, responsive, dark mode)
- ✅ FastAPI AI endpoint suite complete with demo mode
- ✅ Unit test pass rate: 100% (86 frontend tests, 22 python tests)
- ✅ Docker multi-container deployment complete

### Next Steps / Roadmap

- 🚀 Real-time WebSocket translation (replacing HTTP frame polling)
- 📊 Full PostgreSQL production persistence integration
- 📱 Flutter mobile app release completion
- ⚡ Model ONNX export & edge quantization for lower mobile latency

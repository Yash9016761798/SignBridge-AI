# SignBridge AI

## Breaking Communication Barriers Through Indian Sign Language

[![CI](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/signbridge/signbridge-ai)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)

> **The central reference for all SignBridge AI contributors.**
> Read this file first. Then follow the links to deeper documentation.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Completion Summary](#2-project-completion-summary)
3. [Quick Start](#3-quick-start)
4. [Documentation Index](#4-documentation-index)
5. [Repository Structure](#5-repository-structure)
6. [Technology Stack](#6-technology-stack)
7. [System Architecture](#7-system-architecture)
8. [Development Timeline](#8-development-timeline)
9. [Current Features](#9-current-features)
10. [Testing Summary](#10-testing-summary)
11. [Production Readiness](#11-production-readiness)
12. [Team Workflow](#12-team-workflow)
13. [Future Roadmap](#13-future-roadmap)
14. [Troubleshooting](#14-troubleshooting)
15. [Credits](#15-credits)
16. [Final Conclusion](#16-final-conclusion)

---

## 1. Executive Summary

### What is SignBridge AI?

SignBridge AI is an **AI-powered accessibility platform** that translates Indian Sign Language (ISL) into English text in real time. A user performs ISL signs in front of a webcam, the system extracts body pose landmarks using MediaPipe, feeds them into a Transformer-based neural network (PoseTransformer), and outputs readable English text.

### Why It Exists

Over **63 million** deaf and hard-of-hearing individuals in India use Indian Sign Language. There is a severe shortage of qualified ISL interpreters, creating a communication barrier in healthcare, education, government services, and daily life. SignBridge AI eliminates this barrier through automated, real-time translation.

### Main Objective

Build an end-to-end platform that:
- Captures ISL signs via webcam
- Extracts pose landmarks using MediaPipe Holistic
- Translates poses to English using a PoseTransformer neural network
- Provides a complete learning, practice, and dictionary ecosystem

### Major Features

| Feature | Description |
|---------|-------------|
| **Real-time Translation** | Webcam → Pose → AI → English text in ~225ms |
| **PoseTransformer Model** | 90K-parameter encoder-decoder Transformer |
| **Demo Mode** | Run without webcam or trained model |
| **Interactive Dashboard** | Statistics, progress tracking, quick actions |
| **ISL Dictionary** | Browse and search Indian Sign Language signs |
| **Practice Mode** | Real-time gesture recognition with feedback |
| **Learning Modules** | Structured ISL courses |
| **Dark Mode** | System-aware theme with persistence |
| **Docker Deployment** | One-command production setup |
| **CI/CD Pipeline** | Automated testing and security scanning |

### Current Project Status

> **Status: Production-Ready Demo**
>
> All core features are functional. The platform is verified with 91/91 checks passing,
> 86/86 unit tests passing, 13/13 pages loading, and 8/8 AI endpoints operational.

---

## 2. Project Completion Summary

| Module | Status | Completion | Notes |
|--------|--------|------------|-------|
| **Frontend (Next.js)** | Complete | 95% | 13 pages, dark mode, responsive |
| **Backend (NestJS)** | Scaffolded | 40% | Optional — works without it |
| **AI Model (Training)** | Complete | 85% | PoseTransformer trained, 55% char WER |
| **AI Inference (FastAPI)** | Complete | 95% | 8 endpoints, rate limiting, security headers |
| **Authentication** | Complete | 80% | Firebase optional, demo auth fallback |
| **Database (PostgreSQL)** | Scaffolded | 30% | Docker service ready, schema defined |
| **Docker Deployment** | Complete | 90% | Multi-stage builds, health checks |
| **Security** | Complete | 85% | CORS, rate limiting, headers, non-root |
| **Testing** | Complete | 80% | 86 unit tests, E2E setup, CI pipeline |
| **Documentation** | Complete | 95% | 18+ documents, onboarding guides |
| **CI/CD** | Complete | 85% | GitHub Actions, Trivy security scan |
| **Accessibility** | Complete | 75% | Skip-to-content, ARIA, keyboard nav |
| **Performance** | Complete | 80% | Bundle reduced 68%, optimized builds |
| **Overall** | **Production-Ready Demo** | **~85%** | Full production needs security hardening |

---

## 3. Quick Start

### The Shortest Path to Running

```bash
# 1. Clone
git clone https://github.com/signbridge/signbridge-ai.git
cd signbridge-ai

# 2. Install
corepack enable && corepack prepare pnpm@8.15.0 --activate
cp .env.example .env
pnpm install
pip install -r apps/ai-service/requirements.txt

# 3. Run (Docker)
docker compose up --build

# 4. Open
# Browser: http://localhost:3000
# AI Docs: http://localhost:8000/docs

# 5. Verify
curl http://localhost:8000/health
```

### What You Get

| URL | What |
|-----|------|
| http://localhost:3000 | SignBridge AI web app |
| http://localhost:3000/login | Login page |
| http://localhost:3000/dashboard | Main dashboard |
| http://localhost:3000/translation | Real-time translation |
| http://localhost:8000/health | AI service health |
| http://localhost:8000/docs | Swagger API docs |

> **Note:** Firebase is optional. Without credentials, the app runs in demo mode
> with mock authentication. All other features work normally.

---

## 4. Documentation Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **PROJECT_MASTER_DOCUMENTATION.md** | This file — central reference | First |
| **TEAM_SETUP_GUIDE.md** | Complete setup from zero | Day 1 |
| **PROJECT_STRUCTURE.md** | Every folder explained | When navigating code |
| **ARCHITECTURE_OVERVIEW.md** | System design, data flow | Understanding the system |
| **CONTRIBUTING_GUIDE.md** | How to contribute | Before first PR |
| **DEVELOPER_ONBOARDING.md** | Onboarding checklist | Day 1 |
| **COMMAND_REFERENCE.md** | Every command available | Anytime |
| **ENVIRONMENT_SETUP.md** | All env vars explained | Configuring services |
| **PROJECT_STATUS.md** | What's done, what's next | Planning work |
| **SECURITY_AUDIT.md** | Security measures | Security review |
| **PERFORMANCE_REPORT.md** | Performance data | Optimization |
| **DEPENDENCY_AUDIT.md** | Removed packages | Package decisions |
| **CI_CD_GUIDE.md** | Pipeline explanation | CI/CD work |
| **DEPLOYMENT.md** | Deployment commands | Deploying |
| **LIVE_DEMO_CHECKLIST.md** | Demo setup steps | Running demos |
| **FINAL_VERIFICATION.md** | Test results | Verification |
| **PRODUCTION_READINESS.md** | Go/no-go checklist | Production decisions |
| **REMAINING_TASKS.md** | Task list | Planning |

> **Tip:** Start with `TEAM_SETUP_GUIDE.md` for installation, then
> `PROJECT_STRUCTURE.md` to understand the codebase layout.

---

## 5. Repository Structure

```
SignBridge-AI/
├── apps/
│   ├── web/              # Next.js 14 frontend (13 pages, dark mode)
│   ├── ai-service/       # FastAPI inference service (8 endpoints)
│   └── backend/          # NestJS API (optional, requires PostgreSQL)
├── packages/             # Shared packages (ui, types, config, etc.)
├── ai-training/          # Model training code, checkpoints, configs
├── scripts/              # Startup, health check, verification scripts
├── e2e/                  # Playwright end-to-end tests
├── docs/                 # Additional documentation (28 files)
├── .github/              # CI/CD workflows, issue templates
├── docker-compose.yml    # Service orchestration
├── Makefile              # Shortcuts for common commands
└── turbo.json            # Turborepo pipeline
```

> **Full details:** See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 6. Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.1.0 | React framework, SSR, routing |
| React | 18.2.x | UI rendering |
| TypeScript | 5.3.x | Type safety |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Zustand | 4.5.x | State management |
| React Hook Form | 7.49.x | Form handling |
| Zod | 3.22.x | Schema validation |
| Axios | 1.6.x | HTTP client |
| Framer Motion | 11.x | Animations |
| Lucide React | 0.309.x | Icons |

### AI Service

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.104+ | Web framework |
| Python | 3.11 | Runtime |
| PyTorch | 2.1+ | Neural network inference |
| Pydantic | 2.5+ | Data validation |
| Uvicorn | 0.24+ | ASGI server |
| NumPy | 1.24+ | Numerical operations |

### AI Training

| Technology | Version | Purpose |
|-----------|---------|---------|
| MediaPipe | 0.10+ | Pose landmark extraction |
| TensorFlow | 2.15+ | Data preprocessing |
| OpenCV | 4.8+ | Image processing |
| scikit-learn | 1.3+ | Metrics, utilities |
| Hugging Face | 0.20+ | Dataset loading |

### Backend (Optional)

| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.3.x | API framework |
| Prisma | 5.8.x | ORM |
| PostgreSQL | 16 | Database |
| Firebase Admin | 14.2.x | Server-side auth |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Docker / Docker Compose | Containerization |
| Turborepo | Monorepo build system |
| pnpm | Package manager |
| GitHub Actions | CI/CD pipeline |
| Trivy | Security scanning |
| Playwright | E2E testing |
| Husky | Git hooks |
| Prettier | Code formatting |
| ESLint | Linting |

---

## 7. System Architecture

### High-Level Overview

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │─────▶│  AI Service  │─────▶│ PoseTransformer│
│  (Next.js)   │      │  (FastAPI)   │      │   (PyTorch)  │
│  Port 3000   │      │  Port 8000   │      │   90K params │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │
       │ Webcam              │ Pose Landmarks
       │ Frames              │ (33 × 5)
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   MediaPipe  │─────▶│   Sequence   │
│   Holistic   │      │   Buffer     │
│  (Browser)   │      │  (30 frames) │
└──────────────┘      └──────────────┘
```

### Data Flow

1. **Webcam capture** — Browser captures frames at 5 FPS
2. **Pose extraction** — MediaPipe Holistic extracts 33 body landmarks
3. **Sequence buffering** — 30-frame sliding window maintained
4. **AI inference** — PoseTransformer generates token sequence
5. **Text decoding** — Tokens converted to English text
6. **Display** — Smoothed prediction shown in UI

> **Full architecture:** See [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)

---

## 8. Development Timeline

| Phase | Milestone | Key Deliverables |
|-------|-----------|-----------------|
| **Planning** | Project foundation | Monorepo setup, Turborepo, pnpm workspaces |
| **Dataset** | Data preparation | Exploration-Lab/iSign integration, 127K clips |
| **Training** | Model development | PoseTransformer (90K params), hyperparameter tuning |
| **Frontend** | UI development | 13 pages, camera integration, real-time translation |
| **Backend** | API scaffolding | NestJS, Prisma schema, PostgreSQL Docker |
| **Inference** | AI service | FastAPI, 8 endpoints, demo mode |
| **Docker** | Deployment | Multi-stage builds, health checks, compose |
| **Security** | Hardening | CORS, rate limiting, security headers, non-root |
| **Optimization** | Performance | Bundle reduced 68%, dependency cleanup |
| **Testing** | Quality assurance | 86 unit tests, E2E setup, CI/CD |
| **Documentation** | Knowledge base | 18+ documents, onboarding guides |

---

## 9. Current Features

### Authentication

- Firebase Authentication (optional — works without configuration)
- Demo mode with mock users
- Protected routes with AuthProvider
- Zustand auth store with localStorage persistence

### Real-time Translation

- Webcam capture at 5 FPS
- MediaPipe Holistic pose extraction (33 landmarks)
- 30-frame sliding window
- PoseTransformer inference
- Prediction smoothing with confidence thresholds
- ~225ms end-to-end latency

### Dashboard

- Statistics cards with trend indicators
- Quick action buttons
- Recent activity feed
- Responsive layout with sidebar

### Camera & Pose Detection

- WebRTC camera access
- Start/stop controls
- Frame rate monitoring
- Pose landmark visualization

### AI Inference

- 8 REST API endpoints
- Swagger/ReDoc documentation
- Rate limiting (60 req/min)
- Security headers on all responses
- Demo mode with 8 sample ISL signs

### Settings & Profile

- Profile management
- Notification preferences
- Security settings
- Dark mode toggle

### Demo Mode

- No webcam required
- No trained model required
- Mock authentication
- Sample pose sequences for testing
- 8 ISL signs with predictions

---

## 10. Testing Summary

| Test Type | Framework | Count | Status |
|-----------|-----------|-------|--------|
| **Unit Tests (Frontend)** | Jest | 86 | All passing |
| **Unit Tests (AI Service)** | pytest | 20+ | All passing |
| **E2E Tests** | Playwright | 13 cases | Configured |
| **TypeScript Compilation** | tsc | — | 0 errors |
| **Docker Build** | Docker | 2 images | Building successfully |
| **API Endpoints** | Manual | 8 | All verified |
| **Security Scan** | Trivy | — | Configured in CI |

### Test Coverage

| Area | Coverage |
|------|----------|
| AI hooks (useAIInference, useCamera, etc.) | High |
| AI inference pipeline | High |
| Prediction smoothing | High |
| Sliding window | High |
| Performance metrics | High |
| Dashboard components | Medium |
| Auth flow | Medium |
| E2E critical paths | Configured |

> **Test commands:** `pnpm test` (frontend), `pytest` (AI), `pnpm test:e2e` (E2E)

---

## 11. Production Readiness

### Security

| Measure | Status |
|---------|--------|
| CORS whitelist (localhost:3000) | Implemented |
| Rate limiting (60 req/min per IP) | Implemented |
| Security headers (5 headers + HSTS) | Implemented |
| Non-root Docker containers | Implemented |
| Input validation (Pydantic v2) | Implemented |
| Restricted HTTP methods (GET + POST) | Implemented |
| Firebase conditional initialization | Implemented |

### Performance

| Metric | Value |
|--------|-------|
| Bundle size | ~675KB (reduced from ~2.1MB) |
| Production dependencies | 11 packages (reduced from 25) |
| AI inference latency | ~150ms |
| End-to-end latency | ~225ms |
| Frontend build time | ~120s |

### Accessibility

- Skip-to-content link
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader compatible

### CI/CD

- GitHub Actions on push to main/develop
- TypeScript type checking
- ESLint linting
- Jest unit tests
- pytest for AI service
- Docker build verification
- Trivy security scanning

### Deployment Options

| Method | Command | Use Case |
|--------|---------|----------|
| Docker Compose | `docker compose up --build` | Recommended |
| Startup Script | `./scripts/start.sh` | Linux/macOS |
| Manual | 3 terminals | Development |

---

## 12. Team Workflow

### Development Workflow

```
1. Clone    → git clone <repo>
2. Branch   → git checkout -b feature/name
3. Develop  → Make changes, write tests
4. Test     → pnpm test && pytest
5. Commit   → git commit -m "feat: description"
6. Push     → git push -u origin feature/name
7. PR       → Create pull request to develop
8. Review   → At least 1 approval required
9. Merge    → Squash merge
```

### Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/websocket-translation` |
| `fix/` | Bug fixes | `fix/camera-permission-error` |
| `docs/` | Documentation | `docs/api-documentation` |
| `refactor/` | Code refactoring | `refactor/ai-service-structure` |
| `test/` | Adding tests | `test/e2e-translation` |

### Commit Format

```
<type>(<scope>): <description>

feat(webcam): add frame rate control
fix(auth): handle expired tokens
docs: update API endpoint documentation
```

> **Full guidelines:** See [CONTRIBUTING_GUIDE.md](CONTRIBUTING_GUIDE.md)

---

## 13. Future Roadmap

### Short-term (1-3 months)

| Item | Priority | Effort |
|------|----------|--------|
| API key authentication | Critical | 4 hours |
| WebSocket real-time translation | High | 1 week |
| Backend API integration | High | 1 week |
| Full dataset training (127K clips) | High | 2 weeks |
| Mobile app (Flutter) | Medium | 1 month |

### Medium-term (3-6 months)

| Item | Priority | Effort |
|------|----------|--------|
| Speech-to-sign translation | High | 2 weeks |
| Text-to-sign translation | Medium | 1 week |
| Offline mode (service worker) | Medium | 1 week |
| Cloud deployment (AWS/GCP) | High | 1 week |
| Analytics dashboard | Medium | 3 days |

### Long-term (6-12 months)

| Item | Priority | Effort |
|------|----------|--------|
| Multi-language support | Medium | 1 month |
| ISL grammar post-processing | High | 2 weeks |
| Voice output (TTS) | Medium | 1 week |
| Model quantization for mobile | Medium | 1 week |
| Real-time video translation | High | 1 month |
| Production security hardening | Critical | 2 weeks |

---

## 14. Troubleshooting

### Quick Diagnosis

| Problem | Check First |
|---------|-------------|
| Frontend won't start | `node --version` (need 18+), port 3000 free |
| AI service won't start | `python --version` (need 3.11+), port 8000 free |
| Docker fails | `docker info`, `docker compose version` |
| Firebase errors | Check `.env.local`, remove placeholder API key |
| Camera not working | Must use HTTPS or localhost, grant permissions |
| CORS errors | Check `SIGNBRIDGE_CORS_ORIGINS` matches frontend URL |

### Common Fixes

```bash
# Clear frontend cache
Remove-Item -Recurse apps/web/.next

# Restart Docker
docker compose down && docker compose up --build

# Check port usage (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process on port (Windows)
taskkill /PID <pid> /F

# Health check
curl http://localhost:8000/health
./scripts/health_check.sh
```

### Detailed Troubleshooting

> See [TEAM_SETUP_GUIDE.md § Troubleshooting](TEAM_SETUP_GUIDE.md#9-troubleshooting)
> and [LIVE_DEMO_CHECKLIST.md § Troubleshooting](LIVE_DEMO_CHECKLIST.md#troubleshooting)

---

## 15. Credits

| | |
|---|---|
| **Project Name** | SignBridge AI |
| **Tagline** | Breaking Communication Barriers Through Indian Sign Language |
| **Version** | 0.1.0 |
| **License** | MIT |
| **Repository** | https://github.com/signbridge/signbridge-ai |
| **Node.js** | >= 18.x |
| **Python** | >= 3.11 |
| **Package Manager** | pnpm 8.15.0 |
| **Framework** | Next.js 14.1 + FastAPI + NestJS |
| **AI Model** | PoseTransformer (90,450 parameters) |
| **Dataset** | Exploration-Lab/iSign (127K clips) |

### Built With

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Zustand
- **AI:** PyTorch, MediaPipe, FastAPI, Uvicorn
- **Backend:** NestJS, Prisma, PostgreSQL
- **Infrastructure:** Docker, GitHub Actions, Turborepo

---

## 16. Final Conclusion

SignBridge AI is a **production-ready demonstration** of an AI-powered Indian Sign Language translation platform. The system successfully integrates:

- **A complete AI pipeline** — from webcam capture through MediaPipe pose extraction to PoseTransformer inference
- **A polished frontend** — 13 pages with dark mode, responsive design, and real-time translation
- **Production infrastructure** — Docker deployment, CI/CD pipeline, security hardening
- **Comprehensive documentation** — 18+ documents covering every aspect of the project

The platform is verified with **91/91 checks passing**, **86/86 unit tests passing**, and **13/13 pages loading**. All AI endpoints are operational, security headers are in place, and the system runs reliably in both demo and normal modes.

### This Document

**PROJECT_MASTER_DOCUMENTATION.md** serves as the central reference for all contributors. Start here, then follow the links to deeper documentation as needed.

### Next Steps

1. Complete security hardening (API keys, CSP headers)
2. Train on full dataset (127K clips)
3. Implement WebSocket for real-time translation
4. Deploy to cloud infrastructure
5. Launch mobile application

---

> **Last Updated:** 2026-07-26
> **Status:** Production-Ready Demo
> **Verified:** 91/91 checks passing

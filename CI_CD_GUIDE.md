# SignBridge AI — CI/CD Guide

**Date:** 2026-07-26

---

## Overview

SignBridge AI uses GitHub Actions for continuous integration and deployment. The pipeline runs on every push to `main` or `develop` branches, and on all pull requests to `main`.

---

## Pipeline Structure

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │     │  AI Service │     │  Security   │
│     CI      │     │     CI      │     │    Scan     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └─────────┬─────────┘                   │
                 │                             │
           ┌─────┴─────┐                       │
           │   Docker  │                       │
           │   Build   │                       │
           └───────────┘                       │
                 │                             │
                 └──────────┬──────────────────┘
                            │
                      ┌─────┴─────┐
                      │   Merge   │
                      └───────────┘
```

---

## Jobs

### 1. Frontend CI (`apps/web`)

**Trigger:** Push to main/develop, PRs to main

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install pnpm
4. Install dependencies (frozen lockfile)
5. TypeScript type check
6. ESLint
7. Unit tests (86 tests)
8. Next.js production build

**Commands:**
```bash
pnpm typecheck    # TypeScript compilation check
pnpm lint         # ESLint analysis
pnpm test         # Jest unit tests
pnpm build        # Next.js production build
```

### 2. AI Service CI (`apps/ai-service`)

**Trigger:** Push to main/develop, PRs to main

**Steps:**
1. Checkout code
2. Setup Python 3.11
3. Install pip dependencies
4. Run pytest tests

**Commands:**
```bash
pip install -r requirements.txt
python -m pytest tests/ -v
```

### 3. Docker Build

**Trigger:** Push to main only (after frontend + AI service pass)

**Steps:**
1. Checkout code
2. Setup Docker Buildx
3. Build AI Service Docker image
4. Build Web Docker image
5. Cache images in GitHub Actions cache

**Images built:**
- `signbridge-ai:latest` — FastAPI + PyTorch inference service
- `signbridge-web:latest` — Next.js frontend

### 4. Security Scan

**Trigger:** All pushes and PRs

**Steps:**
1. Checkout code
2. Run Trivy vulnerability scanner
3. Scan for CRITICAL and HIGH severity issues
4. Fail build if vulnerabilities found

---

## Environment Variables

### Required for CI

| Variable | Source | Purpose |
|----------|--------|---------|
| `CI` | GitHub Actions | Detects CI environment |
| `NODE_VERSION` | Workflow | Node.js version (18) |
| `PYTHON_VERSION` | Workflow | Python version (3.11) |

### Required for Deployment

| Variable | Source | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Secrets | PostgreSQL connection |
| `FIREBASE_PROJECT_ID` | Secrets | Firebase config |
| `FIREBASE_CLIENT_EMAIL` | Secrets | Firebase config |
| `FIREBASE_PRIVATE_KEY` | Secrets | Firebase config |

---

## Deployment

### Manual Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Verify deployment
./scripts/health_check.sh

# Or automated verification
python scripts/verify_deployment.py
```

### CI/CD Deployment (Future)

When ready for automated deployment:

1. **Add Docker registry** (GitHub Container Registry, Docker Hub)
2. **Add deployment step** to CI workflow
3. **Configure secrets** in GitHub repository settings
4. **Set up environment** (staging, production)

```yaml
# Example: Push to registry
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Push AI Service
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: ghcr.io/${{ github.repository }}/ai-service:latest
```

---

## Rollback Procedure

### Docker Compose Rollback

```bash
# Stop current deployment
docker-compose down

# Check previous image
docker images signbridge-ai

# Start with previous version
docker-compose up -d ai-service=signbridge-ai:previous-tag
```

### Git Rollback

```bash
# Revert last commit
git revert HEAD

# Push to trigger CI
git push origin main
```

---

## Monitoring CI/CD

### GitHub Actions Dashboard
- Go to repository → Actions tab
- Monitor workflow runs
- Check for failures

### Health Checks After Deployment

```bash
# Check all services
curl http://localhost:8000/health    # AI Service
curl http://localhost:3000           # Frontend

# Run full verification
./scripts/health_check.sh
```

---

## Troubleshooting

### Build Fails on TypeScript Check
```bash
# Run locally
cd apps/web
npx tsc --noEmit
# Fix errors, commit, push
```

### Build Fails on Tests
```bash
# Run tests locally
cd apps/web
npx jest --forceExit
# Fix failing tests, commit, push
```

### Docker Build Fails
```bash
# Build locally to debug
docker build -f apps/ai-service/Dockerfile .
docker build -f apps/web/Dockerfile .
```

### Security Scan Fails
```bash
# Run Trivy locally
trivy fs --severity CRITICAL,HIGH .
# Fix vulnerabilities, commit, push
```

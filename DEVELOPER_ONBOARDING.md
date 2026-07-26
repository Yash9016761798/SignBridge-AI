# SignBridge AI — Developer Onboarding

Welcome to the SignBridge AI team. This guide gets you productive on day one.

---

## Day 1 Checklist

- [ ] Read TEAM_SETUP_GUIDE.md
- [ ] Clone the repository
- [ ] Install all dependencies
- [ ] Run the project locally
- [ ] Verify all services work
- [ ] Read this document
- [ ] Read ARCHITECTURE_OVERVIEW.md
- [ ] Join the team communication channels

---

## What to Read First

### Priority 1 (Read Today)

1. **TEAM_SETUP_GUIDE.md** — How to install and run everything
2. **PROJECT_STRUCTURE.md** — Where things are in the codebase
3. **This file** — How we work

### Priority 2 (Read This Week)

4. **ARCHITECTURE_OVERVIEW.md** — How the system works
5. **CONTRIBUTING_GUIDE.md** — How to make changes
6. **COMMAND_REFERENCE.md** — All available commands
7. **PROJECT_STATUS.md** — What's done, what's next

### Priority 3 (Read When Needed)

8. **SECURITY_AUDIT.md** — Security measures
9. **PERFORMANCE_REPORT.md** — Performance data
10. **CI_CD_GUIDE.md** — How our pipeline works

---

## How to Run the Project

### Quick Start (Docker)

```bash
# Clone and start
git clone <repo-url>
cd SignBridge-AI
cp .env.example .env
docker compose up --build

# Verify
open http://localhost:3000
curl http://localhost:8000/health
```

### Development Mode (Manual)

Open 3 terminals:

```bash
# Terminal 1: AI Service
cd apps/ai-service
python -m uvicorn main:app --port 8000 --reload

# Terminal 2: Frontend
cd apps/web
pnpm dev

# Terminal 3: Backend (optional)
cd apps/backend
pnpm run start:dev
```

---

## How to Debug

### Frontend (Next.js)

1. **Browser DevTools** — F12 in Chrome/Firefox
2. **React DevTools** — Install browser extension
3. **Next.js Debugger** — Add to `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Next.js",
     "runtimeExecutable": "pnpm",
     "args": ["dev"],
     "cwd": "${workspaceFolder}/apps/web"
   }
   ```
4. **Console logs** — Use `console.log()` in components
5. **Network tab** — Monitor API calls to AI service

### AI Service (FastAPI)

1. **Swagger UI** — http://localhost:8000/docs
2. **ReDoc** — http://localhost:8000/redoc
3. **Logs** — Check terminal output
4. **Python debugger** — Add `import pdb; pdb.set_trace()` or use VS Code debugger
5. **Health check** — `curl http://localhost:8000/health`

### Common Debug Commands

```bash
# Check if service is running
curl http://localhost:8000/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Check Docker containers
docker ps | grep signbridge

# View logs
docker compose logs ai-service
docker compose logs web

# Restart a service
docker compose restart ai-service
```

---

## How to Test

### Run All Tests

```bash
# Frontend unit tests
pnpm test

# AI service tests
cd apps/ai-service && python -m pytest tests/ -v && cd ../..

# E2E tests (requires services running)
pnpm test:e2e
```

### Run Specific Tests

```bash
# Single test file
pnpm test -- path/to/file.test.ts

# Single test case
pnpm test -- -t "test name"

# AI service specific test
cd apps/ai-service && python -m pytest tests/test_file.py -v
```

### Write a Test

**Frontend (Jest):**

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**AI Service (pytest):**

```python
# tests/test_my_feature.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in ["healthy", "demo"]
```

---

## How to Create a Branch

```bash
# 1. Update your local develop
git checkout develop
git pull upstream develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Branch naming convention
# feature/description  — New features
# fix/description      — Bug fixes
# docs/description     — Documentation
# refactor/description — Code refactoring
```

---

## How to Commit

### Step 1: Stage Changes

```bash
# Stage specific files
git add apps/web/components/NewComponent.tsx
git add apps/web/hooks/useNewHook.ts

# Stage all changes (use carefully)
git add .
```

### Step 2: Commit with Message

```bash
# Use conventional commit format
git commit -m "feat(webcam): add frame rate control slider"

# For bug fixes
git commit -m "fix(auth): handle expired tokens gracefully"

# For documentation
git commit -m "docs: update API endpoint documentation"
```

### Step 3: Push

```bash
git push -u origin feature/your-feature-name
```

---

## Coding Standards

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `CameraView.tsx` |
| React hooks | camelCase + `use` | `useCamera.ts` |
| Utility functions | camelCase | `formatTime.ts` |
| Constants | UPPER_SNAKE | `API_ROUTES.ts` |
| TypeScript types | PascalCase | `TranslationResult.ts` |
| Python files | snake_case | `inference_engine.py` |
| Test files | `*.test.ts` / `test_*.py` | `useCamera.test.ts` |

### Code Style

**TypeScript:**
- Use `const` over `let`
- Prefer async/await
- Use named exports
- TypeScript strict mode enabled

**React:**
- Functional components only
- One component per file
- Keep under 200 lines
- Use hooks for state

**Python:**
- Follow PEP 8
- Type hints required
- Docstrings for functions
- Max 100 char lines

### Git Workflow

1. **Never commit directly to `main`**
2. **Always work on a feature branch**
3. **Pull before pushing**
4. **Resolve conflicts locally**
5. **Keep commits atomic** (one change per commit)

---

## Folder Structure Quick Reference

```
apps/
├── web/              # Frontend (Next.js)
│   ├── app/          # Pages and routes
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand state
│   └── lib/          # Utilities
├── ai-service/       # AI Inference (FastAPI)
│   ├── main.py       # API endpoints
│   ├── config.py     # Settings
│   └── tests/        # Tests
└── backend/          # API Server (NestJS, optional)
    └── src/          # Source code
```

---

## Getting Help

| Question | Where to Ask |
|----------|-------------|
| "How do I run this?" | TEAM_SETUP_GUIDE.md |
| "Where is this code?" | PROJECT_STRUCTURE.md |
| "How does this work?" | ARCHITECTURE_OVERVIEW.md |
| "How do I contribute?" | CONTRIBUTING_GUIDE.md |
| "What commands are there?" | COMMAND_REFERENCE.md |
| Bugs | GitHub Issues |
| Features | GitHub Discussions |
| Urgent | Team chat |

---

## First Week Goals

| Day | Goal |
|-----|------|
| Day 1 | Environment running, read setup docs |
| Day 2 | Understand architecture, run all tests |
| Day 3 | Fix a small bug or improve documentation |
| Day 4 | Implement a small feature |
| Day 5 | Submit your first PR |

---

## Codebase Orientation

### Key Files to Understand

| File | Why It Matters |
|------|---------------|
| `apps/web/app/layout.tsx` | Root layout, providers, SEO |
| `apps/web/hooks/useAIInference.ts` | How AI calls work |
| `apps/web/hooks/useCamera.ts` | How webcam access works |
| `apps/ai-service/main.py` | All AI endpoints |
| `apps/ai-service/config.py` | All configuration |
| `ai-training/models/transformer.py` | The neural network |
| `docker-compose.yml` | Service orchestration |

### Key Patterns

1. **Conditional Firebase** — Auth works with or without Firebase
2. **Demo mode** — AI service returns mock predictions
3. **Zustand stores** — Global state with localStorage persistence
4. **Custom hooks** — Encapsulate complex logic (camera, AI, translation)
5. **Pydantic models** — Type-safe API requests/responses

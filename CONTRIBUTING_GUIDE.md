# SignBridge AI — Contributing Guide

How to contribute to SignBridge AI.

---

## Table of Contents

1. [Branch Strategy](#1-branch-strategy)
2. [Setting Up Your Fork](#2-setting-up-your-fork)
3. [Making Changes](#3-making-changes)
4. [Commit Message Format](#4-commit-message-format)
5. [Pull Request Process](#5-pull-request-process)
6. [Review Checklist](#6-review-checklist)
7. [Coding Standards](#7-coding-standards)
8. [Testing Requirements](#8-testing-requirements)

---

## 1. Branch Strategy

### Branch Types

| Branch | Purpose | Example |
|--------|---------|---------|
| `main` | Production-ready code | — |
| `develop` | Integration branch | — |
| `feature/*` | New features | `feature/websocket-translation` |
| `fix/*` | Bug fixes | `fix/camera-permission-error` |
| `docs/*` | Documentation | `docs/api-documentation` |
| `refactor/*` | Code refactoring | `refactor/ai-service-structure` |
| `test/*` | Adding tests | `test/e2e-translation` |

### Workflow

```
main ─────────────────────────────────────────────────▶
  │
  └── develop ──────────────────────────────────────▶
        │
        ├── feature/websocket-translation
        ├── fix/camera-permission-error
        └── docs/api-documentation
```

### Creating a Branch

```bash
# Fetch latest
git fetch origin

# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Push branch
git push -u origin feature/your-feature-name
```

---

## 2. Setting Up Your Fork

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/SignBridge-AI.git
cd SignBridge-AI

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-ORG/SignBridge-AI.git

# Install dependencies
corepack enable && corepack prepare pnpm@8.15.0 --activate
pnpm install
pip install -r apps/ai-service/requirements.txt

# Create your branch
git checkout develop
git checkout -b feature/your-feature
```

---

## 3. Making Changes

### Before Making Changes

```bash
# Ensure you're on the latest develop
git checkout develop
git pull upstream develop

# Create your branch
git checkout -b feature/your-feature-name
```

### While Making Changes

1. **Follow coding standards** (see section 7)
2. **Write tests** for new functionality
3. **Update documentation** if adding features
4. **Keep commits focused** — one logical change per commit

### After Making Changes

```bash
# Run quality checks
pnpm lint
pnpm typecheck
pnpm test

# Run AI service tests
cd apps/ai-service
python -m pytest tests/ -v
cd ../..

# Stage and commit
git add .
git commit -m "feat: add your feature description"
```

---

## 4. Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(webcam): add frame rate control` |
| `fix` | Bug fix | `fix(auth): handle expired tokens` |
| `docs` | Documentation | `docs: update API endpoints` |
| `style` | Code style (no logic change) | `style: fix indentation` |
| `refactor` | Code refactoring | `refactor(ai): simplify inference pipeline` |
| `test` | Adding tests | `test: add E2E tests for translation` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add Docker build step` |
| `perf` | Performance improvement | `perf: optimize pose preprocessing` |

### Scopes

| Scope | Area |
|-------|------|
| `web` | Frontend (Next.js) |
| `ai` | AI Service (FastAPI) |
| `backend` | Backend API (NestJS) |
| `training` | AI Model Training |
| `docker` | Docker configuration |
| `auth` | Authentication |
| `ui` | UI components |

### Examples

```bash
git commit -m "feat(webcam): add frame rate control"
git commit -m "fix(auth): handle expired Firebase tokens gracefully"
git commit -m "docs: update TEAM_SETUP_GUIDE with CUDA instructions"
git commit -m "refactor(ai): extract preprocessing into separate module"
git commit -m "test: add unit tests for text_decoder"
git commit -m "chore: update PyTorch to 2.2.0"
```

---

## 5. Pull Request Process

### Step 1: Push Your Branch

```bash
git push -u origin feature/your-feature-name
```

### Step 2: Create Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select `develop` as the base branch
4. Select your feature branch as the compare branch
5. Fill in the PR template

### Step 3: PR Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Test addition

## Testing
- [ ] Unit tests pass (`pnpm test`)
- [ ] AI service tests pass (`pytest`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or documented)
- [ ] No console.log statements left
- [ ] No secrets or API keys committed
```

### Step 4: Wait for Review

- At least 1 approval required
- All CI checks must pass
- Address review feedback

### Step 5: Merge

- Squash merge for feature branches
- Delete branch after merge

---

## 6. Review Checklist

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings or errors
- [ ] Code follows project style (Prettier formatted)
- [ ] No commented-out code (unless explaining)
- [ ] No console.log in production code
- [ ] Meaningful variable/function names

### Functionality

- [ ] Feature works as described
- [ ] Edge cases handled
- [ ] Error messages are helpful
- [ ] No regression of existing features

### Testing

- [ ] New code has tests
- [ ] Tests are meaningful (not just coverage)
- [ ] All existing tests still pass
- [ ] E2E tests updated if UI changed

### Security

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] No XSS vulnerabilities
- [ ] API keys from environment variables

### Documentation

- [ ] README updated (if needed)
- [ ] API docs updated (if endpoints changed)
- [ ] Code comments for complex logic
- [ ] PR description is clear

---

## 7. Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer `const` over `let`
- Use async/await over .then() chains
- Use named exports over default exports
- Use Zod for runtime validation

### React

- Functional components only
- Use hooks for state and side effects
- Keep components small (< 200 lines)
- One component per file
- Use TypeScript interfaces for props

### Python

- Follow PEP 8
- Use type hints
- Use dataclasses or Pydantic for data structures
- Docstrings for all public functions
- Maximum line length: 100 characters

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid custom CSS when possible
- Use CSS variables for theme values
- Responsive design (mobile-first)

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CameraView.tsx` |
| Hooks | camelCase with `use` | `useCamera.ts` |
| Utilities | camelCase | `formatTime.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ROUTES.ts` |
| Types | PascalCase | `TranslationResult.ts` |
| Python | snake_case | `inference_engine.py` |

---

## 8. Testing Requirements

### Frontend (Jest)

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- path/to/test.test.ts
```

### AI Service (pytest)

```bash
cd apps/ai-service

# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_inference.py -v

# Run with coverage
python -m pytest tests/ --cov=.
```

### E2E (Playwright)

```bash
# Install browsers
npx playwright install

# Run all E2E tests
pnpm test:e2e

# Run specific test
npx playwright test e2e/app.spec.ts

# Debug mode
npx playwright test --debug
```

### Test Coverage Minimums

| Area | Minimum |
|------|---------|
| Unit tests | 80% |
| AI service | 70% |
| E2E critical paths | 100% |

---

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Check `docs/` for documentation

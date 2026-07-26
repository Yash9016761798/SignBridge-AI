# SignBridge AI — Command Reference

Every command available in the project.

---

## Root Commands (pnpm / Turborepo)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm install` | Install all dependencies | After clone, after pulling changes |
| `pnpm dev` | Start all services in dev mode | Development |
| `pnpm build` | Build all packages | Before deploying, verifying build |
| `pnpm lint` | Run ESLint across all packages | Before committing |
| `pnpm typecheck` | Run TypeScript type checking | Before committing |
| `pnpm test` | Run all unit tests (Jest) | Before committing, verifying |
| `pnpm test:e2e` | Run Playwright E2E tests | After services are running |
| `pnpm clean` | Remove build artifacts | When things break |
| `pnpm format` | Format code with Prettier | Before committing |
| `pnpm format:check` | Check code formatting | CI verification |
| `pnpm prepare` | Install Git hooks | After fresh clone |

---

## Frontend Commands (apps/web)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm --filter @signbridge/web dev` | Start Next.js dev server | Development |
| `pnpm --filter @signbridge/web build` | Production build | Deploying |
| `pnpm --filter @signbridge/web start` | Start production server | After build |
| `pnpm --filter @signbridge/web lint` | Run ESLint | Before committing |
| `pnpm --filter @signbridge/web typecheck` | TypeScript check | Before committing |
| `pnpm --filter @signbridge/web test` | Run Jest tests | Before committing |

---

## AI Service Commands (apps/ai-service)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `cd apps/ai-service && python -m uvicorn main:app --port 8000` | Start AI service | Development |
| `cd apps/ai-service && python -m uvicorn main:app --port 8000 --reload` | Start with auto-reload | Development (watches for changes) |
| `cd apps/ai-service && python -m pytest tests/ -v` | Run AI tests | Before committing |
| `pip install -r apps/ai-service/requirements.txt` | Install Python deps | After clone, after updating requirements |

---

## Backend Commands (apps/backend)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm --filter @signbridge/backend dev` | Start NestJS dev server | Development |
| `pnpm --filter @signbridge/backend build` | Build NestJS | Deploying |
| `pnpm --filter @signbridge/backend start:prod` | Start production | After build |
| `pnpm --filter @signbridge/backend lint` | Run ESLint | Before committing |
| `pnpm --filter @signbridge/backend test` | Run Jest tests | Before committing |

---

## Database Commands (apps/backend)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `cd apps/backend && npx prisma generate` | Generate Prisma client | After schema changes |
| `cd apps/backend && npx prisma migrate dev` | Create migration | After schema changes |
| `cd apps/backend && npx prisma db push` | Push schema to DB | Quick prototyping |
| `cd apps/backend && npx prisma db seed` | Seed database | After fresh DB |
| `cd apps/backend && npx prisma studio` | Open Prisma Studio | Inspecting data |

---

## Docker Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `docker compose up` | Start all services | Running the full stack |
| `docker compose up --build` | Rebuild and start | After code changes |
| `docker compose up -d` | Start in background | Detached mode |
| `docker compose down` | Stop all services | Stopping |
| `docker compose down -v` | Stop and remove volumes | Fresh start |
| `docker compose build` | Build all images | Before deploying |
| `docker compose logs` | View all logs | Debugging |
| `docker compose logs ai-service` | View AI service logs | Debugging AI |
| `docker compose logs web` | View frontend logs | Debugging frontend |
| `docker compose ps` | List running services | Checking status |
| `docker compose restart` | Restart all services | After config changes |
| `docker compose restart ai-service` | Restart AI service | After AI changes |

### Docker with Profiles

| Command | Purpose |
|---------|---------|
| `docker compose --profile full up` | Start with PostgreSQL + Backend |
| `docker compose --profile full up -d` | Full stack in background |

### Docker with Demo Mode

```bash
DEMO_MODE=true docker compose up --build
```

---

## Make Commands

| Command | Purpose |
|---------|---------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies |
| `make dev` | Start all services |
| `make dev-web` | Start web only |
| `make dev-backend` | Start backend only |
| `make dev-ai` | Start AI service only |
| `make build` | Build all packages |
| `make build-web` | Build web only |
| `make lint` | Run linting |
| `make format` | Format code |
| `make typecheck` | Type check |
| `make test` | Run all tests |
| `make clean` | Clean build artifacts |
| `make db-generate` | Generate Prisma client |
| `make db-migrate` | Run migrations |
| `make db-push` | Push schema |
| `make db-seed` | Seed database |
| `make db-studio` | Open Prisma Studio |
| `make docker-up` | Start Docker services |
| `make docker-down` | Stop Docker services |
| `make docker-build` | Build Docker images |
| `make docker-logs` | View Docker logs |
| `make quality` | Run lint + typecheck + format |

---

## Script Commands

| Command | Purpose | Platform |
|---------|---------|----------|
| `./scripts/start.sh` | Start all services | Linux/macOS |
| `scripts\start.bat` | Start all services | Windows |
| `./scripts/start.sh --demo` | Start in demo mode | Linux/macOS |
| `./scripts/start.sh --build` | Force rebuild | Linux/macOS |
| `./scripts/start.sh --detach` | Start in background | Linux/macOS |
| `./scripts/health_check.sh` | Verify services | Linux/macOS |
| `scripts\health_check.bat` | Verify services | Windows |
| `python scripts/verify_deployment.py` | Automated verification | Cross-platform |

---

## Playwright E2E Commands

| Command | Purpose |
|---------|---------|
| `npx playwright install` | Install browsers |
| `npx playwright test` | Run all E2E tests |
| `npx playwright test --debug` | Debug mode |
| `npx playwright test --ui` | UI mode |
| `npx playwright show-report` | View HTML report |
| `npx playwright test e2e/app.spec.ts` | Run specific test file |

---

## Git Commands

| Command | Purpose |
|---------|---------|
| `git checkout develop && git pull` | Update local develop |
| `git checkout -b feature/name` | Create feature branch |
| `git add .` | Stage all changes |
| `git commit -m "feat: description"` | Commit with message |
| `git push -u origin feature/name` | Push branch |
| `git fetch upstream` | Fetch upstream changes |
| `git merge upstream/develop` | Merge upstream |

---

## Quick Reference Card

### Start Development

```bash
# Docker (simplest)
docker compose up --build

# Manual (3 terminals)
# Terminal 1:
cd apps/ai-service && python -m uvicorn main:app --port 8000
# Terminal 2:
cd apps/web && pnpm dev
# Terminal 3 (optional):
cd apps/backend && pnpm run start:dev
```

### Verify

```bash
# Check all services
curl http://localhost:8000/health
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Run health check script
./scripts/health_check.sh
```

### Test

```bash
# All tests
pnpm test                    # Frontend unit tests
cd apps/ai-service && python -m pytest tests/ -v  # AI tests
pnpm test:e2e                # E2E tests
```

### Quality

```bash
pnpm lint && pnpm typecheck && pnpm test
```

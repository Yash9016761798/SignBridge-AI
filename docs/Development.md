# Development Guide

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the project's coding standards:

- Use TypeScript strict mode
- Follow the existing code style
- Write meaningful commits

### 3. Run Quality Checks

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Format
pnpm format

# All checks
make quality
```

### 4. Commit Changes

We use Conventional Commits:

```bash
git commit -m "feat(module): add new feature"
```

Examples:

- `feat(auth): add Firebase login`
- `fix(api): resolve JWT validation issue`
- `docs(readme): update setup guide`

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub.

## Code Structure

### Web App (`apps/web/`)

```
web/
├── app/              # Next.js App Router pages
├── components/       # Shared components
├── features/         # Feature-specific code
├── hooks/            # Custom React hooks
├── services/         # API services
├── lib/              # Utility libraries
├── types/            # TypeScript types
├── utils/            # Utility functions
├── constants/        # Constants
├── providers/        # React providers
└── styles/           # Global styles
```

### Backend (`apps/backend/`)

```
backend/
├── src/
│   ├── main.ts       # Application entry
│   ├── app.module.ts # Root module
│   ├── health/       # Health check module
│   ├── common/       # Shared utilities
│   └── config/       # Configuration
├── prisma/
│   └── schema.prisma # Database schema
└── test/             # Test files
```

### AI Service (`apps/ai-service/`)

```
ai-service/
├── app/
│   ├── main.py       # FastAPI application
│   ├── config.py     # Configuration
│   ├── api/          # API endpoints
│   ├── core/         # Core logic
│   ├── models/       # AI models
│   └── services/     # Business logic
└── requirements.txt  # Python dependencies
```

## Testing

```bash
# Run all tests
pnpm test

# Run web tests
pnpm --filter @signbridge/web test

# Run backend tests
pnpm --filter @signbridge/backend test
```

## Database

```bash
# Generate Prisma client
pnpm --filter @signbridge/backend prisma:generate

# Create migration
pnpm --filter @signbridge/backend prisma:migrate

# Open Prisma Studio
pnpm --filter @signbridge/backend prisma:studio
```

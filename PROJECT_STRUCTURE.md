# SignBridge AI — Project Structure

Complete directory reference for the monorepo.

---

## Root Directory

```
SignBridge-AI/
├── .github/                  # GitHub configuration
│   ├── CODEOWNERS            # Code ownership rules
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── .husky/                   # Git hooks (pre-commit)
├── .vscode/                  # VS Code workspace settings
├── ai-training/              # AI model training code
├── apps/                     # Application packages
│   ├── ai-service/           # FastAPI inference service
│   ├── backend/              # NestJS API (optional)
│   └── web/                  # Next.js frontend
├── docs/                     # Documentation
├── e2e/                      # End-to-end tests (Playwright)
├── logs/                     # Runtime logs
├── packages/                 # Shared packages
├── scripts/                  # Deployment & utility scripts
├── .editorconfig             # Editor configuration
├── .env                      # Environment variables (not committed)
├── .env.example              # Environment template
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Git ignore rules
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # Contribution guidelines
├── Makefile                  # Make commands
├── README.md                 # Project README
├── SECURITY.md               # Security policy
├── docker-compose.yml        # Docker services
├── package.json              # Root package.json
├── playwright.config.ts      # Playwright E2E config
├── pnpm-lock.yaml            # pnpm lockfile
├── pnpm-workspace.yaml       # Monorepo workspace config
├── turbo.json                # Turborepo pipeline config
└── commitlint.config.js      # Commit message linting
```

---

## `apps/` — Applications

### `apps/web/` — Next.js Frontend

```
apps/web/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth route group
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── forgot-password/  # Password reset request
│   │   ├── reset-password/   # Password reset form
│   │   └── layout.tsx        # Auth layout
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── dashboard/        # Main dashboard
│   │   ├── translation/      # Real-time translation page
│   │   ├── practice/         # Practice mode
│   │   ├── learn/            # Learning modules
│   │   ├── dictionary/       # ISL dictionary
│   │   ├── history/          # Translation history
│   │   ├── settings/         # User settings
│   │   ├── profile/          # User profile
│   │   ├── certificates/     # Achievement certificates
│   │   ├── my-courses/       # Enrolled courses
│   │   ├── layout.tsx        # Dashboard layout (sidebar + navbar)
│   │   └── loading.tsx       # Loading skeleton
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404 page
│   ├── globals.css           # Global styles + dark mode
│   ├── layout.tsx            # Root layout (ThemeProvider, SEO)
│   └── page.tsx              # Root page (redirect)
├── components/
│   ├── ai/                   # AI-related components
│   │   ├── CameraView.tsx    # Webcam display
│   │   ├── PredictionDisplay.tsx  # Translation output
│   │   ├── TranslationControls.tsx  # Start/stop controls
│   │   ├── ConfidenceMeter.tsx  # Confidence indicator
│   │   └── ModelStatus.tsx   # Model loading status
│   ├── auth/                 # Authentication components
│   │   └── ProtectedRoute.tsx  # Route guard
│   ├── dashboard/            # Dashboard UI components
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── TopNavbar.tsx     # Top navigation bar
│   │   ├── ThemeToggle.tsx   # Dark mode toggle
│   │   ├── StatsCards.tsx    # Dashboard statistics
│   │   └── QuickActions.tsx  # Quick action buttons
│   └── dictionary/           # Dictionary components
├── config/                   # App configuration
├── constants/                # Constant values
├── features/                 # Feature modules
├── hooks/                    # Custom React hooks
│   ├── useCamera.ts          # Webcam control
│   ├── useAIInference.ts     # AI prediction calls
│   ├── useRealtimeTranslation.ts  # Real-time translation pipeline
│   ├── usePredictionSmoothing.ts  # Smoothing predictions
│   ├── useSlidingWindow.ts   # Sliding window for sequences
│   └── usePerformanceMetrics.ts  # FPS/latency tracking
├── lib/                      # Utility libraries
│   ├── api.ts                # API client (axios + Firebase interceptor)
│   ├── firebase.ts           # Firebase initialization (conditional)
│   └── utils.ts              # General utilities
├── providers/                # React context providers
│   ├── AuthProvider.tsx       # Authentication context
│   └── ThemeProvider.tsx      # Dark mode context
├── services/                 # External service integrations
├── stores/                   # Zustand state stores
│   ├── auth-store.ts         # Auth state + demo fallback
│   └── ui-store.ts           # UI state
├── styles/                   # Additional styles
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── public/                   # Static assets
├── Dockerfile                # Production Docker build
├── jest.config.js            # Jest configuration
├── next.config.js            # Next.js configuration
├── package.json              # Frontend dependencies
├── postcss.config.js         # PostCSS config
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

### `apps/ai-service/` — FastAPI Inference Service

```
apps/ai-service/
├── main.py                   # FastAPI application + endpoints
├── config.py                 # Settings (env vars)
├── schemas.py                # Pydantic models
├── model_loader.py           # Model loading from checkpoint
├── inference_engine.py       # Prediction pipeline
├── preprocessor.py           # Pose data preprocessing
├── text_decoder.py           # Token → text decoding
├── demo.py                   # Demo mode (sample sequences)
├── requirements.txt          # Python dependencies
├── Dockerfile                # Production Docker build
├── .env.example              # Environment template
├── tests/                    # pytest test files
└── README.md                 # Service documentation
```

**Key files:**
- `main.py` — FastAPI app with 8 endpoints, CORS, rate limiting, security headers
- `config.py` — Settings dataclass loaded from environment variables
- `model_loader.py` — Loads PoseTransformer checkpoint + vocabulary
- `inference_engine.py` — Runs model prediction on pose sequences
- `schemas.py` — Pydantic v2 request/response models
- `demo.py` — 8 sample ISL signs for testing without webcam

### `apps/backend/` — NestJS API (Optional)

```
apps/backend/
├── src/
│   ├── main.ts               # Application entry point
│   ├── app.module.ts          # Root module
│   └── ...                    # Feature modules
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json               # Backend dependencies
├── Dockerfile                 # Production Docker build
├── nest-cli.json              # NestJS CLI config
├── tsconfig.json              # TypeScript config
└── .env.example               # Environment template
```

**Dependencies:** NestJS, Prisma, Firebase Admin, Pino logger, Swagger, Helmet, Compression

---

## `ai-training/` — AI Model Training

```
ai-training/
├── models/                   # Neural network architectures
│   ├── transformer.py        # PoseTransformer model
│   ├── encoder.py            # Transformer encoder
│   ├── decoder.py            # Transformer decoder
│   ├── attention.py          # Multi-head attention
│   ├── embedding.py          # Token + positional embeddings
│   ├── positional_encoding.py  # Sinusoidal encoding
│   ├── loss.py               # CTC + Cross-entropy loss
│   └── checkpoints/          # Saved model checkpoints
├── training/                 # Training scripts
├── preprocessing/            # Data preprocessing
├── pose/                     # Pose extraction utilities
├── tokenizer/                # Tokenizer code
├── datasets/                 # Dataset loaders
├── configs/                  # Training configurations
├── experiments/              # Experiment results
│   └── representative/
│       ├── checkpoints/
│       │   └── best.pt       # Best model checkpoint (1,162 KB)
│       └── vocabulary.json   # Token vocabulary (978 tokens)
├── notebooks/                # Jupyter notebooks
├── colab/                    # Google Colab scripts
├── scripts/                  # Training utilities
├── weights/                  # Model weights
├── logs/                     # Training logs
├── Dockerfile                # Training container
├── requirements.txt          # Python dependencies
└── README.md                 # Training documentation
```

**Key directories:**
- `models/transformer.py` — PoseTransformer architecture (90K params)
- `experiments/representative/` — Best trained model + vocabulary
- `training/` — Training loop, validation, checkpointing
- `pose/` — MediaPipe landmark extraction
- `preprocessing/` — Data normalization, sequence padding

---

## `packages/` — Shared Packages

```
packages/
├── api-client/               # API client library
├── config/                   # Shared configuration
├── eslint-config/            # Shared ESLint rules
├── tsconfig/                 # Shared TypeScript configs
├── types/                    # Shared TypeScript types
└── ui/                       # Shared UI components
```

These are consumed by the apps via the monorepo workspace protocol (`@signbridge/web`, `@signbridge/types`, etc.).

---

## `scripts/` — Utility Scripts

```
scripts/
├── start.sh                  # Startup script (Linux/macOS)
├── start.bat                 # Startup script (Windows)
├── health_check.sh           # Health verification (Linux/macOS)
├── health_check.bat          # Health verification (Windows)
└── verify_deployment.py      # Automated deployment verification
```

---

## `e2e/` — End-to-End Tests

```
e2e/
└── app.spec.ts               # Playwright E2E tests (13 test cases)
```

Tests: homepage, auth pages, dashboard, practice, translation, settings, profile, dictionary, learn, 404.

---

## `docs/` — Documentation

```
docs/
├── TEAM_SETUP_GUIDE.md
├── PROJECT_STATUS.md
├── PROJECT_STRUCTURE.md
├── ARCHITECTURE_OVERVIEW.md
├── CONTRIBUTING_GUIDE.md
├── DEVELOPER_ONBOARDING.md
├── COMMAND_REFERENCE.md
└── ENVIRONMENT_SETUP.md
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo config, scripts, devDependencies |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `turbo.json` | Turborepo build pipeline |
| `docker-compose.yml` | Docker service definitions |
| `.env.example` | Environment variable template |
| `.eslintrc.js` | ESLint rules |
| `.prettierrc` | Prettier formatting rules |
| `commitlint.config.js` | Commit message format rules |
| `playwright.config.ts` | E2E test configuration |
| `Makefile` | Shortcuts for common commands |
| `.editorconfig` | Editor settings |

# Architecture

## System Overview

SignBridge AI is composed of four major systems:

```
                 Users
                    │
        ┌───────────┴────────────┐
        │                        │
   Web Application         Mobile Application
      (Next.js)               (Flutter)
        │                        │
        └───────────┬────────────┘
                    │
              REST API Gateway
                    │
               NestJS Backend
                    │
      ┌─────────────┼──────────────┐
      │             │              │
 PostgreSQL    Firebase Auth   AI Service
    Prisma                        FastAPI
                                    │
                     MediaPipe + TensorFlow + OpenCV
```

## Monorepo Structure

The project uses Turborepo with pnpm workspaces for managing the monorepo.

### Apps

| App          | Description              | Technology                 |
| ------------ | ------------------------ | -------------------------- |
| `web`        | Frontend web application | Next.js, React, TypeScript |
| `backend`    | REST API server          | NestJS, TypeScript, Prisma |
| `mobile`     | Mobile application       | Flutter, Dart              |
| `ai-service` | AI inference service     | FastAPI, Python            |

### Packages

| Package         | Description                     |
| --------------- | ------------------------------- |
| `ui`            | Shared UI components            |
| `types`         | Shared TypeScript types         |
| `config`        | Shared configuration            |
| `eslint-config` | Shared ESLint configuration     |
| `tsconfig`      | Shared TypeScript configuration |
| `api-client`    | API client (placeholder)        |

## Data Flow

1. **Client Request**: User interacts with web or mobile app
2. **API Gateway**: Request is sent to NestJS backend
3. **Authentication**: Firebase JWT is verified
4. **Business Logic**: Service layer processes the request
5. **Database**: Prisma ORM interacts with PostgreSQL
6. **AI Processing**: Backend delegates AI tasks to FastAPI service
7. **Response**: Structured JSON response is returned

## Security Architecture

- **Authentication**: Firebase Authentication
- **Authorization**: Role-Based Access Control (RBAC)
- **Data Protection**: HTTPS everywhere, encrypted secrets
- **Input Validation**: DTO validation with class-validator/zod
- **API Security**: Rate limiting, CORS, helmet headers

## Deployment Architecture

| Service    | Platform            |
| ---------- | ------------------- |
| Web        | Vercel              |
| Backend    | Railway             |
| AI Service | Railway/Render      |
| Database   | Supabase PostgreSQL |
| Storage    | Cloudinary          |
| CI/CD      | GitHub Actions      |

## Backend Infrastructure

The backend follows Clean Architecture with NestJS, featuring:

### Global Configuration
- **ConfigModule**: Centralized configuration management
- **Environment Variables**: Type-safe config with validation
- **Global Prefix**: `/api/v1` for all endpoints
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security HTTP headers
- **Compression**: Response compression

### Request Pipeline
```
Request → RequestId → RequestLogging → ValidationPipe → AuthGuard → RolesGuard → Controller → Service → Repository → Prisma → PostgreSQL
```

### Middleware
- **RequestIdMiddleware**: Generates/propagates request IDs for tracing
- **RequestLoggingMiddleware**: Logs all incoming requests

### Guards
- **FirebaseAuthGuard**: Verifies Firebase JWT and loads user from database
- **RolesGuard**: Enforces role-based access control based on database roles

### Authentication Architecture
```
Client → Firebase Auth → Firebase ID Token → Backend
Backend → Verify Token → Load User from DB → Attach to Request
Guard → Check @Public() → Check @Roles() → Allow/Deny
```

### Interceptors
- **LoggingInterceptor**: Logs request/response timing
- **ResponseTransformInterceptor**: Wraps responses in standard format

### Exception Handling
- **GlobalExceptionFilter**: Catches all exceptions, returns standard error format
- **Custom Exceptions**: NotFound, Conflict, Validation, Unauthorized, Forbidden, BadRequest, InternalServer

### Logging
- **Pino**: Structured JSON logging
- **nestjs-pino**: NestJS integration
- **Environment-based**: Pretty in dev, JSON in production

### Database
- **PrismaService**: Global Prisma client with lifecycle management
- **Transaction Helper**: Simplified transaction API
- **Health Check**: Database connectivity verification

### Swagger
- **Auto-generated**: OpenAPI 3.0 documentation
- **Environment-based**: Enabled in development, disabled in production
- **Bearer Auth**: Placeholder for Firebase JWT

### Health Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/health` | API and database health |
| `GET /api/v1/health/live` | Application liveness |
| `GET /api/v1/health/ready` | Application readiness |

### Decorators
| Decorator | Description |
|-----------|-------------|
| `@Public()` | Marks endpoint as public (no auth required) |
| `@Roles(...)` | Specifies required roles |
| `@CurrentUser()` | Extracts current user from request |

### Folder Structure
```
backend/src/
├── auth/                # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── firebase.service.ts
│   ├── dto/
│   └── interfaces/
├── common/
│   ├── decorators/    # @Public, @Roles, @CurrentUser
│   ├── dto/           # Data transfer objects
│   ├── exceptions/    # Custom exception classes
│   ├── filters/       # Global exception filter
│   ├── guards/        # FirebaseAuthGuard, RolesGuard
│   ├── interceptors/  # Logging and transform interceptors
│   ├── middleware/     # Request ID and logging middleware
│   ├── pipes/         # Validation pipes
│   ├── utils/         # Utility functions
│   ├── constants/     # Application constants
│   └── interfaces/    # TypeScript interfaces
├── config/            # Configuration files
├── database/          # Prisma module and service
├── logger/            # Pino logging module
├── swagger/           # Swagger setup
├── health/            # Health check endpoints
└── modules/           # Feature modules (users, courses, etc.)
```

## Frontend Architecture

### Web Application Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, register, etc.)
│   ├── (dashboard)/        # Dashboard pages (protected)
│   └── error/              # Error pages (401, 403, 404, 500)
├── components/             # Reusable components
│   ├── auth/               # Authentication components
│   └── dashboard/          # Dashboard shell components
├── config/                 # Configuration files
│   └── navigation.ts       # Navigation configuration
├── features/               # Feature modules (placeholder)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and API client
│   ├── firebase.ts         # Firebase Client SDK
│   └── api.ts              # Axios API client
├── providers/              # React providers
│   └── AuthProvider.tsx     # Auth context provider
├── stores/                 # Zustand stores
│   ├── auth-store.ts       # Authentication state
│   └── ui-store.ts         # UI state (sidebar, theme)
├── types/                  # TypeScript types
│   └── auth.ts             # Auth types
└── middleware.ts           # Next.js middleware
```

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │  Top Navbar           │
│  - Logo                 │  - Breadcrumbs        │
│  - Navigation items     │  - Search             │
│  - Role-based menu      │  - Notifications      │
│  - Help & Support       │  - User Menu          │
│                         ├───────────────────────┤
│                         │  Main Content Area    │
│                         │  - Page Header        │
│                         │  - Content            │
└─────────────────────────────────────────────────┘
```

### State Management

- **Auth State**: Zustand store for user, authentication status
- **UI State**: Zustand store for sidebar, mobile drawer
- **Server State**: TanStack Query (future, for API data)

## Database Schema

The database schema is defined in `apps/backend/prisma/schema.prisma` and consists of 26 models and 9 enums.

### Key Entities
- **Identity & Access**: User, Role, Organization
- **Learning**: Course, Module, Lesson
- **Quiz System**: Quiz, Question, AnswerOption
- **Progress & Assessment**: UserProgress, QuizAttempt, Certificate
- **AI Practice**: PracticeSession, GesturePrediction
- **Translation**: TranslationSession, TranslationMessage
- **Dictionary**: SignCategory, SignWord, FavoriteSign
- **Communication**: Notification, Announcement, ContactMessage
- **File Storage**: File
- **Administration**: AuditLog, SystemSetting, ActivityLog

### Schema Documentation
- Complete schema: `apps/backend/prisma/schema.prisma`
- Entity relationships: `docs/EntityRelationships.md`
- Seed data: `apps/backend/prisma/seed.ts`

# Architecture Decision Records

This document records architectural decisions made for SignBridge AI.

## ADR-001: Monorepo with Turborepo

**Status:** Accepted

**Context:** The project consists of multiple applications (web, backend, mobile, AI service) and
shared packages.

**Decision:** Use Turborepo with pnpm workspaces for monorepo management.

**Consequences:**

- Unified dependency management
- Shared code between packages
- Parallel builds
- Consistent tooling
- Improved developer experience

## ADR-002: Next.js for Frontend

**Status:** Accepted

**Context:** Need a modern React framework for the web application.

**Decision:** Use Next.js with App Router.

**Consequences:**

- Server-side rendering capabilities
- Excellent performance
- Strong TypeScript support
- Rich ecosystem
- Good SEO capabilities

## ADR-003: NestJS for Backend

**Status:** Accepted

**Context:** Need a scalable, maintainable backend framework.

**Decision:** Use NestJS with TypeScript.

**Consequences:**

- Modular architecture
- Strong typing
- Dependency injection
- Excellent documentation
- Enterprise-ready

## ADR-004: FastAPI for AI Service

**Status:** Accepted

**Context:** Need a Python-based API for AI/ML inference.

**Decision:** Use FastAPI for the AI service.

**Consequences:**

- High performance
- Automatic API documentation
- Type validation with Pydantic
- Async support
- Python ecosystem for ML

## ADR-005: PostgreSQL for Database

**Status:** Accepted

**Context:** Need a reliable, scalable relational database.

**Decision:** Use PostgreSQL with Prisma ORM.

**Consequences:**

- ACID compliance
- Rich feature set
- Strong community
- Excellent tooling
- JSON support when needed

## ADR-006: Firebase Authentication

**Status:** Accepted

**Context:** Need a secure, scalable authentication system.

**Decision:** Use Firebase Authentication.

**Consequences:**

- Multiple auth providers
- Scalable infrastructure
- Easy integration
- Good documentation
- Free tier available

## ADR-007: Flutter for Mobile

**Status:** Accepted

**Context:** Need to support both Android and iOS.

**Decision:** Use Flutter for cross-platform mobile development.

**Consequences:**

- Single codebase
- Native performance
- Rich UI capabilities
- Growing ecosystem
- Good documentation

## ADR-008: Feature-First Architecture

**Status:** Accepted

**Context:** Need a scalable code organization strategy.

**Decision:** Use feature-first (domain-driven) architecture.

**Consequences:**

- Clear separation of concerns
- Easy to find related code
- Scalable structure
- Better code organization
- Easier testing

## ADR-009: REST APIs Only

**Status:** Accepted

**Context:** Need a simple, well-understood API approach.

**Decision:** Use REST APIs exclusively.

**Consequences:**

- Wide tooling support
- Easy to understand
- Cacheable
- Stateless
- Good documentation tools

## ADR-010: Docker for Deployment

**Status:** Accepted

**Context:** Need consistent deployment across environments.

**Decision:** Use Docker for containerization.

**Consequences:**

- Environment consistency
- Easy deployment
- Scalable
- Good CI/CD support
- Industry standard

# Setup Guide

## Prerequisites

- **Node.js**: 18 or higher
- **pnpm**: 8 or higher
- **Python**: 3.10 or higher
- **Flutter**: 3.x (for mobile development)
- **Docker**: Optional, for containerized development

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/signbridge/signbridge-ai.git
cd signbridge-ai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment files:

```bash
# Web
cp apps/web/.env.example apps/web/.env.local

# Backend
cp apps/backend/.env.example apps/backend/.env

# AI Service
cp apps/ai-service/.env.example apps/ai-service/.env
```

Edit each file with your configuration values.

### 4. Database Setup

```bash
# Generate Prisma client
cd apps/backend
pnpm prisma generate

# Run migrations (requires PostgreSQL)
pnpm prisma migrate dev

# Seed database (optional)
pnpm prisma db seed
```

### 5. Start Development

```bash
# From root directory
pnpm dev
```

This will start:

- Web: http://localhost:3000
- Backend: http://localhost:3001
- AI Service: http://localhost:8000

## Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## IDE Setup

### VS Code

1. Install recommended extensions (see `.vscode/extensions.json`)
2. Open the project folder
3. Select "Use Workspace Version" when prompted about TypeScript

## Mobile Setup

```bash
cd apps/mobile

# Get dependencies
flutter pub get

# Run on device/emulator
flutter run
```

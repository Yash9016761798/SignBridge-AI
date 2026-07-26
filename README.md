# SignBridge AI

Breaking Communication Barriers Through Indian Sign Language

[![CI](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

SignBridge AI is an AI-powered accessibility platform designed to eliminate communication barriers
between people who communicate using Indian Sign Language (ISL) and those who do not.

## Features

- **Learn ISL** - Interactive courses with AI-assisted learning
- **AI Practice** - Real-time gesture recognition and feedback
- **Translation** - Text, speech, and sign language translation
- **Dictionary** - Comprehensive Indian Sign Language dictionary
- **Dashboards** - Role-based dashboards for learners, teachers, hospitals, NGOs, and government

## Tech Stack

| Service        | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | Next.js, React, TypeScript, Tailwind CSS |
| Backend        | NestJS, TypeScript, Prisma, PostgreSQL   |
| Mobile         | Flutter, Dart, Riverpod                  |
| AI Service     | FastAPI, Python, TensorFlow, MediaPipe   |
| Infrastructure | Docker, GitHub Actions, Vercel, Railway  |

## Project Structure

```
SignBridge-AI/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── backend/      # NestJS API
│   ├── mobile/       # Flutter app
│   └── ai-service/   # FastAPI AI service
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Shared configuration
│   ├── eslint-config/# Shared ESLint config
│   ├── tsconfig/     # Shared TypeScript config
│   └── api-client/   # API client (placeholder)
├── docs/             # Documentation
├── MASTER_PROMPT/    # AI development prompts
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+
- Flutter 3.x
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/signbridge/signbridge-ai.git
cd signbridge-ai

# Install dependencies
pnpm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env
cp apps/ai-service/.env.example apps/ai-service/.env
```

### Development

```bash
# Start all services
pnpm dev

# Start specific service
pnpm --filter @signbridge/web dev
pnpm --filter @signbridge/backend dev
```

### Docker

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## Available Commands

Run `make help` to see all available commands:

```bash
make dev          # Start all services
make build        # Build all applications
make lint         # Run linting
make test         # Run tests
make docker-up    # Start Docker services
```

## Documentation

- [Architecture](docs/Architecture.md)
- [Setup Guide](docs/Setup.md)
- [Development Guide](docs/Development.md)
- [Deployment Guide](docs/Deployment.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

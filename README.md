# SignBridge AI

> Breaking Communication Barriers Through Indian Sign Language

[![CI](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/signbridge/signbridge-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

SignBridge AI is an AI-powered accessibility platform designed to eliminate communication barriers
between individuals who communicate using Indian Sign Language (ISL) and non-signers. It features
real-time webcam gesture translation, interactive learning courses, practice suites with gesture
feedback, an ISL dictionary, and multi-role dashboards.

---

## 📘 Complete Documentation

All detailed architecture specs, setup guides, API endpoints, testing, security, and developer
instructions are consolidated in the master documentation:

👉 **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)**

---

## Quick Start

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.15.0`
- **Python**: `>= 3.10.0`

### Installation & Run

```bash
# Clone repository
git clone https://github.com/signbridge/signbridge-ai.git
cd SignBridge-AI

# Install monorepo dependencies
pnpm install

# Start development environment
pnpm dev
```

### Docker Quickstart

```bash
docker-compose up -d
```

---

## Tech Stack

| Service       | Technology                                             |
| ------------- | ------------------------------------------------------ |
| **Frontend**  | Next.js 14, React 18, TypeScript, Tailwind CSS         |
| **AI Engine** | FastAPI, Python 3.10+, MediaPipe, PyTorch / TensorFlow |
| **Backend**   | NestJS, TypeScript, Prisma, PostgreSQL                 |
| **Mobile**    | Flutter, Dart, Riverpod                                |

---

## License

Licensed under the [MIT License](LICENSE).

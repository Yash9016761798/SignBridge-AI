.PHONY: dev build lint test clean install help

# Default target
help: ## Show this help message
	@echo "SignBridge AI - Available Commands:"
	@echo "==================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Install all dependencies
install: ## Install all dependencies
	pnpm install

# Development
dev: ## Start all services in development mode
	pnpm dev

dev-web: ## Start web app only
	pnpm --filter @signbridge/web dev

dev-backend: ## Start backend only
	pnpm --filter @signbridge/backend dev

dev-ai: ## Start AI service only
	cd apps/ai-service && python -m uvicorn app.main:app --reload --port 8000

# Build
build: ## Build all applications
	pnpm build

build-web: ## Build web app only
	pnpm --filter @signbridge/web build

build-backend: ## Build backend only
	pnpm --filter @signbridge/backend build

# Lint & Format
lint: ## Run linting across all packages
	pnpm lint

format: ## Format code with Prettier
	pnpm format

format-check: ## Check code formatting
	pnpm format:check

# Type checking
typecheck: ## Run TypeScript type checking
	pnpm typecheck

# Testing
test: ## Run all tests
	pnpm test

# Clean
clean: ## Clean all build artifacts
	pnpm clean

# Database
db-generate: ## Generate Prisma client
	cd apps/backend && npx prisma generate

db-migrate: ## Run Prisma migrations
	cd apps/backend && npx prisma migrate dev

db-push: ## Push Prisma schema to database
	cd apps/backend && npx prisma db push

db-seed: ## Seed the database
	cd apps/backend && npx prisma db seed

db-studio: ## Open Prisma Studio
	cd apps/backend && npx prisma studio

# Docker
docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-build: ## Build all Docker images
	docker-compose build

docker-logs: ## View Docker logs
	docker-compose logs -f

# Mobile
mobile-get: ## Get Flutter dependencies
	cd apps/mobile && flutter pub get

mobile-build: ## Build Flutter app
	cd apps/mobile && flutter build apk

# Quality
quality: ## Run all quality checks (lint, typecheck, format)
	pnpm lint && pnpm typecheck && pnpm format-check

# Git hooks
prepare: ## Install Git hooks
	pnpm install

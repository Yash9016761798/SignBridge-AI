#!/usr/bin/env bash
# ============================================================
# SignBridge AI - Startup Script (Linux/macOS)
# ============================================================
# Usage: ./scripts/start.sh [--demo] [--build] [--detach]
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Defaults
DEMO_MODE=false
BUILD=false
DETACH=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --demo) DEMO_MODE=true ;;
        --build) BUILD=true ;;
        --detach|-d) DETACH=true ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --demo     Enable demo mode (no webcam needed)"
            echo "  --build    Force rebuild containers"
            echo "  --detach   Run in background (detached mode)"
            echo "  --help     Show this help message"
            exit 0
            ;;
    esac
done

echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           SignBridge AI - Deployment Manager             ║"
echo "║     Indian Sign Language to English Translation          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ------------------------------------------------------------
# Step 1: Check Docker
# ------------------------------------------------------------
echo -e "${BLUE}[1/5]${NC} Checking Docker installation..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed.${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker daemon is not running.${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}ERROR: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Determine compose command
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✓ Docker is ready${NC}"

# ------------------------------------------------------------
# Step 2: Check environment
# ------------------------------------------------------------
echo -e "${BLUE}[2/5]${NC} Checking environment..."

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

# Set demo mode in .env
if [ "$DEMO_MODE" = true ]; then
    echo -e "${YELLOW}✓ Demo mode ENABLED${NC}"
    sed -i 's/^DEMO_MODE=.*/DEMO_MODE=true/' .env 2>/dev/null || \
    sed -i '' 's/^DEMO_MODE=.*/DEMO_MODE=true/' .env 2>/dev/null || true
fi

# ------------------------------------------------------------
# Step 3: Create log directories
# ------------------------------------------------------------
echo -e "${BLUE}[3/5]${NC} Setting up directories..."

mkdir -p logs/ai-service
mkdir -p logs/web
mkdir -p logs/startup

echo -e "${GREEN}✓ Log directories ready${NC}"

# ------------------------------------------------------------
# Step 4: Build containers
# ------------------------------------------------------------
echo -e "${BLUE}[4/5]${NC} Building containers..."

BUILD_ARGS=""
if [ "$BUILD" = true ]; then
    BUILD_ARGS="--build"
fi

$COMPOSE_CMD build $BUILD_ARGS 2>&1 | tee logs/startup/build.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}ERROR: Build failed. Check logs/startup/build.log${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Containers built successfully${NC}"

# ------------------------------------------------------------
# Step 5: Start services
# ------------------------------------------------------------
echo -e "${BLUE}[5/5]${NC} Starting services..."

DETACH_ARGS=""
if [ "$DETACH" = true ]; then
    DETACH_ARGS="-d"
fi

$COMPOSE_CMD up $DETACH_ARGS 2>&1 | tee logs/startup/startup.log &
STARTUP_PID=$!

# Wait for services to start
echo ""
echo -e "${CYAN}Waiting for services to start...${NC}"
sleep 5

# ------------------------------------------------------------
# Display status
# ------------------------------------------------------------
echo ""
echo -e "${BOLD}${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║              SignBridge AI is now running!               ║${NC}"
echo -e "${BOLD}${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Service URLs:${NC}"
echo -e "  ${CYAN}Frontend:${NC}      http://localhost:${WEB_PORT:-3000}"
echo -e "  ${CYAN}AI Service:${NC}    http://localhost:${AI_PORT:-8000}"
echo -e "  ${CYAN}API Docs:${NC}      http://localhost:${AI_PORT:-8000}/docs"
echo -e "  ${CYAN}Health Check:${NC}  http://localhost:${AI_PORT:-8000}/health"
echo ""

if [ "$DEMO_MODE" = true ]; then
    echo -e "${BOLD}${YELLOW}Demo Mode Active:${NC}"
    echo -e "  ${CYAN}Demo Signs:${NC}    http://localhost:${AI_PORT:-8000}/demo/signs"
    echo -e "  ${CYAN}Test Predict:${NC}  http://localhost:${AI_PORT:-8000}/demo/predict/hello"
    echo ""
fi

echo -e "${BOLD}Quick Commands:${NC}"
echo -e "  ${YELLOW}View logs:${NC}      $COMPOSE_CMD logs -f"
echo -e "  ${YELLOW}Stop:${NC}           $COMPOSE_CMD down"
echo -e "  ${YELLOW}Restart:${NC}        $COMPOSE_CMD restart"
echo -e "  ${YELLOW}Health check:${NC}   ./scripts/health_check.sh"
echo ""

if [ "$DETACH" != true ]; then
    echo -e "${CYAN}Press Ctrl+C to stop services${NC}"
    wait $STARTUP_PID 2>/dev/null || true
    $COMPOSE_CMD down
fi

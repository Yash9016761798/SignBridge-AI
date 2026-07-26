#!/usr/bin/env bash
# ============================================================
# SignBridge AI - Health Check Script (Linux/macOS)
# ============================================================
# Usage: ./scripts/health_check.sh [--verbose]
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

VERBOSE=false
[[ "${1:-}" == "--verbose" ]] && VERBOSE=true

AI_URL="${SIGNBRIDGE_AI_URL:-http://localhost:8000}"
WEB_URL="${SIGNBRIDGE_WEB_URL:-http://localhost:3000}"

PASS=0
FAIL=0
WARN=0

check() {
    local name="$1" url="$2"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
    if [[ "$status" == "200" ]]; then
        echo -e "  ${GREEN}✓${NC} $name (HTTP $status)"
        ((PASS++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $name (HTTP $status)"
        ((FAIL++))
        return 1
    fi
}

echo -e "${BOLD}${CYAN}SignBridge AI - Health Check${NC}"
echo ""

# ------------------------------------------------------------
# Docker containers
# ------------------------------------------------------------
echo -e "${BLUE}Docker Containers:${NC}"

if command -v docker &>/dev/null; then
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "signbridge-ai"; then
        echo -e "  ${GREEN}✓${NC} ai-service container is running"
        ((PASS++))
    else
        echo -e "  ${RED}✗${NC} ai-service container is NOT running"
        ((FAIL++))
    fi

    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "signbridge-web"; then
        echo -e "  ${GREEN}✓${NC} web container is running"
        ((PASS++))
    else
        echo -e "  ${RED}✗${NC} web container is NOT running"
        ((FAIL++))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Docker not available, skipping container checks"
    ((WARN++))
fi

echo ""

# ------------------------------------------------------------
# AI Service endpoints
# ------------------------------------------------------------
echo -e "${BLUE}AI Service Endpoints:${NC}"

check "Health endpoint" "$AI_URL/health"

# Model info (may be 503 in demo mode)
model_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$AI_URL/model/info" 2>/dev/null || echo "000")
if [[ "$model_status" == "200" || "$model_status" == "503" ]]; then
    echo -e "  ${GREEN}✓${NC} Model info endpoint (HTTP $model_status)"
    ((PASS++))
else
    echo -e "  ${RED}✗${NC} Model info endpoint (HTTP $model_status)"
    ((FAIL++))
fi

# Swagger docs
check "Swagger docs" "$AI_URL/docs"

# Demo signs (should work in demo mode)
check "Demo signs" "$AI_URL/demo/signs"

# ------------------------------------------------------------
# Prediction test
# ------------------------------------------------------------
echo ""
echo -e "${BLUE}Prediction Test:${NC}"

pred_response=$(curl -s --max-time 10 -X POST "$AI_URL/demo/predict/hello" \
    -H "Content-Type: application/json" 2>/dev/null || echo "{}")

if echo "$pred_response" | grep -q '"text"'; then
    text=$(echo "$pred_response" | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4)
    conf=$(echo "$pred_response" | grep -o '"confidence":[0-9.]*' | head -1 | cut -d':' -f2)
    echo -e "  ${GREEN}✓${NC} Prediction: \"$text\" (confidence: $conf)"
    ((PASS++))
else
    echo -e "  ${RED}✗${NC} Prediction endpoint failed"
    ((FAIL++))
fi

# ------------------------------------------------------------
# Frontend
# ------------------------------------------------------------
echo ""
echo -e "${BLUE}Frontend:${NC}"

check "Web app" "$WEB_URL"

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}Passed: $PASS${NC}  ${RED}Failed: $FAIL${NC}  ${YELLOW}Warnings: $WARN${NC}"

if [[ $FAIL -eq 0 ]]; then
    echo -e "  ${GREEN}${BOLD}All checks passed!${NC}"
    exit 0
else
    echo -e "  ${RED}${BOLD}Some checks failed. Run with --verbose for details.${NC}"
    exit 1
fi

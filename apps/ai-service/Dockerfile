# ============================================================
# SignBridge AI - Inference Service
# Multi-stage build: Python 3.11 slim with PyTorch CPU
# ============================================================

ARG PYTHON_VERSION=3.11

# ------------------------------------------------------------
# Stage 1: Build dependencies
# ------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS builder

WORKDIR /build

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY apps/ai-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ------------------------------------------------------------
# Stage 2: Production image
# ------------------------------------------------------------
FROM python:${PYTHON_VERSION}-slim AS production

# Security: non-root user
RUN groupadd -r signbridge && useradd --no-log-init -r -g signbridge signbridge

WORKDIR /app

# Copy installed dependencies
COPY --from=builder /install /usr/local

# Copy AI service application code
COPY apps/ai-service/*.py ./

# Copy AI training code needed for model loading
# (transformer model architecture, tokenizer, etc.)
COPY apps/ai-training/models/ ./ai-training/models/
COPY apps/ai-training/tokenizer/ ./ai-training/tokenizer/
COPY apps/ai-training/training/ ./ai-training/training/
COPY apps/ai-training/pose/ ./ai-training/pose/
COPY apps/ai-training/preprocessing/ ./ai-training/preprocessing/

# Model files are mounted as volumes, but create directories
RUN mkdir -p /app/ai-training/experiments/representative/checkpoints \
    && mkdir -p /app/ai-training/checkpoints \
    && mkdir -p /app/logs

# Fix imports: the model_loader.py uses relative paths
# Create symlinks so imports work from /app
RUN ln -sf /app/ai-training /app/ai-training-root 2>/dev/null || true

# Set PYTHONPATH so imports resolve
ENV PYTHONPATH="/app:/app/ai-training:/app/ai-training/models:/app/ai-training/training"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Switch to non-root user
USER signbridge

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]

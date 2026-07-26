FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY apps/ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ai-service/ ./apps/ai-service/
COPY ai-training/ ./ai-training/

ENV PYTHONPATH=/app/ai-training:/app/apps/ai-service
ENV SIGNBRIDGE_MODEL_CHECKPOINT=/app/ai-training/experiments/representative/checkpoints/best.pt
ENV SIGNBRIDGE_VOCAB_PATH=/app/ai-training/experiments/representative/vocabulary.json

EXPOSE 8000

CMD ["uvicorn", "apps.ai-service.main:app", "--host", "0.0.0.0", "--port", "8000"]

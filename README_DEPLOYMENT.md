# SignBridge AI - Deployment Guide

Complete guide for deploying the SignBridge AI translation system.

## Prerequisites

| Tool           | Version | Purpose                |
| -------------- | ------- | ---------------------- |
| Docker         | 20.10+  | Container runtime      |
| Docker Compose | 2.0+    | Service orchestration  |
| Python         | 3.11+   | Verification scripts   |
| Node.js        | 18+     | Local development only |

## Quick Start (Docker)

### 1. Clone and Configure

```bash
git clone <repo-url>
cd signbridge
cp .env.example .env
```

### 2. Start with Docker Compose

```bash
# Standard deployment
docker compose up --build -d

# Demo mode (no webcam, sample predictions)
docker compose --env-file .env.demo up --build -d
```

### 3. Verify Deployment

```bash
# Automated verification
python scripts/verify_deployment.py

# Or manual health checks
curl http://localhost:8000/health
curl http://localhost:3000
```

## Service URLs

| Service    | URL                              | Description          |
| ---------- | -------------------------------- | -------------------- |
| Frontend   | http://localhost:3000            | Web application      |
| AI Service | http://localhost:8000            | Inference API        |
| API Docs   | http://localhost:8000/docs       | Swagger UI           |
| Health     | http://localhost:8000/health     | Health check         |
| Demo Signs | http://localhost:8000/demo/signs | Available demo signs |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│                                                      │
│  ┌──────────────┐         ┌──────────────────┐      │
│  │  Web (Next.js)│───────>│  AI Service       │      │
│  │  Port: 3000   │  HTTP  │  Port: 8000       │      │
│  └──────────────┘         │  FastAPI+PyTorch  │      │
│                           └────────┬──────────┘      │
│                                    │                  │
│                           ┌────────▼──────────┐      │
│                           │  PoseTransformer   │      │
│                           │  (90K params)      │      │
│                           └───────────────────┘      │
└─────────────────────────────────────────────────────┘
```

## Demo Mode

Demo mode enables testing without a webcam or real model:

```bash
# Set in .env
DEMO_MODE=true

# Or start script
./scripts/start.sh --demo
```

### Demo Endpoints

| Endpoint                | Method | Description                  |
| ----------------------- | ------ | ---------------------------- |
| `/demo/signs`           | GET    | List all demo signs          |
| `/demo/sequence/{sign}` | GET    | Get pose sequence for a sign |
| `/demo/predict/{sign}`  | POST   | Run prediction on demo sign  |

### Available Demo Signs

- `hello` - Greeting sign
- `thank_you` - Thank you sign
- `yes` - Affirmative
- `no` - Negative
- `please` - Polite request
- `sorry` - Apology
- `help` - Request assistance
- `good_morning` - Morning greeting

## Environment Variables

### Frontend (.env)

```env
# Application
NEXT_PUBLIC_APP_NAME=SignBridge AI
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=production

# Build
NODE_ENV=production
PORT=3000
```

### AI Service (.env)

```env
# Server
SIGNBRIDGE_HOST=0.0.0.0
SIGNBRIDGE_PORT=8000
SIGNBRIDGE_DEBUG=false
SIGNBRIDGE_LOG_LEVEL=INFO

# Model
SIGNBRIDGE_MODEL_CHECKPOINT=experiments/representative/checkpoints/best.pt
SIGNBRIDGE_VOCAB_PATH=experiments/representative/vocabulary.json
SIGNBRIDGE_MODEL_VERSION=1.0.0

# Features
SIGNBRIDGE_NUM_LANDMARKS=33
SIGNBRIDGE_NUM_FEATURES=5
SIGNBRIDGE_MAX_SEQ_LENGTH=30
SIGNBRIDGE_DEMO_MODE=false

# CORS
SIGNBRIDGE_CORS_ORIGINS=http://localhost:3000
```

## Scripts

### start.sh / start.bat

Startup script with options:

```bash
./scripts/start.sh --demo --build --detach

# Options:
#   --demo     Enable demo mode
#   --build    Force rebuild
#   --detach   Run in background
```

### health_check.sh / health_check.bat

Verify all services are running:

```bash
./scripts/health_check.sh
```

### verify_deployment.py

Automated deployment verification:

```bash
python scripts/verify_deployment.py [ai_url] [web_url]
```

## API Endpoints

### Health & Info

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/health`     | Service health status |
| GET    | `/model/info` | Model information     |
| GET    | `/docs`       | Swagger documentation |

### Prediction

| Method | Endpoint        | Description                     |
| ------ | --------------- | ------------------------------- |
| POST   | `/predict`      | Predict text from pose sequence |
| POST   | `/translate`    | Translate pose sequence to text |
| POST   | `/webcam/frame` | Process webcam frame            |

### Demo Mode

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/demo/signs`           | List available signs |
| GET    | `/demo/sequence/{sign}` | Get pose sequence    |
| POST   | `/demo/predict/{sign}`  | Predict demo sign    |

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs ai-service
docker compose logs web

# Check container status
docker ps -a
```

### Port already in use

```bash
# Change ports in .env
AI_PORT=8001
WEB_PORT=3001

# Or stop existing containers
docker compose down
```

### Model not loading

```bash
# Verify model files exist
ls -la ai-training/experiments/representative/checkpoints/
ls -la ai-training/experiments/representative/vocabulary.json

# Check AI service logs
docker compose logs ai-service | grep -i "error\|fail"
```

### CORS errors

```bash
# Verify CORS settings in .env
SIGNBRIDGE_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Out of memory

```bash
# Increase Docker memory limit
# Docker Desktop > Settings > Resources > Memory: 4GB+
```

## Performance Tuning

### GPU Support

For NVIDIA GPU acceleration:

1. Install
   [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
2. Update `docker-compose.yml`:
   ```yaml
   ai-service:
     deploy:
       resources:
         reservations:
           devices:
             - driver: nvidia
               count: 1
               capabilities: [gpu]
   ```

### Production Recommendations

| Setting    | Development | Production |
| ---------- | ----------- | ---------- |
| Workers    | 1           | 2-4        |
| Batch size | 1           | 4-8        |
| Model      | CPU         | GPU        |
| Cache      | Disabled    | Enabled    |

## Manual Deployment (Without Docker)

### AI Service

```bash
cd apps/ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Build
npm run build

# Start
npm start
```

## Data Flow

```
1. Camera captures frame
   ↓
2. Frontend extracts pose landmarks (33 x 5)
   ↓
3. POST /webcam/frame with pose data
   ↓
4. AI Service preprocesses pose
   ↓
5. PoseTransformer generates tokens
   ↓
6. Text decoder converts tokens to words
   ↓
7. Response with translation + confidence
   ↓
8. Frontend displays translation
```

## Model Information

| Property     | Value                     |
| ------------ | ------------------------- |
| Architecture | PoseTransformer           |
| Parameters   | 90,450                    |
| Vocabulary   | 978 tokens                |
| Max Sequence | 30 tokens                 |
| Input        | 33 landmarks x 5 features |
| Framework    | PyTorch                   |

## Security Notes

- AI service runs as non-root user in container
- Model files mounted as read-only
- CORS restricted to configured origins
- No sensitive data in environment variables
- Logs rotated automatically

## Support

For issues or questions:

1. Check logs: `docker compose logs -f`
2. Run health check: `./scripts/health_check.sh`
3. Verify deployment: `python scripts/verify_deployment.py`
4. Open an issue in the repository

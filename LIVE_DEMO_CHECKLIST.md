# SignBridge AI — Live Demo Checklist

## Quick Start

### 1. Start AI Service (Port 8000)
```bash
cd apps/ai-service
# Demo mode (no model required):
set SIGNBRIDGE_DEMO_MODE=true
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# OR with trained model:
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Start Frontend (Port 3000)
```bash
cd apps/web
npm install
npm run dev
```

### 3. Verify Both Services
- AI Service: http://localhost:8000/health → `{"status": "demo"}`
- Frontend: http://localhost:3000/ → SignBridge landing page

---

## Environment Variables

### Frontend (`apps/web/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AI_SERVICE_URL` | Yes | AI service URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_API_URL` | No | Backend API URL (not needed for demo mode) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Firebase API key. **Leave unset/empty for demo mode** |

### AI Service (`apps/ai-service/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `SIGNBRIDGE_DEMO_MODE` | No | Set `true` for demo mode (no model required) |
| `AI_SERVICE_HOST` | No | Bind host (default: `0.0.0.0`) |
| `AI_SERVICE_PORT` | No | Port (default: `8000`) |

---

## Firebase Configuration (Optional)

Firebase is **optional**. When `NEXT_PUBLIC_FIREBASE_API_KEY` is not set or empty:
- Firebase is completely disabled — no `initializeApp()` call
- Login/Register use demo authentication (local state only)
- No Firebase errors in console
- All other features (camera, AI inference, translation) work normally

To enable Firebase for production:
1. Set all `NEXT_PUBLIC_FIREBASE_*` variables in `apps/web/.env.local`
2. Configure Firebase Admin SDK in backend
3. Restart both services

---

## API Endpoints (All Verified Working)

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/health` | GET | Service health check | Returns `demo` in demo mode |
| `/model/info` | GET | Model details | Returns `PoseTransformer (Demo Mode)` |
| `/predict` | POST | Pose sequence → text | Body: `{pose_sequence: [[[x,y,z,v,t]...]]}` |
| `/translate` | POST | Single frame → text | Body: `{frame: {landmarks: [...]}}` |
| `/webcam/frame` | POST | Real-time webcam frame | Body: `{frame_data: [...], session_id: "..."}` |
| `/demo/signs` | GET | List available demo signs | Returns 8 signs |
| `/demo/sequence/{sign}` | GET | Get demo sign sequence | e.g., `/demo/sequence/hello` |
| `/demo/predict/{sign}` | POST | Predict demo sign | e.g., POST `/demo/predict/hello` |

---

## Frontend Pages

| Page | URL | Purpose | Auth Required |
|------|-----|---------|---------------|
| Homepage | `/` | Welcome + navigation | No |
| Login | `/login` | Sign in | No |
| Register | `/register` | Create account | No |
| Forgot Password | `/forgot-password` | Reset password | No |
| Dashboard | `/dashboard` | Main dashboard | No (demo mode) |
| Practice | `/practice` | Camera + real-time ISL recognition | No (demo mode) |
| Translation | `/translation` | Text → ISL sign language | No (demo mode) |
| Learn | `/learn` | Course catalog | No (demo mode) |
| Dictionary | `/dictionary` | Sign dictionary | No (demo mode) |
| History | `/history` | Prediction history | No (demo mode) |
| Certificates | `/certificates` | Certificates | No (demo mode) |
| My Courses | `/my-courses` | Enrolled courses | No (demo mode) |

---

## End-to-End Demo Flow

### No-Hardware Demo (Keyboard Only)
1. Open http://localhost:3000
2. Navigate to http://localhost:3000/login
3. Enter any email/password → clicks "Sign in" → redirected to dashboard
4. Navigate to http://localhost:3000/practice or /translation
5. No camera needed for text-to-ISL translation

### Camera Demo (With Webcam)
1. Open http://localhost:3000/practice
2. Click "Start Camera" → grant camera permission
3. Webcam preview appears
4. Click "Start Session" → AI inference begins
5. Landmarks extracted → sent to AI service → prediction appears
6. Dashboard updates with metrics and history

### API Demo (Direct)
```bash
# List demo signs
curl http://localhost:8000/demo/signs

# Predict a sign
curl -X POST http://localhost:8000/demo/predict/hello

# Send a pose frame
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"pose_sequence": [[[0.5,0.5,0,0.9,0]]]}'
```

---

## Troubleshooting

### Firebase "api-key-not-valid" Error
**Cause:** `.env.local` has `NEXT_PUBLIC_FIREBASE_API_KEY` set to a non-empty placeholder value.
**Fix:** Either remove the variable entirely or set it to empty string in `apps/web/.env.local`:
```
# Comment out or leave empty:
# NEXT_PUBLIC_FIREBASE_API_KEY=
```

### AI Service Won't Start
- Check Python 3.8+: `python --version`
- Install deps: `pip install -r requirements.txt`
- Check port 8000: `netstat -ano | findstr :8000`

### Frontend Won't Start
- Check Node.js 18+: `node --version`
- Clear cache: `Remove-Item -Recurse .next`
- Check port 3000: `netstat -ano | findstr :3000`

### Camera Not Working
- Must use HTTPS or localhost for camera access
- Grant camera permissions when prompted
- Check browser console for WebRTC errors

### Frontend Can't Connect to AI Service
- Ensure AI service is running on port 8000
- Check CORS is enabled (it is by default: `*`)
- Verify `NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000`

---

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Or in detached mode
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f ai-service
docker-compose logs -f web

# Stop
docker-compose down
```

---

## Verified System State (2026-07-26)

- [x] AI Service health: `demo` mode
- [x] AI Service model: `PoseTransformer (Demo Mode)`
- [x] AI Service predict: returns predictions with confidence
- [x] AI Service webcam/frame: processes frames with session tracking
- [x] AI Service demo signs: 8 signs available
- [x] AI Service OpenAPI: 8 endpoints documented
- [x] Frontend homepage: HTTP 200, no Firebase errors
- [x] Frontend login: HTTP 200, demo authentication works
- [x] Frontend register: HTTP 200, demo registration works
- [x] Frontend dashboard: HTTP 200
- [x] Frontend practice: HTTP 200, camera + AI pipeline ready
- [x] Frontend translation: HTTP 200, text-to-ISL ready
- [x] Frontend learn/dictionary/history/certificates: all HTTP 200
- [x] TypeScript: 0 compilation errors
- [x] Unit tests: 86/86 passing (14 test suites)
- [x] Firebase: gracefully disabled when not configured
- [x] Docker Compose: production deployment configured

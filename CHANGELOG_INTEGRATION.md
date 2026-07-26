# SignBridge AI — Integration Changelog

All changes made during the integration verification pass on 2026-07-26.

---

## New Files

### `apps/web/lib/pose-extraction.ts` (NEW)

- **What changed:** New utility module for extracting pose landmarks from video frames
- **Why:** The existing `useRealtimeTranslation.ts` extracted raw canvas pixel RGB data instead of pose landmarks. The AI model requires `(T, 33, 5)` shaped input (33 MediaPipe-style body landmarks × 5 features each). Without this fix, all prediction requests would fail with a shape mismatch error.
- **Teammates need to pull:** Yes
- **Migration steps:** None. Import `extractPoseFromVideo` from `@/lib/pose-extraction` where needed.

---

## Modified Files

### `apps/web/hooks/useRealtimeTranslation.ts`

- **What changed:** Replaced raw pixel extraction (lines 129–144) with `extractPoseFromVideo()` call. Removed downsampling loop (lines 154–160). Removed duplicate `video` variable declaration.
- **Why:** Raw pixel data (~307K values) was being sent as pose landmarks. The AI service preprocessor expects exactly 33 landmarks × 5 features = 165 values per frame.
- **Teammates need to pull:** Yes
- **Migration steps:** None. The hook API is unchanged.

### `apps/web/hooks/useAIInference.ts`

- **What changed:** Modified `checkHealth` callback (line 68) to treat `status === 'demo'` as connected, not just `model_loaded`.
- **Why:** In demo mode, `model_loaded` is `false` but the service is fully functional. Previously showed "degraded" status incorrectly.
- **Teammates need to pull:** Yes
- **Migration steps:** None.

### `apps/web/app/(dashboard)/translation/page.tsx`

- **What changed:** Added `translateViaAiService()` function that calls the AI service directly. Modified `handleTranslate` to try NestJS backend first, fallback to direct AI service call.
- **Why:** The NestJS backend requires PostgreSQL and Firebase authentication, which are unavailable in standalone demo mode. This allows the translation page to function with just the AI service.
- **Teammates need to pull:** Yes
- **Migration steps:** None. Existing behavior preserved when NestJS backend is available.

### `apps/ai-service/main.py`

- **What changed:**
  - Added `import random` and `from demo import ...` at top
  - Modified `lifespan()` to skip model loading in demo mode
  - Modified `/health` to return `status: "demo"` in demo mode
  - Modified `/model/info` to return demo model config in demo mode
  - Modified `/predict` to return demo prediction in demo mode
  - Modified `/translate` to return demo prediction in demo mode
  - Modified `/webcam/frame` to return demo prediction in demo mode
  - Added `/demo/signs`, `/demo/sequence/{sign}`, `/demo/predict/{sign}` endpoints
- **Why:** Several endpoints returned HTTP 503 in demo mode, making the service appear broken when running without a trained model.
- **Teammates need to pull:** Yes
- **Migration steps:** Set `SIGNBRIDGE_DEMO_MODE=true` environment variable to enable demo mode.

### `apps/ai-service/schemas.py`

- **What changed:** Added `model_config = ConfigDict(protected_namespaces=())` to `PredictionResult`, `TranslateResult`, `WebcamResult`, and `ErrorResponse` classes.
- **Why:** Pydantic v2 emits warnings about `model_version` field conflicting with the `model_` protected namespace. These warnings polluted logs.
- **Teammates need to pull:** Yes
- **Migration steps:** None.

---

## Pre-existing Files (Not Modified)

The following files were already correct and required no changes:

- `apps/ai-service/config.py` — Settings properly reads from env vars
- `apps/ai-service/demo.py` — Demo mode module (created in prior session)
- `apps/ai-service/model_loader.py` — Model loading works correctly
- `apps/ai-service/inference_engine.py` — Inference pipeline correct
- `apps/ai-service/preprocessor.py` — Validates `(T, 33, 5)` shape (was the source of shape errors before fix)
- `apps/ai-service/text_decoder.py` — Token decoding works
- `apps/web/lib/ai-inference-api.ts` — API client correct
- `apps/web/hooks/useCamera.ts` — Camera access works
- `apps/web/hooks/useSlidingWindow.ts` — Buffer management works
- `apps/web/hooks/usePredictionSmoothing.ts` — Smoothing works
- `apps/web/hooks/usePerformanceMetrics.ts` — Metrics tracking works
- `apps/web/components/ai/*` — All 12 AI components work
- `apps/web/__tests__/*` — All 86 tests pass
- `docker-compose.yml` — Docker orchestration correct
- `.env.example` — Environment template correct
- `scripts/start.sh`, `scripts/start.bat` — Startup scripts correct
- `scripts/health_check.sh`, `scripts/health_check.bat` — Health checks correct
- `scripts/verify_deployment.py` — Deployment verification correct
- `README_DEPLOYMENT.md` — Documentation correct

---

## Verification Commands

After pulling these changes, run:

```bash
# Frontend
cd apps/web
npm run typecheck        # Should produce 0 errors
npx jest --passWithNoTests  # Should pass 86/86 tests
npx next build           # Should build 20 routes

# AI Service
cd apps/ai-service
python -c "from main import app; print('OK')"

# Start in demo mode
SIGNBRIDGE_DEMO_MODE=true python -m uvicorn main:app --port 8000

# Verify endpoints
curl http://localhost:8000/health
curl http://localhost:8000/model/info
curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"pose_sequence":[[[0.5,0.5,0,0.9,0]]]}'
curl http://localhost:8000/demo/signs
```

---

**END OF CHANGELOG**

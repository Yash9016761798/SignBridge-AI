# AI Frontend Integration

This document describes how the Next.js frontend communicates with the FastAPI AI inference service
for sign language translation.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Frontend (apps/web)                           │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  CameraView  │  │ Translation  │  │  Connection  │ │
│  │  (hook)      │──│ Card         │  │  Status      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │         │
│  ┌──────┴───────┐  ┌──────┴───────┐         │         │
│  │  useCamera   │  │ useAIInfer   │         │         │
│  │  hook        │  │ ence hook    │         │         │
│  └──────┬───────┘  └──────┬───────┘         │         │
│         │                 │                  │         │
│         │         ┌───────┴────────┐         │         │
│         │         │ AI Inference   │         │         │
│         │         │ API Client     │◀────────┘         │
│         │         └───────┬────────┘                   │
└─────────┼─────────────────┼────────────────────────────┘
          │                 │
          │    HTTP/REST    │
          │                 │
┌─────────┼─────────────────┼────────────────────────────┐
│         ▼                 ▼                             │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  MediaPipe   │  │  FastAPI     │                    │
│  │  (browser)   │  │  AI Service  │                    │
│  └──────────────┘  │  (port 8000) │                    │
│                    └──────────────┘                    │
│               apps/ai-service                          │
└─────────────────────────────────────────────────────────┘
```

## Files

| File                                  | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `lib/ai-inference-api.ts`             | HTTP client for the FastAPI AI service      |
| `hooks/useCamera.ts`                  | WebRTC camera access and frame capture      |
| `hooks/useAIInference.ts`             | Health checks, prediction, connection state |
| `hooks/index.ts`                      | Hook barrel exports                         |
| `components/ai/CameraView.tsx`        | Live camera feed with controls              |
| `components/ai/TranslationCard.tsx`   | Displays translation result                 |
| `components/ai/ConfidenceMeter.tsx`   | Visual confidence bar                       |
| `components/ai/PredictionHistory.tsx` | Scrollable prediction log                   |
| `components/ai/ConnectionStatus.tsx`  | AI service health badge                     |
| `components/ai/index.ts`              | Component barrel exports                    |
| `__tests__/`                          | Unit and integration tests                  |

## Environment Variables

| Variable                     | Default                 | Description                               |
| ---------------------------- | ----------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_AI_SERVICE_URL` | `http://localhost:8000` | Base URL of the FastAPI inference service |

## API Client

The `aiInferenceApi` client provides four methods:

```typescript
import { aiInferenceApi } from '@/lib/ai-inference-api';

// Health check
const health = await aiInferenceApi.health();

// Translate pose sequence
const result = await aiInferenceApi.predict({
  pose_sequence: [[[x, y, z, v, ...], ...]], // shape: (T, 33, 5)
});

// Webcam frame with session tracking
const webcam = await aiInferenceApi.webcamFrame({
  frame_data: [[[x, y, z, v, ...], ...]],
  session_id: 'optional-session-id',
});
```

Errors are thrown as `AiServiceError` with `status` and `detail` properties.

## Hooks

### useCamera

```tsx
const { videoRef, status, startCamera, stopCamera, captureFrame } = useCamera({
  autoStart: true,
  facingMode: 'user',
});
```

### useAIInference

```tsx
const {
  health,
  connectionStatus,
  isInferring,
  lastResult,
  lastError,
  predict,
  checkHealth,
  clearError,
} = useAIInference({ healthCheckInterval: 10000 });
```

## Component Usage

```tsx
import { CameraView, TranslationCard, ConnectionStatus, PredictionHistory } from '@/components/ai';

function TranslatePage() {
  const camera = useCamera({ autoStart: true });
  const ai = useAIInference();

  const handleFrame = async (video: HTMLVideoElement) => {
    // Convert video frame to pose landmarks (MediaPipe goes here)
    const poseSequence = extractPoseFromVideo(video);
    await ai.predict({ pose_sequence: poseSequence });
  };

  return (
    <div>
      <ConnectionStatus status={ai.connectionStatus} health={ai.health} onRetry={ai.checkHealth} />
      <CameraView autoStart capturing onFrameCapture={handleFrame} />
      <TranslationCard result={ai.lastResult} isLoading={ai.isInferring} />
      <PredictionHistory items={history} onClear={() => setHistory([])} />
    </div>
  );
}
```

## Error Handling

| Error Type       | HTTP Status | UI Behavior                                    |
| ---------------- | ----------- | ---------------------------------------------- |
| Network offline  | 0           | ConnectionStatus shows "Offline", retry button |
| Service down     | 503         | ConnectionStatus shows "Degraded"              |
| Timeout          | 408         | Toast notification, error state                |
| Validation       | 422         | Error detail shown in UI                       |
| Model not loaded | 503         | ConnectionStatus shows "Degraded"              |

## Tests

```bash
# Install test dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom ts-jest

# Run tests
pnpm jest
```

Tests cover:

- API client request/response handling
- ConfidenceMeter rendering for all confidence levels
- TranslationCard loading, empty, and result states
- ConnectionStatus for connected/degraded/offline states
- PredictionHistory rendering, clearing, and maxItems
- Full workflow integration (predict → render → display)

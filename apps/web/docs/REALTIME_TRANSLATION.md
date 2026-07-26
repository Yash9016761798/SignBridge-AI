# Real-Time Translation Pipeline

## Architecture

```
Webcam (useCamera)
  ↓
Frame Capture (configurable interval)
  ↓
useSlidingWindow (rolling buffer of N frames)
  ↓
useAIInference.predict() → FastAPI → PoseTransformer
  ↓
usePredictionSmoothing (majority vote, confidence threshold)
  ↓
Live Translation UI (TranslationPanel)
```

## Data Flow

1. **Camera Capture** — `useCamera` manages WebRTC stream and frame extraction
2. **Sliding Window** — `useSlidingWindow` maintains a rolling buffer of the last N pose frames (default 30)
3. **Inference** — Frames are sent to the FastAPI service at a configurable FPS (default 5)
4. **Smoothing** — `usePredictionSmoothing` applies majority vote across recent predictions to prevent flickering
5. **Display** — Stable predictions appear in `TranslationPanel` with confidence, latency, and session stats

## Performance

| Metric | Default | Range |
|--------|---------|-------|
| Inference FPS | 5 | 1–15 |
| Buffer Size | 30 frames | 5–60 |
| Smoothing Window | 5 predictions | 1–15 |
| Confidence Threshold | 0.70 | 0–1.0 |

**Tip:** Lower inference FPS reduces backend load. Increase buffer size for more accurate pose sequences. Higher smoothing windows reduce flickering but increase latency.

## Configuration

All settings are configurable via the `SettingsPanel` UI or the `useRealtimeTranslation` hook:

```tsx
const translation = useRealtimeTranslation({
  inferenceFps: 5,
  confidenceThreshold: 0.70,
  bufferSize: 30,
  smoothingWindow: 5,
  autoStart: false,
});

// Dynamically update
translation.updateSettings({ inferenceFps: 10 });
```

## Hooks

### `useRealtimeTranslation`
Orchestrator hook combining all pipeline stages. Returns session state, metrics, controls, and current translation.

### `useSlidingWindow`
Rolling pose frame buffer. `pushFrame()` adds frames, `getWindow()` returns the current window, `isFull` indicates readiness.

### `usePredictionSmoothing`
Temporal smoothing via majority vote. `feedPrediction(text, confidence)` returns the stable prediction or empty string.

### `usePerformanceMetrics`
Tracks camera FPS, inference FPS, average latency, average confidence, dropped frames, and session duration.

## Components

| Component | Purpose |
|-----------|---------|
| `TranslationPanel` | Live translation display with confidence, latency, FPS |
| `SessionControls` | Start/Pause/Resume/Stop/Reset buttons |
| `SettingsPanel` | Configurable inference FPS, confidence, buffer, smoothing |
| `PerformanceDashboard` | Real-time metrics display |
| `ConnectionMonitor` | Camera, AI service, model, session status indicators |

## Error Recovery

- **Camera disconnect** — `useCamera` status transitions to `error`, session pauses
- **AI service outage** — `useAIInference` marks as `offline` after threshold failures
- **Network timeout** — 15s timeout per request, `AiServiceError` with status 408
- **MediaPipe failure** — Falls back to raw pixel data for pose estimation

All errors are recoverable without page refresh via the session controls.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No translation appearing | Check confidence threshold, ensure camera is active |
| Flickering translations | Increase smoothing window or confidence threshold |
| High latency | Lower inference FPS or buffer size |
| Camera denied | Check browser permissions |
| AI service offline | Check `http://localhost:8000/health`, restart AI service |

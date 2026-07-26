import { renderHook, act } from '@testing-library/react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

describe('usePerformanceMetrics', () => {
  it('starts with zero metrics', () => {
    const { result } = renderHook(() => usePerformanceMetrics());
    expect(result.current.metrics.totalFrames).toBe(0);
    expect(result.current.metrics.totalInferences).toBe(0);
    expect(result.current.metrics.droppedFrames).toBe(0);
    expect(result.current.metrics.cameraFps).toBe(0);
  });

  it('records frames', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    act(() => {
      result.current.recordFrame();
      result.current.recordFrame();
      result.current.recordFrame();
    });

    expect(result.current.metrics.totalFrames).toBe(3);
  });

  it('records inferences', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    act(() => {
      result.current.recordInference(50, 0.8, true);
      result.current.recordInference(30, 0.6, false);
    });

    expect(result.current.metrics.totalInferences).toBe(2);
    expect(result.current.metrics.acceptedPredictions).toBe(1);
  });

  it('records dropped frames', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    act(() => {
      result.current.recordDrop();
      result.current.recordDrop();
    });

    expect(result.current.metrics.droppedFrames).toBe(2);
  });

  it('resets all metrics', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    act(() => {
      result.current.recordFrame();
      result.current.recordInference(50, 0.8, true);
      result.current.recordDrop();
    });

    act(() => result.current.reset());

    expect(result.current.metrics.totalFrames).toBe(0);
    expect(result.current.metrics.totalInferences).toBe(0);
    expect(result.current.metrics.droppedFrames).toBe(0);
  });

  it('tracks session duration', () => {
    const { result } = renderHook(() => usePerformanceMetrics());
    expect(result.current.metrics.sessionDuration).toBeGreaterThanOrEqual(0);
  });
});

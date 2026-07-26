import { renderHook, act } from '@testing-library/react';
import { usePredictionSmoothing } from '@/hooks/usePredictionSmoothing';

describe('usePredictionSmoothing', () => {
  it('starts with empty prediction', () => {
    const { result } = renderHook(() => usePredictionSmoothing());
    expect(result.current.stablePrediction).toBe('');
    expect(result.current.stableConfidence).toBe(0);
  });

  it('rejects predictions below confidence threshold', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ confidenceThreshold: 0.7 }),
    );

    act(() => result.current.feedPrediction('hello', 0.3));

    expect(result.current.stablePrediction).toBe('');
  });

  it('accepts predictions above confidence threshold', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ confidenceThreshold: 0.5, windowSize: 3, agreementThreshold: 0.5 }),
    );

    act(() => result.current.feedPrediction('hello', 0.8));

    expect(result.current.stablePrediction).toBe('hello');
    expect(result.current.stableConfidence).toBe(0.8);
  });

  it('requires majority agreement for stable prediction', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ windowSize: 3, confidenceThreshold: 0.3, agreementThreshold: 0.6 }),
    );

    act(() => result.current.feedPrediction('hello', 0.9));
    expect(result.current.stablePrediction).toBe('hello');

    act(() => result.current.feedPrediction('world', 0.9));
    expect(result.current.stablePrediction).toBe('hello');

    act(() => result.current.feedPrediction('hello', 0.9));
    expect(result.current.stablePrediction).toBe('hello');
  });

  it('clears state', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ confidenceThreshold: 0.3 }),
    );

    act(() => result.current.feedPrediction('hello', 0.8));
    expect(result.current.stablePrediction).toBe('hello');

    act(() => result.current.clear());
    expect(result.current.stablePrediction).toBe('');
    expect(result.current.recentPredictions).toHaveLength(0);
  });

  it('ignores empty text', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ confidenceThreshold: 0.3 }),
    );

    act(() => result.current.feedPrediction('', 0.9));
    expect(result.current.stablePrediction).toBe('');
  });

  it('tracks recent predictions', () => {
    const { result } = renderHook(() =>
      usePredictionSmoothing({ windowSize: 3, confidenceThreshold: 0.3 }),
    );

    act(() => {
      result.current.feedPrediction('a', 0.9);
      result.current.feedPrediction('b', 0.9);
    });

    expect(result.current.recentPredictions).toHaveLength(2);
  });
});

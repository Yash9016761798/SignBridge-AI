import { renderHook, act } from '@testing-library/react';
import { useSlidingWindow } from '@/hooks/useSlidingWindow';

describe('useSlidingWindow', () => {
  it('starts with empty buffer', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 5 }));
    expect(result.current.length).toBe(0);
    expect(result.current.isFull).toBe(false);
  });

  it('pushes frames and tracks length', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 5 }));
    const frame: number[][] = [[1, 2, 3], [4, 5, 6]];

    act(() => result.current.pushFrame(frame));

    expect(result.current.length).toBe(1);
    expect(result.current.isFull).toBe(false);
  });

  it('marks buffer as full when bufferSize reached', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 3 }));

    act(() => {
      result.current.pushFrame([[1]]);
      result.current.pushFrame([[2]]);
      result.current.pushFrame([[3]]);
    });

    expect(result.current.length).toBe(3);
    expect(result.current.isFull).toBe(true);
  });

  it('evicts oldest frame when buffer is full', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 3 }));

    act(() => {
      result.current.pushFrame([[1]]);
      result.current.pushFrame([[2]]);
      result.current.pushFrame([[3]]);
      result.current.pushFrame([[4]]);
    });

    expect(result.current.length).toBe(3);
    const window = result.current.getWindow();
    expect(window[0][0][0]).toBe(2);
    expect(window[2][0][0]).toBe(4);
  });

  it('clears the buffer', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 5 }));

    act(() => {
      result.current.pushFrame([[1]]);
      result.current.pushFrame([[2]]);
    });

    act(() => result.current.clear());

    expect(result.current.length).toBe(0);
    expect(result.current.isFull).toBe(false);
  });

  it('pushFrames adds multiple frames', () => {
    const { result } = renderHook(() => useSlidingWindow({ bufferSize: 10 }));

    act(() => result.current.pushFrames([[[1]], [[2]], [[3]]]));

    expect(result.current.length).toBe(3);
  });
});

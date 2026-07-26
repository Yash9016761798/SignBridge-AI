'use client';

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSlidingWindowOptions {
  /** Maximum number of frames in the buffer. Default 30. */
  bufferSize?: number;
}

export interface UseSlidingWindowReturn {
  /** Current buffer contents. */
  buffer: number[][][];
  /** Number of frames currently in the buffer. */
  length: number;
  /** Push a single frame (landmark array) into the buffer. */
  pushFrame: (frame: number[][]) => void;
  /** Push multiple frames at once. */
  pushFrames: (frames: number[][][]) => void;
  /** Get the current window as a snapshot. */
  getWindow: () => number[][][];
  /** Clear the buffer. */
  clear: () => void;
  /** Whether the buffer is full (reached bufferSize). */
  isFull: boolean;
}

/**
 * Sliding window buffer for pose landmark sequences.
 *
 * Maintains a rolling buffer of the last N frames. When the buffer is full,
 * the oldest frame is evicted when a new frame is pushed.
 *
 * Usage:
 * ```tsx
 * const { pushFrame, buffer, isFull, length } = useSlidingWindow({ bufferSize: 30 });
 * ```
 */
export function useSlidingWindow(
  options: UseSlidingWindowOptions = {},
): UseSlidingWindowReturn {
  const { bufferSize = 30 } = options;

  const bufferRef = useRef<number[][][]>([]);
  const [length, setLength] = useState(0);

  const pushFrame = useCallback(
    (frame: number[][]) => {
      const buf = bufferRef.current;
      if (buf.length >= bufferSize) {
        buf.shift();
      }
      buf.push(frame);
      setLength(buf.length);
    },
    [bufferSize],
  );

  const pushFrames = useCallback(
    (frames: number[][][]) => {
      const buf = bufferRef.current;
      for (const frame of frames) {
        if (buf.length >= bufferSize) {
          buf.shift();
        }
        buf.push(frame);
      }
      setLength(buf.length);
    },
    [bufferSize],
  );

  const getWindow = useCallback(() => {
    return bufferRef.current.map((f) => f);
  }, []);

  const clear = useCallback(() => {
    bufferRef.current = [];
    setLength(0);
  }, []);

  return {
    buffer: bufferRef.current,
    length,
    pushFrame,
    pushFrames,
    getWindow,
    clear,
    isFull: length >= bufferSize,
  };
}

export default useSlidingWindow;

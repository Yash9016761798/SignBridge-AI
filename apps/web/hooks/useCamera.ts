'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export interface UseCameraOptions {
  /** Preferred facing mode. Default "user". */
  facingMode?: string;
  /** Video width constraint. */
  width?: number;
  /** Video height constraint. */
  height?: number;
  /** Auto-request camera on mount. Default false. */
  autoStart?: boolean;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  error: string | null;
  startCamera: () => Promise<MediaStream>;
  stopCamera: () => void;
  captureFrame: () => ImageData | null;
  captureFrameAsBase64: () => string | null;
}

/**
 * Hook for managing webcam access, video streaming, and frame capture.
 *
 * Usage:
 * ```tsx
 * const { videoRef, status, startCamera, captureFrame } = useCamera({ autoStart: true });
 * ```
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode = 'user', width = 640, height = 480, autoStart = false } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
    setStatus('idle');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (): Promise<MediaStream> => {
    setStatus('requesting');
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: width }, height: { ideal: height } },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStatus('active');
      return mediaStream;
    } catch (err: any) {
      const message =
        err?.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : err?.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : `Camera error: ${err?.message || 'Unknown'}`;

      setError(message);
      setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'error');
      throw err;
    }
  }, [facingMode, width, height]);

  /** Capture the current video frame as raw ImageData. */
  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  /** Capture the current frame as a base64-encoded JPEG. */
  const captureFrameAsBase64 = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-start
  useEffect(() => {
    if (autoStart && status === 'idle') {
      startCamera().catch(() => {});
    }
  }, [autoStart, status, startCamera]);

  return {
    videoRef,
    canvasRef,
    stream,
    status,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    captureFrameAsBase64,
  };
}

export default useCamera;

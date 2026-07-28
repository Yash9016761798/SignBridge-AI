'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Camera, CameraOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useCamera, type UseCameraOptions } from '@/hooks/useCamera';

export interface CameraViewProps {
  autoStart?: boolean;
  onFrameCapture?: (video: HTMLVideoElement) => void;
  captureIntervalMs?: number;
  capturing?: boolean;
  cameraOptions?: UseCameraOptions;
  className?: string;
}

export default function CameraView({
  autoStart = false,
  onFrameCapture,
  captureIntervalMs = 500,
  capturing = false,
  cameraOptions,
  className = '',
}: CameraViewProps) {
  const camera = useCamera(cameraOptions);
  const videoRef = camera.videoRef as React.RefObject<HTMLVideoElement>;
  const canvasRef = camera.canvasRef as React.RefObject<HTMLCanvasElement>;
  const { stream, status, error, startCamera, stopCamera } = camera;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (capturing && status === 'active' && onFrameCapture) {
      intervalRef.current = setInterval(() => {
        if (videoRef.current) {
          onFrameCapture(videoRef.current);
        }
      }, captureIntervalMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [capturing, status, onFrameCapture, captureIntervalMs, videoRef]);

  const handleToggle = useCallback(async () => {
    if (status === 'active') {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [status, startCamera, stopCamera]);

  return (
    <div className={`relative overflow-hidden rounded-card bg-surface-900 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${status !== 'active' ? 'hidden' : ''}`}
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {status !== 'active' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {status === 'requesting' ? (
            <Loader2 className="h-10 w-10 animate-spin text-warning-400" />
          ) : status === 'denied' || status === 'error' ? (
            <AlertTriangle className="h-10 w-10 text-warning-500" />
          ) : (
            <CameraOff className="h-10 w-10 text-surface-500" />
          )}

          <p className="max-w-xs text-sm text-surface-400">
            {status === 'requesting'
              ? 'Requesting camera access...'
              : status === 'denied'
                ? 'Camera access was denied. Please allow it in browser settings.'
                : status === 'error'
                  ? error || 'Could not access camera.'
                  : 'Click below to enable your camera for sign language translation.'}
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
        <span className="text-xs font-medium text-white/80">
          {status === 'active' ? 'Camera Active' : 'Camera Off'}
        </span>
        <button
          onClick={handleToggle}
          disabled={status === 'requesting'}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/20 disabled:opacity-50"
        >
          {status === 'active' ? (
            <>
              <CameraOff className="h-3.5 w-3.5" /> Stop
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5" /> Start
            </>
          )}
        </button>
      </div>

      {capturing && status === 'active' && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-danger-500" />
          </span>
        </div>
      )}
    </div>
  );
}

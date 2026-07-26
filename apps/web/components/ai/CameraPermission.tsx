'use client';

import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';

interface CameraPermissionProps {
  onGranted: (stream: MediaStream) => void;
  onDenied?: () => void;
}

export default function CameraPermission({ onGranted, onDenied }: CameraPermissionProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestCamera = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStatus('granted');
      onGranted(stream);
    } catch (err) {
      setStatus('denied');
      const message = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Camera access was denied. Please enable it in your browser settings.'
        : 'Unable to access camera. Please check your device.';
      setError(message);
      onDenied?.();
    }
  };

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Camera className="h-4 w-4" /> Camera active
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
      {status === 'denied' || status === 'error' ? (
        <>
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <p className="text-sm text-gray-600 text-center max-w-md">{error || 'Camera access required'}</p>
        </>
      ) : (
        <>
          <CameraOff className="h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600 text-center max-w-md">
            Camera access is needed for sign language practice. Your video stays on-device and is never recorded.
          </p>
        </>
      )}
      <button
        onClick={requestCamera}
        disabled={status === 'requesting'}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        <Camera className="h-4 w-4" />
        {status === 'requesting' ? 'Requesting...' : 'Enable Camera'}
      </button>
    </div>
  );
}

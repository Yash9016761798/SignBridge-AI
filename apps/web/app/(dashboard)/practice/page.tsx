'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import { CameraPermission, PredictionResultDisplay } from '@/components/ai';
import { aiApi } from '@/lib/ai-api';
import type { PracticeSession, PredictionResult } from '@/types/ai';
import { Video, Square, Clock, Target, BarChart } from 'lucide-react';

export default function PracticePage() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [targetGesture] = useState(() => {
    const gestures = ['Hello', 'Thank You', 'Yes', 'No', 'Please', 'Help', 'Water', 'Mother', 'Father'];
    return gestures[Math.floor(Math.random() * gestures.length)];
  });
  const [predictionCount, setPredictionCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const startSession = async () => {
    setLoading(true);
    try {
      const newSession = await aiApi.createPracticeSession();
      setSession(newSession);
      setPredictionCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const captureAndPredict = async () => {
    if (!session) return;
    try {
      const result = await aiApi.predict('image');
      setPrediction(result.data);
      setPredictionCount((c) => c + 1);

      await aiApi.submitPrediction({
        sessionId: session.id,
        predictedGesture: result.data.gesture,
        confidence: result.data.confidence,
        processingTimeMs: result.data.processingTimeMs,
        modelVersion: result.data.modelVersion,
      });
    } catch {
      // ignore
    }
  };

  const endSession = async () => {
    if (!session) return;
    try {
      await aiApi.endPracticeSession(session.id);
      setSession(null);
      setPrediction(null);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Practice"
        description="Practice ISL signs with AI-powered feedback"
      />

      {!cameraStream ? (
        <CameraPermission onGranted={setCameraStream} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                {session && (
                  <div className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> LIVE
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!session ? (
                  <button onClick={startSession} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                    <Video className="h-4 w-4" />{loading ? 'Starting...' : 'Start Practice'}
                  </button>
                ) : (
                  <>
                    <button onClick={captureAndPredict} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700">
                      <Target className="h-4 w-4" /> Capture & Predict
                    </button>
                    <button onClick={endSession} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Square className="h-4 w-4" /> End
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {session && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Practice Target</h3>
                  <p className="text-2xl font-bold text-primary-600">{targetGesture}</p>
                  <p className="mt-1 text-xs text-gray-500">Try signing this gesture</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Session active</span>
                    <span className="flex items-center gap-1"><BarChart className="h-3.5 w-3.5" />{predictionCount} predictions</span>
                  </div>
                </div>
              )}

              {prediction && (
                <PredictionResultDisplay result={prediction} targetGesture={targetGesture} />
              )}

              {!session && !prediction && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <Video className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">Ready to Practice</h3>
                  <p className="mt-2 text-sm text-gray-500">Start a session to begin practicing ISL signs with AI feedback.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

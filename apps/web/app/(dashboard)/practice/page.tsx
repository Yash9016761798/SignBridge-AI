'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import { CameraPermission, PredictionResultDisplay } from '@/components/ai';
import { aiApi } from '@/lib/ai-api';
import type { PracticeSession, PredictionResult } from '@/types/ai';
import { Video, Square, Clock, Target, BarChart, Sparkles } from 'lucide-react';

export default function PracticePage() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [targetGesture] = useState(() => {
    const gestures = [
      'Hello',
      'Thank You',
      'Yes',
      'No',
      'Please',
      'Help',
      'Water',
      'Mother',
      'Father',
    ];
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
        icon={Target}
      />

      {!cameraStream ? (
        <CameraPermission onGranted={setCameraStream} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Camera Panel */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-900 shadow-elevated">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {session && (
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-danger-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    LIVE
                  </div>
                )}
                {/* Camera Overlay */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>

              <div className="flex gap-3">
                {!session ? (
                  <button
                    onClick={startSession}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-xl disabled:opacity-50"
                  >
                    <Video className="h-4 w-4" />
                    {loading ? 'Starting...' : 'Start Practice'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureAndPredict}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:from-accent-600 hover:to-accent-700 hover:shadow-xl"
                    >
                      <Target className="h-4 w-4" />
                      Capture & Predict
                    </button>
                    <button
                      onClick={endSession}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-medium text-surface-700 transition-all hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                    >
                      <Square className="h-4 w-4" />
                      End
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {session && (
                <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
                  <h3 className="mb-3 text-sm font-semibold text-surface-900 dark:text-white">
                    Practice Target
                  </h3>
                  <p className="text-3xl font-bold text-primary-500">{targetGesture}</p>
                  <p className="mt-1 text-sm text-surface-500">Try signing this gesture</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-surface-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Session active
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart className="h-3.5 w-3.5" />
                      {predictionCount} predictions
                    </span>
                  </div>
                </div>
              )}

              {prediction && (
                <PredictionResultDisplay result={prediction} targetGesture={targetGesture} />
              )}

              {!session && !prediction && (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-200 bg-white p-8 text-center dark:border-surface-700 dark:bg-surface-900">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
                    <Sparkles className="h-8 w-8 text-surface-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
                    Ready to Practice
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-surface-500">
                    Start a session to begin practicing ISL signs with AI feedback.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

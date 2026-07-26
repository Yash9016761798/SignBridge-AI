'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { aiApi } from '@/lib/ai-api';
import type { PracticeSession, TranslationSession } from '@/types/ai';
import { Video, MessageSquare, Clock, Target, BarChart } from 'lucide-react';

type Tab = 'practice' | 'translation';

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('practice');
  const [practiceHistory, setPracticeHistory] = useState<PracticeSession[]>([]);
  const [translationHistory, setTranslationHistory] = useState<TranslationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === 'practice') {
      aiApi.getPracticeHistory()
        .then(setPracticeHistory)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      aiApi.getTranslationHistory()
        .then(setTranslationHistory)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      <PageHeader title="Session History" description="Review your practice and translation sessions" />

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setTab('practice')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'practice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="mr-1.5 inline h-4 w-4" /> Practice
        </button>
        <button
          onClick={() => setTab('translation')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'translation' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="mr-1.5 inline h-4 w-4" /> Translation
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : tab === 'practice' ? (
        practiceHistory.length === 0 ? (
          <EmptyState icon={Video} title="No practice sessions" description="Start practicing to see your history here." />
        ) : (
          <div className="space-y-3">
            {practiceHistory.map((session) => (
              <div key={session.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.lesson?.title || 'Practice Session'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()} at{' '}
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {session.accuracy != null && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      session.accuracy >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {Math.round(session.accuracy * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{session.predictions.length} predictions</span>
                  {session.confidenceScore != null && (
                    <span className="flex items-center gap-1"><BarChart className="h-3 w-3" />{Math.round(session.confidenceScore * 100)}% confidence</span>
                  )}
                  {session.feedback && <span className="truncate max-w-[200px]">{session.feedback}</span>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : translationHistory.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No translation sessions" description="Start translating to see your history here." />
      ) : (
        <div className="space-y-3">
          {translationHistory.map((session) => (
            <div key={session.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.type.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(session.startedAt).toLocaleDateString()} at{' '}
                    {new Date(session.startedAt).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {session.status}
                </span>
              </div>
              {session.messages.length > 0 && (
                <div className="mt-3 space-y-1">
                  {session.messages.slice(0, 3).map((msg) => (
                    <p key={msg.id} className="text-xs text-gray-600 truncate">
                      <span className="font-medium">Input:</span> {msg.inputText} &rarr; <span className="font-medium">Output:</span> {msg.outputText}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

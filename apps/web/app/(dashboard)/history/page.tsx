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
      aiApi
        .getPracticeHistory()
        .then(setPracticeHistory)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      aiApi
        .getTranslationHistory()
        .then(setTranslationHistory)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session History"
        description="Review your practice and translation sessions"
        icon={Clock}
      />

      <div
        className="flex gap-1 rounded-[14px] bg-surface-100 p-1 w-fit dark:bg-surface-800"
        role="tablist"
        aria-label="Session history tabs"
      >
        <button
          onClick={() => setTab('practice')}
          role="tab"
          aria-selected={tab === 'practice'}
          aria-controls="practice-panel"
          id="practice-tab"
          className={`min-h-[44px] rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'practice'
              ? 'bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white'
              : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          <Video className="mr-1.5 inline h-4 w-4" /> Practice
        </button>
        <button
          onClick={() => setTab('translation')}
          role="tab"
          aria-selected={tab === 'translation'}
          aria-controls="translation-panel"
          id="translation-tab"
          className={`min-h-[44px] rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'translation'
              ? 'bg-white text-surface-900 shadow-sm dark:bg-surface-700 dark:text-white'
              : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200'
          }`}
        >
          <MessageSquare className="mr-1.5 inline h-4 w-4" /> Translation
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-24 rounded-card" />
          ))}
        </div>
      )}

      {!loading && tab === 'practice' && (
        <div
          id="practice-panel"
          role="tabpanel"
          aria-labelledby="practice-tab"
          className="space-y-3"
        >
          {practiceHistory.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No practice sessions"
              description="Start practicing to see your history here."
              accentColor="amber"
            />
          ) : (
            practiceHistory.map((session) => (
              <div
                key={session.id}
                className="rounded-card border border-surface-200 bg-white p-4 shadow-card dark:border-surface-700 dark:bg-surface-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {session.lesson?.title || 'Practice Session'}
                    </p>
                    <p className="mt-1 text-xs text-surface-500">
                      {new Date(session.createdAt).toLocaleDateString()} at{' '}
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {session.accuracy != null && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.accuracy >= 0.8
                          ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500'
                          : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-600'
                      }`}
                    >
                      {Math.round(session.accuracy * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {session.predictions.length} predictions
                  </span>
                  {session.confidenceScore != null && (
                    <span className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      {Math.round(session.confidenceScore * 100)}% confidence
                    </span>
                  )}
                  {session.feedback && (
                    <span className="truncate max-w-[200px]">{session.feedback}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && tab === 'translation' && (
        <div
          id="translation-panel"
          role="tabpanel"
          aria-labelledby="translation-tab"
          className="space-y-3"
        >
          {translationHistory.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No translation sessions"
              description="Start translating to see your history here."
              accentColor="sky"
            />
          ) : (
            translationHistory.map((session) => (
              <div
                key={session.id}
                className="rounded-card border border-surface-200 bg-white p-4 shadow-card dark:border-surface-700 dark:bg-surface-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {session.type.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs text-surface-500">
                      {new Date(session.startedAt).toLocaleDateString()} at{' '}
                      {new Date(session.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      session.status === 'COMPLETED'
                        ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500'
                        : 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                {session.messages.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {session.messages.slice(0, 3).map((msg) => (
                      <p
                        key={msg.id}
                        className="text-xs text-surface-600 truncate dark:text-surface-400"
                      >
                        <span className="font-medium">Input:</span> {msg.inputText} &rarr;{' '}
                        <span className="font-medium">Output:</span> {msg.outputText}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

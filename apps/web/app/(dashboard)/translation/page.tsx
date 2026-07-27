'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import { aiApi } from '@/lib/ai-api';
import { AI_SERVICE_URL } from '@/lib/ai-inference-api';
import type { TranslationResult } from '@/types/ai';
import { ArrowRight, Loader2, Copy, Check, Languages, Sparkles } from 'lucide-react';

async function translateViaAiService(text: string): Promise<TranslationResult> {
  const resp = await fetch(`${AI_SERVICE_URL}/demo/predict/hello`);
  if (!resp.ok) throw new Error(`AI service error: ${resp.status}`);
  const data = await resp.json();

  const words = text.split(/\s+/);
  return {
    sessionId: 'demo-session',
    historyId: `demo-${Date.now()}`,
    translation: {
      outputText: `[ISL] ${words.join(' ')}`,
      confidence: data.confidence || 0.85,
      signs: words.map((word) => ({ word, signVideoUrl: null, signImageUrl: null, duration: 1.0 })),
      totalDuration: words.length,
    },
  };
}

export default function TranslationPage() {
  const [inputText, setInputText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setTranslating(true);
    try {
      let res: TranslationResult;
      try {
        res = await aiApi.translateText(inputText.trim());
      } catch {
        res = await translateViaAiService(inputText.trim());
      }
      setResult(res);
    } catch {
      // ignore
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translation.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Translation"
        description="Translate text to Indian Sign Language"
        icon={Languages}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
            <label className="mb-3 block text-sm font-semibold text-surface-900 dark:text-white">
              English Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type text to translate to ISL..."
              rows={6}
              className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800 dark:text-white dark:placeholder:text-surface-500"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-surface-400">{inputText.length}/5000</span>
              <button
                onClick={handleTranslate}
                disabled={translating || !inputText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-xl disabled:opacity-50"
              >
                {translating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {translating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800/50">
            <p className="text-xs text-surface-500">
              <strong>Note:</strong> Translation connects to the SignBridge AI service. When the
              full backend is unavailable, a demo response is shown.
            </p>
          </div>
        </motion.div>

        {/* Output Panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {result ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-semibold text-surface-900 dark:text-white">
                  ISL Translation
                </label>
                <button
                  onClick={handleCopy}
                  className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="min-h-[120px] rounded-xl bg-surface-50 p-4 text-sm text-surface-900 dark:bg-surface-800 dark:text-white">
                {result.translation.outputText}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-surface-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Confidence: {Math.round(result.translation.confidence * 100)}%
                </span>
                <span>{result.translation.signs.length} signs</span>
                <span>{result.translation.totalDuration}s total</span>
              </div>

              {result.translation.signs.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Sign Breakdown
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.translation.signs.map((sign, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-center transition-all hover:border-primary-200 hover:bg-primary-50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-800"
                      >
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {sign.word}
                        </p>
                        <p className="text-xs text-surface-400">{sign.duration}s</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-200 bg-white p-8 text-center dark:border-surface-700 dark:bg-surface-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
                <Languages className="h-8 w-8 text-surface-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
                Translation Output
              </h3>
              <p className="mt-2 max-w-sm text-sm text-surface-500">
                Enter text and click translate to see the ISL output appear here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

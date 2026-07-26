'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import { aiApi } from '@/lib/ai-api';
import type { TranslationResult } from '@/types/ai';
import { ArrowRight, Loader2, Copy, Check } from 'lucide-react';

export default function TranslationPage() {
  const [inputText, setInputText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setTranslating(true);
    try {
      const res = await aiApi.translateText(inputText.trim());
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
      <PageHeader title="Translation" description="Translate text to Indian Sign Language" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">English Text</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type text to translate to ISL..."
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">{inputText.length}/5000</span>
              <button
                onClick={handleTranslate}
                disabled={translating || !inputText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {translating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> This is a stub translation. The AI model for ISL translation is not yet integrated.
              The output shows a mock response for infrastructure testing.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {result ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">ISL Translation</label>
                <button onClick={handleCopy} className="rounded p-1 text-gray-400 hover:text-gray-600" title="Copy">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-900 min-h-[120px]">
                {result.translation.outputText}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>Confidence: {Math.round(result.translation.confidence * 100)}%</span>
                <span>{result.translation.signs.length} signs</span>
                <span>{result.translation.totalDuration}s total</span>
              </div>

              {result.translation.signs.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sign Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {result.translation.signs.map((sign, i) => (
                      <div key={i} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center">
                        <p className="text-sm font-medium text-gray-900">{sign.word}</p>
                        <p className="text-xs text-gray-400">{sign.duration}s</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <ArrowRight className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Translation Output</h3>
              <p className="mt-2 text-sm text-gray-500">Enter text and click translate to see the ISL output.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

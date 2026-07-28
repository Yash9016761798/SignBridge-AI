'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Play, BookMarked } from 'lucide-react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { DifficultyBadge } from '@/components/dictionary';
import { dictionaryApi } from '@/lib/dictionary-api';
import type { SignWord } from '@/types/dictionary';

export default function SignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sign, setSign] = useState<SignWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    dictionaryApi
      .getSignWordById(id)
      .then(setSign)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!sign) return;
    try {
      const result = await dictionaryApi.toggleFavorite(sign.id);
      setSign((prev) => (prev ? { ...prev, isFavorited: result.favorited } : prev));
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: sign?.word, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonLoader className="aspect-video rounded-card" />
          <div className="space-y-4">
            <SkeletonLoader className="h-8 w-64" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sign) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <BookMarked className="h-16 w-16 text-surface-300 dark:text-surface-600" />
        <h2 className="mt-4 text-xl font-semibold text-surface-900 dark:text-white">
          Sign not found
        </h2>
        <p className="mt-2 text-sm text-surface-500">
          The sign you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dictionary" className="mt-6 btn-sky text-sm">
          Back to Dictionary
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dictionary"
        className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dictionary
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="aspect-video overflow-hidden rounded-card bg-info-50 dark:bg-info-500/5 flex items-center justify-center">
          {sign.videoUrl ? (
            <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors">
              <Play className="h-10 w-10 text-info-600" />
            </button>
          ) : (
            <span className="text-8xl font-bold text-info-300 dark:text-info-500/30">
              {sign.word.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white">{sign.word}</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`rounded-full p-2 transition-colors ${
                    sign.isFavorited
                      ? 'bg-danger-50 text-danger-500 dark:bg-danger-500/10'
                      : 'bg-surface-100 text-surface-400 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700'
                  }`}
                  aria-label={sign.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-5 w-5 ${sign.isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-full bg-surface-100 p-2 text-surface-400 hover:bg-surface-200 transition-colors dark:bg-surface-800 dark:hover:bg-surface-700"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <DifficultyBadge difficulty={sign.difficulty} />
              {sign.category && (
                <span className="text-sm text-surface-500">{sign.category.name}</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
              Meaning
            </h2>
            <p className="text-surface-600 leading-relaxed dark:text-surface-400">{sign.meaning}</p>
          </div>

          <div className="rounded-card border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
              How to sign
            </h3>
            <p className="text-sm text-surface-500">
              Watch the video demonstration to learn the correct handshape, position, and movement
              for this sign.
            </p>
          </div>

          <div className="text-xs text-surface-400">
            Added {new Date(sign.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

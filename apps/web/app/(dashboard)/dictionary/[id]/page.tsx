'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, Play, BookMarked } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
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
          <SkeletonLoader className="aspect-video rounded-xl" />
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
        <BookMarked className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Sign not found</h2>
        <p className="mt-2 text-sm text-gray-500">The sign you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dictionary" className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Back to Dictionary
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dictionary" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Dictionary
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
          {sign.videoUrl ? (
            <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors">
              <Play className="h-10 w-10 text-primary-600" />
            </button>
          ) : (
            <span className="text-8xl font-bold text-primary-300">{sign.word.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{sign.word}</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`rounded-full p-2 transition-colors ${
                    sign.isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  aria-label={sign.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-5 w-5 ${sign.isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <DifficultyBadge difficulty={sign.difficulty} />
              {sign.category && (
                <span className="text-sm text-gray-500">{sign.category.name}</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Meaning</h2>
            <p className="text-gray-600 leading-relaxed">{sign.meaning}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">How to sign</h3>
            <p className="text-sm text-gray-500">
              Watch the video demonstration to learn the correct handshape, position, and movement for this sign.
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Added {new Date(sign.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

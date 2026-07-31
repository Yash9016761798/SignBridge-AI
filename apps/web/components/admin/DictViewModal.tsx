'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Tag,
  Bookmark,
  Video,
  Image,
  Calendar,
  BarChart,
  Heart,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminDictApi } from '@/lib/admin-dictionary-api';
import type { AdminDictSign } from '@/types/admin-dictionary';

interface DictViewModalProps {
  open: boolean;
  onClose: () => void;
  signId: string | null;
}

const difficultyBadge: Record<string, { color: string; label: string }> = {
  BEGINNER: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', label: 'Beginner' },
  INTERMEDIATE: { color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500', label: 'Intermediate' },
  ADVANCED: { color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500', label: 'Advanced' },
};

export default function DictViewModal({ open, onClose, signId }: DictViewModalProps) {
  const [sign, setSign] = useState<AdminDictSign | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && signId) {
      setLoading(true);
      adminDictApi.getSignById(signId).then(setSign).catch(() => setSign(null)).finally(() => setLoading(false));
    } else {
      setSign(null);
    }
  }, [open, signId]);

  const diff = sign ? difficultyBadge[sign.difficulty] : null;

  return (
    <GenericModal open={open} onClose={onClose} title="Sign Details" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : sign ? (
        <div className="space-y-6">
          {/* Media Preview */}
          <div className="overflow-hidden rounded-[16px] border border-surface-200 dark:border-surface-700">
            {sign.videoUrl ? (
              <div className="relative aspect-video bg-surface-100 dark:bg-surface-800">
                <video src={sign.videoUrl} controls className="h-full w-full object-cover" />
              </div>
            ) : sign.imageUrl ? (
              <div className="relative aspect-video bg-surface-100 dark:bg-surface-800">
                <img src={sign.imageUrl} alt={sign.word} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-surface-50 dark:bg-surface-800">
                <div className="text-center">
                  <Video className="mx-auto h-12 w-12 text-surface-300" />
                  <p className="mt-2 text-sm text-surface-400">No media available</p>
                </div>
              </div>
            )}
          </div>

          {/* Word & Meaning */}
          <div>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{sign.word}</h3>
            <p className="mt-1 text-surface-600 dark:text-surface-400">{sign.meaning}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${diff?.color}`}>
              <Tag className="mr-1 h-3 w-3" />{diff?.label}
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-bold text-surface-700 dark:bg-surface-800 dark:text-surface-300">
              {sign.category.name}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${sign.status === 'ACTIVE' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'}`}>
              {sign.status === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {sign.status === 'ACTIVE' ? 'Active' : 'Archived'}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-surface-100 p-3 dark:border-surface-800">
              <div className="flex items-center gap-2 text-surface-500 text-xs mb-1">
                <Heart className="h-3.5 w-3.5" /> Favorites
              </div>
              <p className="text-lg font-bold text-surface-900 dark:text-white">{sign.favoriteCount}</p>
            </div>
            <div className="rounded-[14px] border border-surface-100 p-3 dark:border-surface-800">
              <div className="flex items-center gap-2 text-surface-500 text-xs mb-1">
                <Bookmark className="h-3.5 w-3.5" /> Tags
              </div>
              <p className="text-lg font-bold text-surface-900 dark:text-white">{sign.tags.length}</p>
            </div>
          </div>

          {/* Tags */}
          {sign.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {sign.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-surface-500">
              <Calendar className="h-4 w-4" /> Created: {new Date(sign.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-surface-500">
              <Calendar className="h-4 w-4" /> Updated: {new Date(sign.updatedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Close */}
          <div className="flex justify-end border-t border-surface-100 pt-4 dark:border-surface-800">
            <button onClick={onClose} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-surface-500">Sign not found.</div>
      )}
    </GenericModal>
  );
}

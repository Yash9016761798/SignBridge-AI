'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import EmptyState from '@/components/dashboard/EmptyState';
import Pagination from '@/components/dashboard/Pagination';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { SignCard, AlphabetFilter, CategoryBrowser } from '@/components/dictionary';
import { dictionaryApi } from '@/lib/dictionary-api';
import { BookMarked, LayoutGrid, List } from 'lucide-react';
import type {
  SignWordListItem,
  SignCategory,
  SignDifficulty,
  AlphabetStats,
} from '@/types/dictionary';

export default function DictionaryPage() {
  const [signs, setSigns] = useState<SignWordListItem[]>([]);
  const [categories, setCategories] = useState<SignCategory[]>([]);
  const [alphabetStats, setAlphabetStats] = useState<AlphabetStats>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SignDifficulty | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchSigns = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await dictionaryApi.getSignWords({
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined,
          letter: selectedLetter || undefined,
          page,
          limit: 24,
        });
        setSigns(response.data);
        setPagination(response.pagination);
      } catch {
        setSigns([]);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory, selectedDifficulty, selectedLetter],
  );

  useEffect(() => {
    dictionaryApi
      .getCategories()
      .then(setCategories)
      .catch(() => {});
    dictionaryApi
      .getAlphabetStats()
      .then(setAlphabetStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSigns(1);
  }, [fetchSigns]);

  const handleToggleFavorite = async (signId: string) => {
    try {
      await dictionaryApi.toggleFavorite(signId);
      setSigns((prev) =>
        prev.map((s) => (s.id === signId ? { ...s, isFavorited: !s.isFavorited } : s)),
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ISL Dictionary"
        description="Browse Indian Sign Language words, phrases, and their meanings"
        icon={BookMarked}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search signs and meanings..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as SignDifficulty | '')}
            className="input-field text-sm min-h-[44px]"
            aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <div className="flex overflow-hidden rounded-[14px] border border-surface-200 dark:border-surface-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-info-500 text-surface-900' : 'bg-white text-surface-500 hover:bg-surface-50 dark:bg-surface-800 dark:hover:bg-surface-700'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 transition-colors ${viewMode === 'list' ? 'bg-info-500 text-surface-900' : 'bg-white text-surface-500 hover:bg-surface-50 dark:bg-surface-800 dark:hover:bg-surface-700'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <CategoryBrowser
        categories={categories}
        selectedCategoryId={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Alphabet Filter */}
      <AlphabetFilter
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        stats={alphabetStats}
      />

      {/* Results Count */}
      <div className="text-sm font-bold text-surface-500">
        {pagination.total} sign{pagination.total !== 1 ? 's' : ''} found
      </div>

      {/* Signs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-64 rounded-card" />
          ))}
        </div>
      ) : signs.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No signs found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {signs.map((sign) => (
            <SignCard key={sign.id} sign={sign} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {signs.map((sign) => (
            <SignCard key={sign.id} sign={sign} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchSigns}
      />
    </div>
  );
}

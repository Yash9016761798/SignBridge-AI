'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Archive,
  ChevronDown,
  Plus,
  Heart,
  Tag,
  List,
  Image,
  Video,
  EyeOff,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import Pagination from '@/components/dashboard/Pagination';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import DictViewModal from '@/components/admin/DictViewModal';
import DictCreateModal from '@/components/admin/DictCreateModal';
import DictEditModal from '@/components/admin/DictEditModal';
import CategoryManageModal from '@/components/admin/CategoryManageModal';
import { adminDictApi } from '@/lib/admin-dictionary-api';
import type { AdminDictSign, AdminDictStats, AdminDictCategory, AdminDictAlphabetStats, AdminDictDifficulty } from '@/types/admin-dictionary';

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  ACTIVE: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', icon: CheckCircle2, label: 'Active' },
  ARCHIVED: { color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400', icon: Archive, label: 'Archived' },
};

const difficultyConfig: Record<string, { color: string; label: string }> = {
  BEGINNER: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', label: 'Beginner' },
  INTERMEDIATE: { color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500', label: 'Intermediate' },
  ADVANCED: { color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500', label: 'Advanced' },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AdminDictionaryPage() {
  const [signs, setSigns] = useState<AdminDictSign[]>([]);
  const [stats, setStats] = useState<AdminDictStats | null>(null);
  const [categories, setCategories] = useState<AdminDictCategory[]>([]);
  const [alphabetStats, setAlphabetStats] = useState<AdminDictAlphabetStats>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<AdminDictDifficulty | ''>('');
  const [categoryIdFilter, setCategoryIdFilter] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewSignId, setViewSignId] = useState<string | null>(null);
  const [editSignId, setEditSignId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'archive' | 'duplicate';
    signId: string;
    signWord: string;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDictApi.getSigns({
        search: search || undefined,
        categoryId: categoryIdFilter || undefined,
        difficulty: (difficultyFilter as AdminDictDifficulty) || undefined,
        letter: letterFilter || undefined,
        page,
        limit: 10,
      });
      setSigns(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch {
      setSigns([]);
    } finally {
      setLoading(false);
    }
  }, [search, difficultyFilter, categoryIdFilter, letterFilter, page]);

  const fetchMeta = useCallback(async () => {
    try {
      const [s, c, a] = await Promise.all([
        adminDictApi.getStats(),
        adminDictApi.getCategories(),
        adminDictApi.getAlphabetStats(),
      ]);
      setStats(s);
      setCategories(c);
      setAlphabetStats(a);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchSigns(); }, [fetchSigns]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { setSearch(value); setPage(1); }, 300);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const refresh = useCallback(() => { fetchSigns(); fetchMeta(); }, [fetchSigns, fetchMeta]);

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      switch (confirmAction.type) {
        case 'delete': await adminDictApi.deleteSign(confirmAction.signId); break;
        case 'archive': await adminDictApi.archiveSign(confirmAction.signId); break;
        case 'duplicate': await adminDictApi.duplicateSign(confirmAction.signId); break;
      }
      refresh();
    } catch { /* ignore */ }
    setConfirmAction(null);
  };

  const confirmLabels: Record<string, { title: string; message: string; label: string; variant: 'danger' | 'warning' | 'info' }> = {
    delete: { title: 'Delete Sign', message: 'This action cannot be undone.', label: 'Delete', variant: 'danger' },
    archive: { title: 'Archive Sign', message: 'This sign will no longer be visible to students.', label: 'Archive', variant: 'warning' },
    duplicate: { title: 'Duplicate Sign', message: 'A copy of this sign will be created.', label: 'Duplicate', variant: 'info' },
  };

  const ci = confirmAction ? confirmLabels[confirmAction.type] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dictionary Management"
        description="Manage sign language dictionary entries"
        icon={BookOpen}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCategoryModal(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
              <List className="h-4 w-4" /> Categories
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" /> Add Sign
            </button>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Signs" value={stats.totalSigns} icon={BookOpen} />
          <StatCard title="Categories" value={stats.totalCategories} icon={List} />
          <StatCard title="Total Favorites" value={stats.totalFavorites} icon={Heart} />
          <StatCard title="Recently Added" value={stats.recentlyAdded} icon={Tag} />
        </div>
      )}

      {/* Alphabet Filter */}
      {Object.keys(alphabetStats).length > 0 && (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setLetterFilter(''); setPage(1); }}
            className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[8px] px-2 text-xs font-bold transition-colors ${
              !letterFilter ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400' : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
            }`}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const count = alphabetStats[letter] || 0;
            return (
              <button
                key={letter}
                onClick={() => { setLetterFilter(letter); setPage(1); }}
                disabled={count === 0}
                className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[8px] px-2 text-xs font-bold transition-colors ${
                  letterFilter === letter
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400'
                    : count > 0
                      ? 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
                      : 'bg-surface-50 text-surface-300 dark:bg-surface-900 dark:text-surface-700'
                }`}
                title={`${letter}: ${count}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={searchInput} onChange={handleSearchChange} placeholder="Search signs by word or meaning..." />
        </div>
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className={`flex min-h-[44px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                categoryIdFilter ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/10 dark:text-primary-400' : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300'
              }`}
              aria-label="Filter by category"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Category</span>
              {categoryIdFilter && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-bold text-primary-700">{categories.find((c) => c.id === categoryIdFilter)?.name}</span>}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openDropdown === 'category' && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-30 mt-2 w-52 max-h-60 overflow-y-auto rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900">
                  <div className="py-1">
                    <button onClick={() => { setCategoryIdFilter(''); setPage(1); setOpenDropdown(null); }} className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${!categoryIdFilter ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => { setCategoryIdFilter(cat.id); setPage(1); setOpenDropdown(null); }} className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${categoryIdFilter === cat.id ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                        <span>{cat.name}</span>
                        <span className="text-2xs text-surface-400">{cat.signCount}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
              className={`flex min-h-[44px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                difficultyFilter ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/10 dark:text-primary-400' : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300'
              }`}
              aria-label="Filter by difficulty"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Difficulty</span>
              {difficultyFilter && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-bold text-primary-700">{difficultyConfig[difficultyFilter]?.label}</span>}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'difficulty' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openDropdown === 'difficulty' && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900">
                  <div className="py-1">
                    {(['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((d) => (
                      <button key={d || 'all'} onClick={() => { setDifficultyFilter(d as AdminDictDifficulty | ''); setPage(1); setOpenDropdown(null); }} className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${difficultyFilter === d ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                        {d ? difficultyConfig[d]?.label : 'All Difficulties'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader count={5} />
      ) : signs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No signs found"
          description={search || difficultyFilter || categoryIdFilter || letterFilter ? 'Try adjusting your search or filters.' : 'No dictionary entries yet.'}
          accentColor="mint"
          action={<button onClick={() => setShowCreateModal(true)} className="btn-mint text-sm inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add First Sign</button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-surface-200 dark:border-surface-700">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Sign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Favorites</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">Media</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white dark:divide-surface-800 dark:bg-surface-900">
              {signs.map((sign) => {
                const StatusIcon = statusConfig[sign.status]?.icon || CheckCircle2;
                const diff = difficultyConfig[sign.difficulty];
                return (
                  <tr key={sign.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {sign.imageUrl ? (
                          <img src={sign.imageUrl} alt={sign.word} className="h-10 w-10 flex-shrink-0 rounded-[10px] object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{sign.word}</p>
                          <p className="text-xs text-surface-500 truncate max-w-[200px]">{sign.meaning}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-medium text-surface-700 dark:bg-surface-800 dark:text-surface-300">
                        {sign.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${diff?.color}`}>
                        <Tag className="mr-1 h-3 w-3" />{diff?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-surface-600 dark:text-surface-400">
                        <Heart className="h-3.5 w-3.5 text-danger-400" /> {sign.favoriteCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-1">
                        {sign.imageUrl ? <Image className="h-4 w-4 text-success-500" aria-label="Has image" /> : sign.videoUrl ? <Video className="h-4 w-4 text-info-500" aria-label="Has video" /> : <EyeOff className="h-4 w-4 text-surface-300" aria-label="No media" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig[sign.status]?.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[sign.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-surface-500">
                      {new Date(sign.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewSignId(sign.id)} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditSignId(sign.id)} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmAction({ type: 'duplicate', signId: sign.id, signWord: sign.word })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-info-50 hover:text-info-600 dark:hover:bg-info-500/10" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </button>
                        {sign.status === 'ACTIVE' ? (
                          <button onClick={() => setConfirmAction({ type: 'archive', signId: sign.id, signWord: sign.word })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-warning-50 hover:text-warning-600 dark:hover:bg-warning-500/10" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button onClick={() => setConfirmAction({ type: 'delete', signId: sign.id, signWord: sign.word })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && signs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total}</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <DictViewModal open={!!viewSignId} onClose={() => setViewSignId(null)} signId={viewSignId} />
      <DictCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={refresh} />
      <DictEditModal open={!!editSignId} onClose={() => setEditSignId(null)} signId={editSignId} onSaved={refresh} />
      <CategoryManageModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} onCategoryChange={refresh} />

      {ci && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAction}
          title={ci.title}
          message={`${confirmAction?.signWord ? `"${confirmAction.signWord}" — ` : ''}${ci.message}`}
          confirmLabel={ci.label}
          variant={ci.variant}
        />
      )}
    </div>
  );
}

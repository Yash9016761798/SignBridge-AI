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
  Clock,
  Users,
  BarChart,
  Tag,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import Pagination from '@/components/dashboard/Pagination';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import CourseViewModal from '@/components/admin/CourseViewModal';
import CourseCreateModal from '@/components/admin/CourseCreateModal';
import CourseEditModal from '@/components/admin/CourseEditModal';
import { adminCourseApi } from '@/lib/admin-course-api';
import type { AdminCourseListItem, AdminCourseStats, CourseDifficulty, CourseStatus } from '@/types/admin-course';

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  PUBLISHED: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', icon: CheckCircle2, label: 'Published' },
  DRAFT: { color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500', icon: AlertTriangle, label: 'Draft' },
  ARCHIVED: { color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400', icon: Archive, label: 'Archived' },
};

const difficultyConfig: Record<string, { color: string; label: string }> = {
  BEGINNER: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', label: 'Beginner' },
  INTERMEDIATE: { color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500', label: 'Intermediate' },
  ADVANCED: { color: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500', label: 'Advanced' },
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourseListItem[]>([]);
  const [stats, setStats] = useState<AdminCourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<CourseDifficulty | ''>('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'publish' | 'unpublish' | 'archive' | 'duplicate';
    courseId: string;
    courseName: string;
  } | null>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCourseApi.getCourses({
        search: search || undefined,
        difficulty: (difficultyFilter as CourseDifficulty) || undefined,
        status: (statusFilter as CourseStatus) || undefined,
        page,
        limit: 10,
      });
      setCourses(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, difficultyFilter, statusFilter, page]);

  const fetchStats = useCallback(async () => {
    try { setStats(await adminCourseApi.getStats()); } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

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

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      switch (confirmAction.type) {
        case 'delete': await adminCourseApi.deleteCourse(confirmAction.courseId); break;
        case 'publish': await adminCourseApi.publishCourse(confirmAction.courseId); break;
        case 'unpublish': await adminCourseApi.unpublishCourse(confirmAction.courseId); break;
        case 'archive': await adminCourseApi.archiveCourse(confirmAction.courseId); break;
        case 'duplicate': await adminCourseApi.duplicateCourse(confirmAction.courseId); break;
      }
      fetchCourses();
      fetchStats();
    } catch { /* ignore */ }
    setConfirmAction(null);
  };

  const confirmLabels: Record<string, { title: string; message: string; label: string; variant: 'danger' | 'warning' | 'info' }> = {
    delete: { title: 'Delete Course', message: 'This action cannot be undone.', label: 'Delete', variant: 'danger' },
    publish: { title: 'Publish Course', message: 'This course will be visible to students.', label: 'Publish', variant: 'info' },
    unpublish: { title: 'Unpublish Course', message: 'This course will be moved to draft.', label: 'Unpublish', variant: 'warning' },
    archive: { title: 'Archive Course', message: 'This course will no longer be accessible to students.', label: 'Archive', variant: 'warning' },
    duplicate: { title: 'Duplicate Course', message: 'A copy of this course will be created as a draft.', label: 'Duplicate', variant: 'info' },
  };

  const ci = confirmAction ? confirmLabels[confirmAction.type] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Manage all courses on the platform"
        icon={BookOpen}
        action={
          <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Create Course
          </button>
        }
      />

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} />
          <StatCard title="Published" value={stats.publishedCourses} icon={CheckCircle2} />
          <StatCard title="Drafts" value={stats.draftCourses} icon={AlertTriangle} />
          <StatCard title="Total Enrollments" value={stats.totalEnrollments} icon={Users} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar value={searchInput} onChange={handleSearchChange} placeholder="Search courses..." />
        </div>
        <div className="flex items-center gap-2" ref={dropdownRef}>
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
                      <button key={d || 'all'} onClick={() => { setDifficultyFilter(d as CourseDifficulty | ''); setPage(1); setOpenDropdown(null); }} className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${difficultyFilter === d ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                        {d ? difficultyConfig[d]?.label : 'All Difficulties'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className={`flex min-h-[44px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                statusFilter ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/10 dark:text-primary-400' : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300'
              }`}
              aria-label="Filter by status"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
              {statusFilter && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-bold text-primary-700">{statusConfig[statusFilter]?.label}</span>}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openDropdown === 'status' && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900">
                  <div className="py-1">
                    {(['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((s) => (
                      <button key={s || 'all'} onClick={() => { setStatusFilter(s as CourseStatus | ''); setPage(1); setOpenDropdown(null); }} className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${statusFilter === s ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
                        {s ? statusConfig[s]?.label : 'All Statuses'}
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
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={search || difficultyFilter || statusFilter ? 'Try adjusting your search or filters.' : 'No courses have been created yet.'}
          accentColor="mint"
          action={<button onClick={() => setShowCreateModal(true)} className="btn-mint text-sm inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Create First Course</button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-surface-200 dark:border-surface-700">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden md:table-cell">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Modules</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Students</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">Completion</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white dark:divide-surface-800 dark:bg-surface-900">
              {courses.map((course) => {
                const StatusIcon = statusConfig[course.status]?.icon || CheckCircle2;
                return (
                  <tr key={course.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{course.title}</p>
                        <p className="text-xs text-surface-500 truncate">{course.instructorName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${difficultyConfig[course.difficulty]?.color}`}>
                        <Tag className="h-3 w-3 mr-1" />
                        {difficultyConfig[course.difficulty]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-surface-600 dark:text-surface-400">{course.moduleCount}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-surface-600 dark:text-surface-400">{course.enrollmentCount}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                          <div className="h-full rounded-full bg-success-500" style={{ width: `${course.completionRate}%` }} />
                        </div>
                        <span className="text-xs text-surface-500">{course.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig[course.status]?.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[course.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-surface-500">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewCourseId(course.id)} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditCourseId(course.id)} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmAction({ type: 'duplicate', courseId: course.id, courseName: course.title })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-info-50 hover:text-info-600 dark:hover:bg-info-500/10" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </button>
                        {course.status === 'PUBLISHED' ? (
                          <button onClick={() => setConfirmAction({ type: 'unpublish', courseId: course.id, courseName: course.title })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-warning-50 hover:text-warning-600 dark:hover:bg-warning-500/10" title="Unpublish">
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : course.status === 'DRAFT' ? (
                          <button onClick={() => setConfirmAction({ type: 'publish', courseId: course.id, courseName: course.title })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/10" title="Publish">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button onClick={() => setConfirmAction({ type: 'delete', courseId: course.id, courseName: course.title })} className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10" title="Delete">
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

      {!loading && courses.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total}</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modals */}
      <CourseViewModal open={!!viewCourseId} onClose={() => setViewCourseId(null)} courseId={viewCourseId} />
      <CourseCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={() => { fetchCourses(); fetchStats(); }} />
      <CourseEditModal open={!!editCourseId} onClose={() => setEditCourseId(null)} courseId={editCourseId} onSaved={() => { fetchCourses(); fetchStats(); }} />

      {ci && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleAction}
          title={ci.title}
          message={`${confirmAction?.courseName ? `"${confirmAction.courseName}" — ` : ''}${ci.message}`}
          confirmLabel={ci.label}
          variant={ci.variant}
        />
      )}
    </div>
  );
}

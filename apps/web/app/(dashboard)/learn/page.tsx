'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import EmptyState from '@/components/dashboard/EmptyState';
import Pagination from '@/components/dashboard/Pagination';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi, type CourseQueryParams } from '@/lib/learning-api';
import type { CourseListItem } from '@/types/learning';
import { BookOpen, Clock, Users, BarChart } from 'lucide-react';

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: CourseQueryParams = { page, limit: 12, status: 'PUBLISHED' };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      const response = await learningApi.getCourses(params);
      setCourses(response.data);
      setPagination(response.pagination);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty]);

  useEffect(() => { fetchCourses(1); }, [fetchCourses]);

  return (
    <div className="space-y-6">
      <PageHeader title="Learn ISL" description="Browse courses and start your Indian Sign Language journey" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1" />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/learn/${course.id}`} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                  <DifficultyBadge difficulty={course.difficulty} />
                </div>
                {course.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BarChart className="h-3.5 w-3.5" />{course.moduleCount} modules</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.estimatedDuration ? `${course.estimatedDuration}m` : 'N/A'}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrollmentCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchCourses} />
    </div>
  );
}

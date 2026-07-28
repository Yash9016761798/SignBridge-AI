'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import EmptyState from '@/components/dashboard/EmptyState';
import Pagination from '@/components/dashboard/Pagination';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi, type CourseQueryParams } from '@/lib/learning-api';
import type { CourseListItem } from '@/types/learning';
import { BookOpen, Clock, Users, BarChart, Play } from 'lucide-react';

export default function LearnPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchCourses = useCallback(
    async (page = 1) => {
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
    },
    [search, difficulty],
  );

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learn ISL"
        description="Browse courses and start your Indian Sign Language journey"
        icon={BookOpen}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search courses..."
          className="flex-1"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="input-field text-sm"
        >
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-72 rounded-card" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/learn/${course.id}`}
                className="group block overflow-hidden rounded-card bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 dark:bg-surface-900"
              >
                <div className="relative aspect-video bg-gradient-brand-soft">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 text-primary-500 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <DifficultyBadge difficulty={course.difficulty} />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-surface-900 group-hover:text-primary-600 transition-colors dark:text-white">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mt-2 text-sm text-surface-500 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-surface-500 font-medium">
                    <span className="flex items-center gap-1">
                      <BarChart className="h-3.5 w-3.5" />
                      {course.moduleCount} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.estimatedDuration ? `${course.estimatedDuration}m` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.enrollmentCount}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchCourses}
      />
    </div>
  );
}

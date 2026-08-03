'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Award,
  Video,
  TrendingUp,
  Brain,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  Play,
  Layers,
  BarChart3,
  Edit,
  ArrowRight,
  FileText,
} from 'lucide-react';

/* ============================================================================
   COURSE MANAGEMENT DATA CONFIGS
   ============================================================================ */

const COURSE_KPIS = [
  {
    title: 'Published Courses',
    value: '24',
    change: 4,
    icon: BookOpen,
    hex: '#B8E6C3',
    subtext: 'active in catalog',
  },
  {
    title: 'Active Learners',
    value: '42,150',
    change: 18,
    icon: GraduationCap,
    hex: '#E8A5C9',
    subtext: 'enrolled students',
  },
  {
    title: 'Avg Completion Rate',
    value: '88%',
    change: 5,
    icon: Award,
    hex: '#F6D365',
    subtext: 'learning efficiency',
  },
  {
    title: 'AI Practice Enabled',
    value: '100%',
    change: 0,
    icon: Brain,
    hex: '#D8B4F8',
    subtext: '60 FPS real-time feedback',
  },
  {
    title: 'Certificates Issued',
    value: '38,410',
    change: 12,
    icon: Award,
    hex: '#A9D6F5',
    subtext: 'accredited certificates',
  },
  {
    title: 'Weekly Engagement',
    value: '+28%',
    change: 28,
    icon: TrendingUp,
    hex: '#E8A5C9',
    subtext: 'vs last week',
  },
];

const MOCK_COURSES = [
  {
    id: 'c-1',
    title: 'Medical Sign Language & Emergency Response',
    category: 'Healthcare',
    thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400',
    completion: 68,
    gestureAccuracy: '92%',
    students: '12,450',
    practiceSessions: '148,520',
    certificates: '4,210',
    lessonsCount: 18,
    status: 'Published',
    hex: '#E8A5C9',
  },
  {
    id: 'c-2',
    title: 'ISL Basic Alphabet & Number Masterclass',
    category: 'Foundational',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    completion: 92,
    gestureAccuracy: '98.4%',
    students: '28,920',
    practiceSessions: '342,180',
    certificates: '18,450',
    lessonsCount: 12,
    status: 'Published',
    hex: '#F6D365',
  },
  {
    id: 'c-3',
    title: 'Government Office & Passport Counter Communication',
    category: 'Civic & Govt',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
    completion: 74,
    gestureAccuracy: '94.6%',
    students: '8,410',
    practiceSessions: '89,420',
    certificates: '3,120',
    lessonsCount: 15,
    status: 'Published',
    hex: '#A9D6F5',
  },
  {
    id: 'c-4',
    title: 'Banking & Financial Services Sign Language',
    category: 'Finance',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
    completion: 81,
    gestureAccuracy: '96.2%',
    students: '6,280',
    practiceSessions: '64,120',
    certificates: '2,890',
    lessonsCount: 14,
    status: 'Published',
    hex: '#B8E6C3',
  },
];

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = MOCK_COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#B8E6C3]/50 px-3.5 py-1 text-2xs font-extrabold text-[#111111] mb-1">
            <Brain className="h-3.5 w-3.5" />
            <span>AI Curriculum & Course Builder</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111]">
            Course Management & AI Builder
          </h1>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-[#111111] text-white px-6 py-3 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          <Sparkles className="h-4 w-4 text-[#F6D365]" />
          <span>✨ Generate AI Course</span>
        </button>
      </div>

      {/* 6 Pastel KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {COURSE_KPIS.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ backgroundColor: kpi.hex }}
            className="rounded-[24px] p-5 shadow-sm border border-black/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-2xs font-extrabold uppercase tracking-wider text-[#111111]/80 truncate">
                  {kpi.title}
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#111111] text-white shadow-2xs">
                  <kpi.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="font-heading text-3xl font-extrabold text-[#111111] mt-3">
                {kpi.value}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-2xs font-extrabold text-[#111111]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#111111]/15 px-2 py-0.5">
                +{kpi.change}%
              </span>
              <span className="text-[#111111]/70 font-semibold truncate">{kpi.subtext}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, courses, AI logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-black/10 bg-[#FAF8F6] pl-10 pr-4 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-black/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">
            Showing {filteredCourses.length} Courses
          </span>
        </div>
      </div>

      {/* Course Cards Grid (Richer Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] bg-white p-6 shadow-sm border border-black/5 flex flex-col justify-between space-y-5 transition-all hover:shadow-md"
          >
            {/* Top Info */}
            <div className="flex items-start gap-4">
              <img
                src={c.thumbnail}
                alt={c.title}
                className="h-20 w-28 rounded-[20px] object-cover border border-black/10 shadow-2xs flex-shrink-0"
              />
              <div>
                <span
                  style={{ backgroundColor: c.hex }}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-2xs font-extrabold text-[#111111] mb-1"
                >
                  {c.category} • {c.lessonsCount} Lessons
                </span>
                <h3 className="font-display text-lg font-extrabold text-[#111111] leading-snug">
                  {c.title}
                </h3>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-black/5 text-center">
              <div className="rounded-[16px] bg-[#FAF8F6] p-2.5">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Accuracy</p>
                <p className="font-heading text-sm font-extrabold text-[#111111] mt-0.5">
                  {c.gestureAccuracy}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#FAF8F6] p-2.5">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Learners</p>
                <p className="font-heading text-sm font-extrabold text-[#111111] mt-0.5">
                  {c.students}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#FAF8F6] p-2.5">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Sessions</p>
                <p className="font-heading text-sm font-extrabold text-[#111111] mt-0.5">
                  {c.practiceSessions}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#FAF8F6] p-2.5">
                <p className="text-[10px] font-extrabold uppercase text-gray-400">Certificates</p>
                <p className="font-heading text-sm font-extrabold text-[#111111] mt-0.5">
                  {c.certificates}
                </p>
              </div>
            </div>

            {/* Gradient Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-extrabold mb-1 text-[#111111]">
                <span>Course Completion Rate</span>
                <span>{c.completion}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  style={{ width: `${c.completion}%` }}
                  className="h-full bg-gradient-to-r from-[#E8A5C9] via-[#F6D365] to-[#B8E6C3] rounded-full"
                />
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-[#B8E6C3]" /> AI Real-Time Feedback Active
              </span>
              <button className="flex items-center gap-1.5 rounded-full bg-[#111111] text-white px-5 py-2 text-xs font-extrabold hover:bg-black transition-all">
                <Edit className="h-3.5 w-3.5" /> Edit Lessons
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Suggested Course Improvements Panel */}
      <div className="rounded-[32px] bg-[#1B1B1D] p-6 lg:p-8 text-white shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#F6D365] text-[#111111] font-extrabold shadow-sm">
            <Brain className="h-6 w-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-white">
              AI Suggested Improvements
            </h3>
            <p className="text-xs font-semibold text-gray-400">
              AI detected 4 missing medical gesture landmark variations in Lesson #12. Auto-optimize
              available.
            </p>
          </div>
        </div>

        <button className="rounded-full bg-[#F6D365] text-[#111111] px-6 py-3 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          Apply AI Optimization
        </button>
      </div>
    </div>
  );
}

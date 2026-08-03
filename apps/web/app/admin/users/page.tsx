'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Award,
  Video,
  TrendingUp,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Sparkles,
  Shield,
  Building2,
  CheckCircle2,
  Brain,
  Plus,
  ChevronDown,
} from 'lucide-react';

/* ============================================================================
   USER MANAGEMENT DATA CONFIGS
   ============================================================================ */

const USER_KPIS = [
  {
    title: 'Total Registered Users',
    value: '124,820',
    change: 18,
    icon: Users,
    hex: '#E8A5C9',
    subtext: 'across 24 institutions',
  },
  {
    title: 'Online Now',
    value: '1,420',
    change: 12,
    icon: UserCheck,
    hex: '#B8E6C3',
    subtext: 'active on platform',
  },
  {
    title: 'Certified Learners',
    value: '38,410',
    change: 24,
    icon: Award,
    hex: '#A9D6F5',
    subtext: 'blockchain verified',
  },
  {
    title: 'AI Sessions Today',
    value: '14,820',
    change: 33,
    icon: Video,
    hex: '#D8B4F8',
    subtext: '60 FPS pose tracking',
  },
  {
    title: 'Avg Course Completion',
    value: '84%',
    change: 5,
    icon: GraduationCap,
    hex: '#F6D365',
    subtext: 'high engagement',
  },
  {
    title: 'Weekly User Growth',
    value: '+18.4%',
    change: 18,
    icon: TrendingUp,
    hex: '#E8A5C9',
    subtext: 'vs previous week',
  },
];

const MOCK_USERS = [
  {
    id: 'u-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@kv.edu.in',
    role: 'Student',
    level: 'Level 7',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    completion: 95,
    status: 'Active',
    lastActive: '5 mins ago',
    institution: 'Kendriya Vidyalaya Delhi',
    certificates: 4,
    accuracy: '98.2%',
  },
  {
    id: 'u-2',
    name: 'Rahul Patel',
    email: 'rahul.patel@aiims.gov.in',
    role: 'Teacher',
    level: 'Level 9 Instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    completion: 100,
    status: 'Active',
    lastActive: '12 mins ago',
    institution: 'AIIMS New Delhi',
    certificates: 8,
    accuracy: '99.4%',
  },
  {
    id: 'u-3',
    name: 'Anita Desai',
    email: 'anita.desai@passport.gov.in',
    role: 'Govt Staff',
    level: 'Level 4 Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    completion: 78,
    status: 'Active',
    lastActive: '1 hour ago',
    institution: 'Passport Seva Kendra',
    certificates: 2,
    accuracy: '94.8%',
  },
  {
    id: 'u-4',
    name: 'Vikram Singh',
    email: 'vikram.singh@sbi.co.in',
    role: 'Bank Officer',
    level: 'Level 5 Agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    completion: 82,
    status: 'Active',
    lastActive: '2 hours ago',
    institution: 'State Bank of India',
    certificates: 3,
    accuracy: '96.1%',
  },
  {
    id: 'u-5',
    name: 'Meera Nair',
    email: 'meera.nair@nish.ac.in',
    role: 'University Student',
    level: 'Level 8 Scholar',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    completion: 91,
    status: 'Active',
    lastActive: 'Just now',
    institution: 'NISH Trivandrum',
    certificates: 5,
    accuracy: '98.9%',
  },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredUsers = MOCK_USERS.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8A5C9]/40 px-3.5 py-1 text-2xs font-extrabold text-[#111111] mb-1">
            <Users className="h-3.5 w-3.5" />
            <span>National User Directory Operations</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111]">
            User & Learner Management
          </h1>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-[#111111] text-white px-5 py-2.5 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          <Plus className="h-4 w-4 text-[#F6D365]" />
          <span>Add New User Account</span>
        </button>
      </div>

      {/* 6 Pastel KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {USER_KPIS.map((kpi, i) => (
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

      {/* Today's Registration Insights Bar */}
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-black/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#F6D365] text-[#111111] font-extrabold shadow-sm">
            <Sparkles className="h-6 w-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#111111]">
              Today&apos;s Registration Insights
            </h3>
            <p className="text-xs font-medium text-gray-600">
              24 new accounts onboarded across national hubs today.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-[18px] bg-[#E8A5C9]/30 border border-black/5 px-4 py-2.5 text-xs font-extrabold text-[#111111]">
            Students: <strong>18</strong>
          </div>
          <div className="rounded-[18px] bg-[#A9D6F5]/40 border border-black/5 px-4 py-2.5 text-xs font-extrabold text-[#111111]">
            Teachers: <strong>4</strong>
          </div>
          <div className="rounded-[18px] bg-[#B8E6C3]/40 border border-black/5 px-4 py-2.5 text-xs font-extrabold text-[#111111]">
            Govt Staff: <strong>2</strong>
          </div>
        </div>
      </div>

      {/* User Directory Table & Search Controls */}
      <div className="rounded-[32px] bg-white p-6 lg:p-8 shadow-sm border border-black/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5">
          {/* Search Input */}
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

          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Student', 'Teacher', 'Govt Staff', 'Bank Officer'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                  roleFilter === role
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#FAF8F6] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-gray-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="pb-3 px-2">User Profile</th>
                <th className="pb-3 px-2">Level & Role</th>
                <th className="pb-3 px-2">Institution</th>
                <th className="pb-3 px-2">Course Progress</th>
                <th className="pb-3 px-2">AI Accuracy</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F6] transition-colors">
                  {/* User Profile + Avatar */}
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-10 w-10 rounded-full object-cover border border-black/10 shadow-2xs"
                      />
                      <div>
                        <p className="font-extrabold text-[#111111]">{u.name}</p>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Level & Role Badge */}
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8A5C9]/30 text-[#111111] px-3 py-1 text-2xs font-extrabold">
                      {u.level} • {u.role}
                    </span>
                  </td>

                  {/* Institution */}
                  <td className="py-4 px-2 font-bold text-gray-700">{u.institution}</td>

                  {/* Progress Bar */}
                  <td className="py-4 px-2 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          style={{ width: `${u.completion}%` }}
                          className="h-full bg-gradient-to-r from-[#E8A5C9] to-[#B8E6C3] rounded-full"
                        />
                      </div>
                      <span className="text-2xs font-extrabold text-[#111111]">
                        {u.completion}%
                      </span>
                    </div>
                  </td>

                  {/* AI Accuracy */}
                  <td className="py-4 px-2 font-extrabold text-[#111111]">{u.accuracy}</td>

                  {/* Status */}
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B8E6C3] px-2.5 py-0.5 text-2xs font-extrabold text-[#111111]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#111111]" />
                      {u.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="View Profile"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#111111] hover:text-white transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Edit Account"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#111111] hover:text-white transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Certificates"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#111111] hover:text-white transition-all"
                      >
                        <Award className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Widget */}
      <div className="rounded-[32px] bg-[#1B1B1D] p-6 lg:p-8 text-white shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#D8B4F8] text-[#111111] font-extrabold shadow-sm">
            <Brain className="h-6 w-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-white">
              AI Recommendation: Top Learners Today
            </h3>
            <p className="text-xs font-semibold text-gray-400">
              AI identified 18 learners eligible for Advanced Medical ISL Certification upgrade.
            </p>
          </div>
        </div>

        <button className="rounded-full bg-[#D8B4F8] text-[#111111] px-6 py-3 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          Issue Batch Certificates
        </button>
      </div>
    </div>
  );
}

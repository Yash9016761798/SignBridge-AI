'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Brain,
  Sparkles,
  Search,
  Play,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Zap,
  Volume2,
  X,
} from 'lucide-react';

/* ============================================================================
   DICTIONARY MANAGEMENT DATA CONFIGS
   ============================================================================ */

const DICTIONARY_KPIS = [
  {
    title: 'Total Sign Gestures',
    value: '1,856',
    change: 15,
    icon: BookMarked,
    hex: '#F6D365',
    subtext: 'ISL standardized',
  },
  {
    title: 'AI Accuracy Score',
    value: '98.42%',
    change: 0.4,
    icon: Brain,
    hex: '#D8B4F8',
    subtext: '21 landmark pose model',
  },
  {
    title: 'Total Translations',
    value: '148,920',
    change: 33,
    icon: TrendingUp,
    hex: '#A9D6F5',
    subtext: 'evaluated today',
  },
  {
    title: 'Trending Gestures',
    value: '42',
    change: 12,
    icon: Flame,
    hex: '#E8A5C9',
    subtext: 'high daily practice',
  },
  {
    title: 'Domain Categories',
    value: '7',
    change: 1,
    icon: Zap,
    hex: '#B8E6C3',
    subtext: 'Medical to Civic',
  },
  {
    title: 'Offline Audio Clips',
    value: '1,856',
    change: 10,
    icon: Volume2,
    hex: '#E8A5C9',
    subtext: 'synthesized ISL',
  },
];

const DOMAIN_CATEGORIES = [
  'All',
  'Greetings',
  'Education',
  'Hospital',
  'Government',
  'Emergency',
  'Transport',
  'Shopping',
];

const MOCK_DICTIONARY = [
  {
    id: 'd-1',
    word: 'Namaste / Hello',
    category: 'Greetings',
    accuracy: '99.2%',
    usage: '42.8K times',
    badge: '🔥 Trending',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#F6D365',
  },
  {
    id: 'd-2',
    word: 'Doctor / Medical Help',
    category: 'Hospital',
    accuracy: '98.4%',
    usage: '21.4K times',
    badge: '⭐ Most Practiced',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#E8A5C9',
  },
  {
    id: 'd-3',
    word: 'Emergency Ambulance',
    category: 'Emergency',
    accuracy: '97.8%',
    usage: '18.9K times',
    badge: '🔥 High Priority',
    thumbnail: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#B8E6C3',
  },
  {
    id: 'd-4',
    word: 'Passport Counter Inquiry',
    category: 'Government',
    accuracy: '96.9%',
    usage: '12.1K times',
    badge: '⭐ Civic Standard',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#A9D6F5',
  },
  {
    id: 'd-5',
    word: 'Teacher / Classroom',
    category: 'Education',
    accuracy: '98.9%',
    usage: '34.2K times',
    badge: '🔥 Trending',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#D8B4F8',
  },
  {
    id: 'd-6',
    word: 'Ticket Booking / Bus Station',
    category: 'Transport',
    accuracy: '95.4%',
    usage: '9.8K times',
    badge: '⭐ Public Transit',
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    hex: '#F6D365',
  },
];

export default function AdminDictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewSign, setPreviewSign] = useState<(typeof MOCK_DICTIONARY)[0] | null>(null);

  const filteredSigns = MOCK_DICTIONARY.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F6D365]/50 px-3.5 py-1 text-2xs font-extrabold text-[#111111] mb-1">
            <BookMarked className="h-3.5 w-3.5" />
            <span>National ISL Standard Gesture Repository</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111]">
            Dictionary & Landmark Management
          </h1>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-[#111111] text-white px-6 py-3 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          <Sparkles className="h-4 w-4 text-[#F6D365]" />
          <span>✨ Generate AI Sign</span>
        </button>
      </div>

      {/* 6 Pastel KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {DICTIONARY_KPIS.map((kpi, i) => (
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

      {/* Domain Category Filter Pills */}
      <div className="rounded-[28px] bg-white p-6 shadow-sm border border-black/5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <span className="text-xs font-bold text-gray-500">
            Showing {filteredSigns.length} Gestures
          </span>
        </div>

        {/* Domain Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
          {DOMAIN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition-all ${
                activeCategory === cat
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#FAF8F6] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gesture Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSigns.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] bg-white p-6 shadow-sm border border-black/5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <img
                src={item.thumbnail}
                alt={item.word}
                className="h-16 w-20 rounded-[18px] object-cover border border-black/10 shadow-2xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span
                  style={{ backgroundColor: item.hex }}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-extrabold text-[#111111] mb-1"
                >
                  {item.badge}
                </span>
                <h3 className="font-display text-base font-extrabold text-[#111111] truncate">
                  {item.word}
                </h3>
                <p className="text-xs font-bold text-gray-500">{item.category} Domain</p>
              </div>
            </div>

            {/* AI Accuracy & Usage */}
            <div className="flex items-center justify-between pt-3 border-t border-black/5 text-xs font-extrabold text-[#111111]">
              <div className="rounded-full bg-[#B8E6C3]/40 px-3 py-1 text-2xs">
                AI Accuracy: <strong>{item.accuracy}</strong>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-2xs">{item.usage}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xs font-bold text-gray-400">21-Landmark Model</span>
              <button
                onClick={() => setPreviewSign(item)}
                className="flex items-center gap-1.5 rounded-full bg-[#111111] text-white px-4 py-2 text-xs font-extrabold hover:bg-black transition-all"
              >
                <Play className="h-3.5 w-3.5 text-[#F6D365]" /> Preview Sign
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Missing Gestures Alert Panel */}
      <div className="rounded-[32px] bg-[#1B1B1D] p-6 lg:p-8 text-white shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#E8A5C9] text-[#111111] font-extrabold shadow-sm">
            <Brain className="h-6 w-6 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-white">
              AI Alert: Missing Emergency Gestures
            </h3>
            <p className="text-xs font-semibold text-gray-400">
              AI detected 12 missing gesture landmarks in Emergency Healthcare domain. Auto-train
              queued.
            </p>
          </div>
        </div>

        <button className="rounded-full bg-[#E8A5C9] text-[#111111] px-6 py-3 text-xs font-extrabold shadow-sm hover:scale-105 transition-all">
          Train Missing Gestures
        </button>
      </div>

      {/* Interactive Sign Preview Modal */}
      <AnimatePresence>
        {previewSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl border border-black/10 text-[#111111]"
            >
              <button
                onClick={() => setPreviewSign(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-[#111111] hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <span
                style={{ backgroundColor: previewSign.hex }}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-2xs font-extrabold text-[#111111] mb-2"
              >
                {previewSign.badge}
              </span>
              <h3 className="font-display text-2xl font-extrabold">{previewSign.word}</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {previewSign.category} Domain • Accuracy {previewSign.accuracy}
              </p>

              {/* Video Preview */}
              <div className="mt-4 rounded-[20px] overflow-hidden bg-black aspect-video flex items-center justify-center border border-black/10">
                <img
                  src={previewSign.thumbnail}
                  alt={previewSign.word}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold">
                <span>
                  Usage Volume: <strong>{previewSign.usage}</strong>
                </span>
                <button
                  onClick={() => setPreviewSign(null)}
                  className="rounded-full bg-[#111111] text-white px-5 py-2 text-xs font-extrabold"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeBannerProps {
  firstName: string;
  role: string;
  organization?: string;
  lastLogin?: string;
  className?: string;
}

export default function WelcomeBanner({
  firstName,
  role,
  organization,
  lastLogin,
  className = '',
}: WelcomeBannerProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-6 text-white shadow-glow lg:p-8 ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary-500/30 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold lg:text-3xl">
              {greeting()}, {firstName}! 👋
            </h2>
            <p className="mt-1 text-primary-100 lg:text-lg">
              Welcome back to your learning dashboard.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-white/10 p-3 backdrop-blur-sm lg:block">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-accent-400" />
            Role: {role}
          </div>
          {organization && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {organization}
            </div>
          )}
          {lastLogin && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              Last login: {lastLogin}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

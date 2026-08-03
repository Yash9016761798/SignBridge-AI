'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

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
  const { switchRole } = useAuthStore();
  const router = useRouter();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRoleSwitch = (newRole: 'ADMIN' | 'LEARNER') => {
    switchRole(newRole);
    if (newRole === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background:
          'linear-gradient(135deg, rgba(233,168,201,0.30) 0%, rgba(246,211,101,0.25) 50%, rgba(169,214,245,0.30) 100%)',
      }}
      className={`relative overflow-hidden rounded-[24px] p-6 lg:p-8 text-[#111111] border border-black/5 shadow-sm ${className}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl text-[#111111]">
              {greeting()}, {firstName}!{' '}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h2>
            <p className="font-body mt-1 text-[#111111]/80 font-medium lg:text-lg">
              Welcome back to your Indian Sign Language learning platform.
            </p>
          </div>
          <div className="hidden rounded-[18px] bg-[#111111] p-3.5 text-white shadow-md lg:block">
            <Sparkles className="h-6 w-6 text-[#E9A8C9]" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#B8E6C3]" />
            Role: {role}
          </div>

          {/* Quick Portal Switcher */}
          {role === 'ADMIN' ? (
            <button
              onClick={() => handleRoleSwitch('LEARNER')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] text-white px-4 py-1.5 text-xs font-extrabold shadow-sm hover:scale-105 transition-all"
            >
              <User className="h-3.5 w-3.5 text-[#F6D365]" />
              Switch to Learner Portal ➔
            </button>
          ) : (
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] text-white px-4 py-1.5 text-xs font-extrabold shadow-sm hover:scale-105 transition-all"
            >
              <Shield className="h-3.5 w-3.5 text-[#E9A8C9]" />
              Switch to Admin Portal ➔
            </button>
          )}

          {organization && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111]">
              {organization}
            </div>
          )}
          {lastLogin && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111]/80">
              Last login: {lastLogin}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

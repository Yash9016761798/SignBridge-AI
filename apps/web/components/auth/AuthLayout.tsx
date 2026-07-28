'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-[#0D0D0D]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden gradient-bg">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <Logo size="lg" priority />
            <span className="text-2xl font-bold text-surface-900">SignBridge AI</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="text-4xl font-bold leading-tight text-surface-900 xl:text-5xl tracking-tight">
              Breaking Communication
              <br />
              <span className="text-surface-800/60">Barriers</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-surface-800/70">
              Learn Indian Sign Language with AI-powered feedback and real-time practice sessions.
              Join thousands of learners breaking barriers.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="mt-12 space-y-3"
          >
            {[
              { icon: '🎯', text: 'AI-powered real-time feedback' },
              { icon: '📚', text: '100+ interactive lessons' },
              { icon: '🌍', text: 'Join 10,000+ learners worldwide' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-[18px] bg-white/15 p-4 backdrop-blur-sm"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-semibold text-surface-900">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mx-auto w-full max-w-[400px]"
        >
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="md" priority />
              <span className="text-xl font-bold text-surface-900 dark:text-white tracking-tight">
                SignBridge AI
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white lg:text-[34px]">
            {title}
          </h1>
          {subtitle && <p className="mt-2.5 text-sm text-surface-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-surface-500">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}

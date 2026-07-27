'use client';

import React from 'react';
import Link from 'next/link';
import { HandMetal } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <Link href="/" className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <HandMetal className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SignBridge AI</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Breaking Communication
              <br />
              <span className="text-primary-200">Barriers</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-primary-100/90">
              Learn Indian Sign Language with AI-powered feedback and real-time practice sessions.
              Join thousands of learners breaking barriers.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 space-y-4"
          >
            {[
              { icon: '🎯', text: 'AI-powered real-time feedback' },
              { icon: '📚', text: '100+ interactive lessons' },
              { icon: '🌍', text: 'Join 10,000+ learners worldwide' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium text-white">{feature.text}</span>
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
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
                <HandMetal className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">
                SignBridge AI
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white lg:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{subtitle}</p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

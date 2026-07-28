'use client';

import Link from 'next/link';
import { BookOpen, Video, MessageSquare, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description:
      'Follow organized lessons from basic to advanced Indian Sign Language with AI-guided progression.',
    gradient: 'from-primary-500/10 to-primary-500/5',
  },
  {
    icon: Video,
    title: 'AI Practice',
    description:
      'Get real-time feedback on your sign language with computer vision and pose estimation AI.',
    gradient: 'from-secondary-400/10 to-secondary-400/5',
  },
  {
    icon: MessageSquare,
    title: 'Live Translation',
    description:
      'Translate between text, speech, and sign language in real-time with our PoseTransformer model.',
    gradient: 'from-primary-500/10 to-secondary-400/10',
  },
];

const steps = [
  {
    number: '01',
    title: 'Learn',
    description: 'Start with structured ISL lessons tailored to your level.',
    icon: BookOpen,
  },
  {
    number: '02',
    title: 'Practice',
    description: 'Use your webcam to practice signs with real-time AI feedback.',
    icon: Video,
  },
  {
    number: '03',
    title: 'Communicate',
    description: 'Translate and communicate seamlessly with the deaf community.',
    icon: MessageSquare,
  },
];

const stats = [
  { value: '10K+', label: 'Active Learners' },
  { value: '100+', label: 'ISL Lessons' },
  { value: '50K+', label: 'Translations Made' },
  { value: '95%', label: 'Accuracy Rate' },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col bg-surface-50">
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[12px] focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-surface-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText priority />
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors px-4 py-2.5"
                >
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="main-content"
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:py-32"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary-500/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary-400/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand-soft px-4 py-2 text-sm font-semibold text-surface-700">
            <Sparkles className="h-4 w-4 text-primary-500" />
            AI-Powered Sign Language Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-surface-900 sm:text-6xl lg:text-7xl">
            Breaking Communication <span className="gradient-text">Barriers</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-500 sm:text-xl">
            Learn Indian Sign Language with AI-powered feedback and real-time practice sessions.
            Connect with the deaf community through technology.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary flex items-center gap-2.5 text-base"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Learning'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/learn" className="btn-secondary flex items-center gap-2 text-base">
              Explore Features
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              Everything you need to learn ISL
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              Powerful AI tools to help you master Indian Sign Language
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-card bg-surface-50 p-8 transition-all duration-300 hover:bg-white hover:shadow-card-hover border border-transparent hover:border-surface-200"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br ${feature.gradient} transition-all group-hover:scale-110`}
                >
                  <feature.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-surface-900">{feature.title}</h3>
                <p className="mt-3 text-surface-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              Three simple steps to start communicating
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-bg text-surface-900 shadow-glow">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-6 text-5xl font-bold gradient-text opacity-30">
                  {step.number}
                </div>
                <h3 className="mt-2 text-xl font-bold text-surface-900">{step.title}</h3>
                <p className="mt-3 text-surface-500 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="absolute left-[60%] top-8 hidden md:block">
                    <ChevronRight className="h-6 w-6 text-surface-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold gradient-text sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-surface-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-card gradient-bg p-12 text-center shadow-glow sm:p-16"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-secondary-400/20 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                Ready to break barriers?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-surface-800/70 text-lg">
                Join thousands of learners mastering Indian Sign Language with AI-powered tools.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 rounded-[18px] bg-surface-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-surface-800 hover:shadow-xl hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Logo size="xs" />
              <span className="text-sm font-bold text-surface-900">SignBridge AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-surface-500">
              <Link href="/login" className="hover:text-surface-900 transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-surface-900 transition-colors">
                Register
              </Link>
              <Link href="/learn" className="hover:text-surface-900 transition-colors">
                Features
              </Link>
            </div>
            <p className="text-sm text-surface-500">
              &copy; {new Date().getFullYear()} SignBridge AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

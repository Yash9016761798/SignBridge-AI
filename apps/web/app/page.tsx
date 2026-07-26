'use client';

import Link from 'next/link';
import { HandMetal, BookOpen, Video, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <HandMetal className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SignBridge AI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Breaking Communication{' '}
          <span className="text-primary-600">Barriers</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Learn Indian Sign Language with AI-powered feedback and real-time practice sessions.
          Connect with the deaf community through technology.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Learning'}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/learn"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Explore Features
          </Link>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything you need to learn ISL
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-8">
              <BookOpen className="h-10 w-10 text-primary-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Structured Learning</h3>
              <p className="mt-2 text-gray-600">
                Follow organized lessons from basic to advanced Indian Sign Language.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-8">
              <Video className="h-10 w-10 text-secondary-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">AI Practice</h3>
              <p className="mt-2 text-gray-600">
                Get real-time feedback on your sign language with computer vision AI.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-8">
              <MessageSquare className="h-10 w-10 text-accent-600" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Live Translation</h3>
              <p className="mt-2 text-gray-600">
                Translate between text, speech, and sign language in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} SignBridge AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 dark:bg-surface-950">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
            <SearchX className="h-10 w-10 text-surface-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Page Not Found</h1>
        <p className="mt-3 max-w-md text-surface-600 dark:text-surface-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
          back on track.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-[14px] border border-surface-300 bg-white px-6 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}

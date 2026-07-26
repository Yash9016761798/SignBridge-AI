'use client';

import Link from 'next/link';
import { ServerCrash, ArrowLeft, Home } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <ServerCrash className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Server Error</h1>
        <p className="mt-3 max-w-md text-gray-600">
          Something went wrong on our end. Our team has been notified and is working on a fix.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}

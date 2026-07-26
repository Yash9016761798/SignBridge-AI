'use client';

import Link from 'next/link';
import { HandMetal, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl font-bold text-red-600">401</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Unauthorized Access</h1>
        <p className="mt-3 max-w-md text-gray-600">
          You don&apos;t have permission to access this page. Please sign in with an authorized account.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <HandMetal className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}

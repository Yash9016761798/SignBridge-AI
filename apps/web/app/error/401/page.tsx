'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/brand/Logo';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-50 dark:bg-[#0D0D0D] px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="xl" priority />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Unauthorized Access</h1>
        <p className="mt-3 max-w-md text-surface-600 dark:text-surface-400">
          You don&apos;t have permission to access this page. Please sign in with an authorized
          account.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            Sign In
          </Link>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}

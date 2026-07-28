'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Back to sign in
        </Link>
      </p>
    </Suspense>
  );
}

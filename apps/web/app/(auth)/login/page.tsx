'use client';

import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Create an account
        </Link>
      </p>
    </>
  );
}

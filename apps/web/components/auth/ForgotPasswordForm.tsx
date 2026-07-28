'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      await forgotPassword(data.email);
      setShowSuccess(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
        <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
          Check your email
        </h3>
        <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
          We&apos;ve sent a password reset link to your email address. Please check your inbox and
          follow the instructions.
        </p>
        <p className="mt-4 text-sm text-surface-500">
          Didn&apos;t receive the email?{' '}
          <button
            onClick={() => setShowSuccess(false)}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-[14px] bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
          {error}
        </div>
      )}

      <p className="text-sm text-surface-600 dark:text-surface-400">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          Email address
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`mt-1 block w-full rounded-[14px] border px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-surface-900 dark:text-white dark:border-surface-700 ${
            errors.email ? 'border-danger-500' : 'border-surface-300'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-danger-500">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-[14px] bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          'Send reset link'
        )}
      </button>
    </form>
  );
}

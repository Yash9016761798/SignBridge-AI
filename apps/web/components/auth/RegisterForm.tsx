'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import PasswordField from './PasswordField';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-[16px] border border-danger-100 bg-danger-50 p-3 text-sm font-medium text-danger-600">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="rounded-[16px] border border-success-100 bg-success-50 p-3 text-sm font-medium text-surface-700 dark:text-surface-300">
          Account created successfully! Redirecting to login...
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            First name
          </label>
          <input
            {...register('firstName')}
            type="text"
            autoComplete="given-name"
            placeholder="John"
            className={`mt-1 block w-full rounded-[18px] border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500 ${
              errors.firstName ? 'border-danger-500' : 'border-surface-200 dark:border-surface-700'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-danger-500">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            Last name
          </label>
          <input
            {...register('lastName')}
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            className={`mt-1 block w-full rounded-[18px] border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500 ${
              errors.lastName ? 'border-danger-500' : 'border-surface-200 dark:border-surface-700'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-danger-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

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
          className={`mt-1 block w-full rounded-[18px] border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500 ${
            errors.email ? 'border-danger-500' : 'border-surface-200 dark:border-surface-700'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-danger-500">{errors.email.message}</p>}
      </div>

      <PasswordField
        id="password"
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="flex items-start">
        <input
          {...register('terms')}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
        />
        <label className="ml-2 text-sm text-surface-600 dark:text-surface-400">
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.terms && <p className="text-sm text-danger-500">{errors.terms.message}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary flex w-full justify-center rounded-[18px] px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
}

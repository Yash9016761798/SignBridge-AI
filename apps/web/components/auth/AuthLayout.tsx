'use client';

import React from 'react';
import Link from 'next/link';
import { HandMetal } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <HandMetal className="h-12 w-12" />
            <span className="text-3xl font-bold">SignBridge AI</span>
          </Link>
          <h2 className="text-4xl font-bold mb-4">Breaking Communication Barriers</h2>
          <p className="text-lg text-primary-100">
            Learn Indian Sign Language with AI-powered feedback and real-time practice sessions.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <HandMetal className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold">SignBridge AI</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-gray-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

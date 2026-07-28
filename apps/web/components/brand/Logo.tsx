'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: 24,
  sm: 38,
  md: 48,
  lg: 56,
  xl: 72,
  full: 88,
};

const textSizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  full: 'text-2xl',
};

export default function Logo({
  size = 'md',
  showText = false,
  className = '',
  priority = false,
}: LogoProps) {
  const px = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: px, height: px }}
      >
        <Image
          src="/logo.png"
          alt="SignBridge AI"
          width={px * 2}
          height={px * 2}
          priority={priority}
          className="h-full w-full object-cover"
          sizes={`${px}px`}
        />
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight text-surface-900 dark:text-white ${textSizeMap[size]}`}
        >
          SignBridge AI
        </span>
      )}
    </div>
  );
}

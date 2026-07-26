'use client';

import React from 'react';

interface WelcomeBannerProps {
  firstName: string;
  role: string;
  organization?: string;
  lastLogin?: string;
  className?: string;
}

export default function WelcomeBanner({
  firstName,
  role,
  organization,
  lastLogin,
  className = '',
}: WelcomeBannerProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={`rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white ${className}`}>
      <h2 className="text-2xl font-bold">
        {greeting()}, {firstName}!
      </h2>
      <p className="mt-1 text-primary-100">
        Welcome back to your dashboard.
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="rounded-lg bg-white/10 px-3 py-1.5">
          <span className="text-primary-200">Role: </span>
          <span className="font-medium">{role}</span>
        </div>
        {organization && (
          <div className="rounded-lg bg-white/10 px-3 py-1.5">
            <span className="text-primary-200">Organization: </span>
            <span className="font-medium">{organization}</span>
          </div>
        )}
        {lastLogin && (
          <div className="rounded-lg bg-white/10 px-3 py-1.5">
            <span className="text-primary-200">Last login: </span>
            <span className="font-medium">{lastLogin}</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi } from '@/lib/learning-api';
import type { Certificate } from '@/types/learning';
import { Award, Copy, Check } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    learningApi
      .getMyCertificates()
      .then(setCertificates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-10 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-56 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="View and verify your course completion certificates"
        icon={Award}
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-card border border-surface-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lg dark:border-surface-700 dark:bg-surface-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-secondary-50 dark:bg-secondary-500/10">
                  <Award className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                </div>
                <DifficultyBadge difficulty={cert.course.difficulty} />
              </div>
              <h3 className="mt-3 font-semibold text-surface-900 dark:text-white">
                {cert.course.title}
              </h3>
              <p className="mt-1 text-xs text-surface-500">
                Issued {new Date(cert.issuedDate).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 truncate rounded-[10px] bg-surface-50 px-2.5 py-1.5 font-mono text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-400">
                  {cert.verificationCode}
                </code>
                <button
                  onClick={() => handleCopyCode(cert.verificationCode)}
                  className="rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                  title="Copy verification code"
                  aria-label="Copy verification code"
                >
                  {copied === cert.verificationCode ? (
                    <Check className="h-4 w-4 text-success-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

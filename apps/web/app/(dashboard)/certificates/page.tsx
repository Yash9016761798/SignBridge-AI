'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi } from '@/lib/learning-api';
import type { Certificate } from '@/types/learning';
import { Award, ExternalLink, Copy, Check } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    learningApi.getMyCertificates()
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
        <SkeletonLoader className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonLoader key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Certificates" description="View and verify your course completion certificates" />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <Award className="h-8 w-8 text-yellow-500" />
                <DifficultyBadge difficulty={cert.course.difficulty} />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{cert.course.title}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Issued {new Date(cert.issuedDate).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">{cert.verificationCode}</code>
                <button onClick={() => handleCopyCode(cert.verificationCode)} className="rounded p-1 text-gray-400 hover:text-gray-600" title="Copy verification code">
                  {copied === cert.verificationCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import GenericModal from './GenericModal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
    warning: 'bg-warning-500 hover:bg-warning-600 text-surface-900',
    info: 'bg-info-500 hover:bg-info-600 text-surface-900',
  };

  const iconBg = {
    danger: 'bg-danger-50 dark:bg-danger-500/10',
    warning: 'bg-warning-50 dark:bg-warning-500/10',
    info: 'bg-info-50 dark:bg-info-500/10',
  };

  const iconColor = {
    danger: 'text-danger-500',
    warning: 'text-warning-600',
    info: 'text-info-600',
  };

  return (
    <GenericModal open={open} onClose={onClose} title={title}>
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBg[variant]}`}
        >
          <AlertTriangle className={`h-5 w-5 ${iconColor[variant]}`} aria-hidden="true" />
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="min-h-[44px] rounded-[12px] border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
        >
          {cancelLabel}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`min-h-[44px] rounded-[12px] px-4 py-2 text-sm font-medium transition-colors ${variantStyles[variant]}`}
        >
          {confirmLabel}
        </button>
      </div>
    </GenericModal>
  );
}

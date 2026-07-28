'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Inbox,
} from 'lucide-react';
import { useNotificationStore, type Notification } from '@/stores/notification-store';
import PageHeader from '@/components/dashboard/PageHeader';

const typeConfig: Record<Notification['type'], { icon: React.ElementType; color: string }> = {
  info: { icon: Info, color: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400' },
  success: {
    icon: CheckCircle2,
    color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400',
  },
  achievement: {
    icon: Trophy,
    color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400',
  },
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        icon={Bell}
        action={
          notifications.length > 0 ? (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="btn-secondary inline-flex items-center gap-2 text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-card bg-white py-16 shadow-card dark:bg-surface-900"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
            <Inbox className="h-8 w-8 text-surface-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-surface-900 dark:text-white">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-surface-500">
            You&apos;re all caught up! New notifications will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`group flex items-start gap-4 rounded-card border p-4 shadow-card transition-all dark:bg-surface-900 ${
                    notification.read
                      ? 'border-surface-200 bg-white dark:border-surface-800'
                      : 'border-primary-200 bg-primary-50/30 dark:border-primary-800/30 dark:bg-primary-900/10'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary-500" />
                        )}
                      </h4>
                      <span className="flex-shrink-0 text-xs text-surface-400">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-surface-600 dark:text-surface-400">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-[8px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-[8px] p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 dark:hover:text-danger-400"
                      aria-label="Delete notification"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

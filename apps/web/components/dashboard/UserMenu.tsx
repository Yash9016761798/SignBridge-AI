'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, close]);

  const handleLogout = async () => {
    close();
    await logout();
    router.push('/login');
  };

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-[12px] p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-sm font-medium text-white dark:bg-primary-600">
          {initials}
        </div>
        <span className="hidden text-sm font-medium text-surface-700 dark:text-surface-300 md:block">
          {user?.firstName || 'User'}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-surface-500 md:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[18px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900"
            role="menu"
          >
            <div className="border-b border-surface-100 px-4 py-3 dark:border-surface-800">
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{user?.email}</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => navigate('/profile')}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                role="menuitem"
              >
                <User className="h-4 w-4" />
                Profile
              </button>

              <button
                onClick={() => navigate('/notifications')}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                role="menuitem"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                role="menuitem"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <button
                onClick={() => navigate('/help')}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                role="menuitem"
              >
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </button>
            </div>

            <div className="border-t border-surface-100 dark:border-surface-800" />

            <div className="py-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

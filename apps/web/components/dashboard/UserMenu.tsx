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
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(
        menuItemsRef.current.indexOf(e.target as HTMLButtonElement) + 1,
        menuItemsRef.current.length - 1,
      );
      menuItemsRef.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(
        menuItemsRef.current.indexOf(e.target as HTMLButtonElement) - 1,
        0,
      );
      menuItemsRef.current[prevIndex]?.focus();
    }
  }, []);

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
        className="flex items-center gap-2 rounded-[12px] p-1.5 min-h-[44px] min-w-[44px] justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-sm font-medium text-white dark:bg-primary-600">
          {initials}
        </div>
        <span className="hidden text-sm font-medium text-surface-700 dark:text-surface-300 md:block">
          {user?.firstName || 'User'}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-surface-500 md:block transition-transform ${open ? 'rotate-180' : ''}`}
        />
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
            aria-orientation="vertical"
            onKeyDown={handleKeyDown}
          >
            <div className="border-b border-surface-100 px-4 py-3 dark:border-surface-800">
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{user?.email}</p>
            </div>

            <div className="py-1">
              {[
                { icon: User, label: 'Profile', href: '/profile' },
                { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
                { icon: Settings, label: 'Settings', href: '/settings' },
                { icon: HelpCircle, label: 'Help & Support', href: '/help' },
              ].map((item, index) => (
                <button
                  key={item.href}
                  ref={(el) => {
                    menuItemsRef.current[index] = el;
                  }}
                  onClick={() => navigate(item.href)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-surface-700 transition-colors hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800"
                  role="menuitem"
                  tabIndex={-1}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-surface-100 dark:border-surface-800" />

            <div className="py-1">
              <button
                ref={(el) => {
                  menuItemsRef.current[4] = el;
                }}
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10"
                role="menuitem"
                tabIndex={-1}
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

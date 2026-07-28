'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, ChevronRight, Command } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useNotificationStore } from '@/stores/notification-store';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobileSidebar } = useUIStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 px-4 backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-950/80 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="rounded-[12px] p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav
          className="hidden items-center gap-1.5 text-sm text-surface-500 md:flex"
          aria-label="Breadcrumb"
        >
          <Link
            href="/dashboard"
            className="rounded-[10px] px-2 py-1 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          >
            Home
          </Link>
          {pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

            return (
              <React.Fragment key={href}>
                <ChevronRight className="h-3.5 w-3.5 text-surface-300" />
                {isLast ? (
                  <span className="rounded-[10px] bg-surface-100 px-2 py-1 font-semibold text-surface-900 dark:bg-surface-800 dark:text-surface-100">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="rounded-[10px] px-2 py-1 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="flex items-center gap-2 rounded-[14px] border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-500 transition-all hover:border-surface-300 hover:bg-surface-100 hover:text-surface-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:border-surface-600 dark:hover:bg-surface-700"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search...</span>
          <kbd className="hidden rounded-[8px] border border-surface-200 bg-white px-1.5 py-0.5 text-2xs font-semibold text-surface-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 lg:inline">
            <Command className="inline h-3 w-3" />K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative rounded-[12px] p-2.5 text-surface-500 transition-all hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-surface-950">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}

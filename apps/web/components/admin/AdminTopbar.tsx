'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Search, Menu, ChevronRight, Command, ShieldCheck, Activity } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useNotificationStore } from '@/stores/notification-store';
import ThemeToggle from '@/components/dashboard/ThemeToggle';
import UserMenu from '@/components/dashboard/UserMenu';

const adminBreadcrumbs: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Control Center',
  users: 'Users',
  courses: 'Courses',
  dictionary: 'Dictionary',
  ai: 'AI Operations',
  analytics: 'Analytics',
  settings: 'Settings',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobileSidebar } = useUIStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <header
      className="flex h-[76px] items-center justify-between border-b border-black/5 bg-[#FAF8F6]/80 px-4 backdrop-blur-xl lg:px-8"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] p-2 text-gray-700 transition-colors hover:bg-black/5 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live Ecosystem Status Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#111111] px-3.5 py-1.5 text-2xs font-extrabold text-white shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#B8E6C3] animate-pulse" />
          <span className="tracking-wide">● Live Ecosystem</span>
          <span className="text-[#E9A8C9] border-l border-white/20 pl-2">v3.4.2-enterprise</span>
        </div>

        {/* Breadcrumb */}
        <nav
          className="hidden items-center gap-1 text-xs text-gray-500 font-bold md:flex"
          aria-label="Breadcrumb"
        >
          <Link
            href="/admin/dashboard"
            className="rounded-[10px] px-2 py-1 transition-colors hover:bg-black/5 hover:text-[#111111]"
          >
            Admin
          </Link>
          {pathSegments.slice(1).map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 2).join('/');
            const isLast = index === pathSegments.length - 2;
            const label =
              adminBreadcrumbs[segment] ||
              segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

            return (
              <React.Fragment key={href}>
                <ChevronRight className="h-3 w-3 text-gray-400" aria-hidden="true" />
                {isLast ? (
                  <span
                    className="rounded-[8px] bg-black/5 px-2 py-1 font-extrabold text-[#111111]"
                    aria-current="page"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="rounded-[10px] px-2 py-1 transition-colors hover:bg-black/5 hover:text-[#111111]"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Search */}
        <button
          className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:border-black/20 hover:text-[#111111] min-h-[42px]"
          aria-label="Global Search"
        >
          <Search className="h-3.5 w-3.5 text-gray-500" />
          <span className="hidden lg:inline">Search platform...</span>
          <kbd className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-2xs font-extrabold text-gray-600 lg:inline border border-black/5">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full bg-white border border-black/5 p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-100"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4 text-[#111111]" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E9A8C9] px-1 text-[10px] font-extrabold text-[#111111] ring-2 ring-white"
              aria-hidden="true"
            >
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

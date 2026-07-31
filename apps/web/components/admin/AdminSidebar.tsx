'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeft, Shield } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { navigationByRole, type UserRole, type NavItem } from '@/config/navigation';

function AdminNavItem({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-surface-400 hover:bg-white/[0.06] hover:text-surface-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="admin-sidebar-active"
          className="absolute inset-0 rounded-[14px] bg-white/10"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        />
      )}
      <item.icon
        className={`relative z-10 h-[18px] w-[18px] flex-shrink-0 transition-colors ${
          isActive ? 'text-white' : 'text-surface-400 group-hover:text-surface-300'
        }`}
      />
      {!collapsed && <span className="relative z-10 flex-1">{item.label}</span>}
    </Link>
  );
}

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const role: UserRole = (user?.role as UserRole) || 'ADMIN';
  const navGroups = navigationByRole[role] || navigationByRole.ADMIN;

  return (
    <aside
      className={`flex flex-col bg-surface-950 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
      aria-label="Admin sidebar navigation"
    >
      {/* Logo + Admin Badge */}
      <div
        className={`flex h-16 items-center border-b border-white/[0.06] px-4 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!sidebarCollapsed ? (
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Logo size="md" priority />
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white tracking-tight">SignBridge</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-surface-400">
                Admin Panel
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/admin/dashboard" className="flex items-center justify-center">
            <Logo size="md" priority />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[10px] p-2 text-surface-400 transition-colors hover:bg-white/[0.06] hover:text-surface-300 ${
            sidebarCollapsed ? 'mx-auto mt-2' : ''
          }`}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Admin Badge */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-4 mb-2">
          <div className="flex items-center gap-2 rounded-[12px] bg-white/5 px-3 py-2">
            <Shield className="h-4 w-4 text-primary-400" />
            <span className="text-xs font-semibold text-primary-400">Administrator</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {sidebarCollapsed ? (
          <div className="space-y-2">
            {navGroups
              .flatMap((g) => g.items)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center rounded-[14px] min-h-[44px] min-w-[44px] p-2.5 text-surface-400 transition-all hover:bg-white/[0.06] hover:text-surface-200"
                  aria-label={item.label}
                  title={item.label}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                </Link>
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-surface-400">
                  {group.label}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((navItem) => (
                    <AdminNavItem key={navItem.href} item={navItem} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Back to App Link */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-surface-400 transition-all hover:bg-white/[0.06] hover:text-surface-200"
          >
            <span className="text-[18px]">←</span>
            <span>Back to App</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

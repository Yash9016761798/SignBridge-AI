'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { useUIStore } from '@/stores/ui-store';
import { navigationByRole, type NavItem } from '@/config/navigation';

function AdminNavItem({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));

  if (collapsed) {
    return (
      <Link
        href={item.href}
        className={`group relative flex items-center justify-center rounded-[14px] min-h-[44px] min-w-[44px] p-2.5 transition-all duration-200 ${
          isActive
            ? 'bg-[#2A2A2D] text-white shadow-sm'
            : 'text-[#A1A1AA] hover:bg-[#242427] hover:text-white'
        }`}
        aria-label={item.label}
        title={item.label}
      >
        {isActive && (
          <span className="absolute left-1 w-1.5 h-5 rounded-full bg-[#E9A8C9] shadow-sm" />
        )}
        <item.icon
          className={`h-[18px] w-[18px] transition-colors ${
            isActive ? 'text-[#E9A8C9]' : 'text-[#A1A1AA] group-hover:text-white'
          }`}
        />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm transition-all duration-200 ${
        isActive
          ? 'bg-[#2A2A2D] text-white font-bold shadow-sm'
          : 'text-[#A1A1AA] hover:bg-[#242427] hover:text-white font-medium'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && <span className="w-1.5 h-5 rounded-full bg-[#E9A8C9] shadow-sm flex-shrink-0" />}
      <item.icon
        className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
          isActive ? 'text-[#E9A8C9]' : 'text-[#A1A1AA] group-hover:text-white'
        }`}
      />
      <span className="flex-1 tracking-tight truncate">{item.label}</span>
    </Link>
  );
}

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navGroups = navigationByRole.ADMIN;

  return (
    <aside
      className={`flex flex-col bg-[#18181A] text-white rounded-[28px] border border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      } ${className}`}
      aria-label="Admin sidebar navigation"
    >
      {/* Header */}
      {!sidebarCollapsed ? (
        <div className="flex h-20 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E9A8C9] to-[#F6D365] text-[#111111] shadow-sm flex-shrink-0">
              <Logo size="sm" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-extrabold text-white tracking-tight leading-tight">
                SignBridge AI
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#E9A8C9]">
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#28282B] text-gray-300 hover:bg-[#323236] hover:text-white transition-colors"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Collapsed Header Stack (Reference Image Match) */
        <div className="flex flex-col items-center pt-4 pb-2 px-2 space-y-3 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E9A8C9] to-[#F6D365] text-[#111111] shadow-sm">
              <Logo size="sm" priority />
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#28282B] text-gray-300 hover:bg-[#323236] hover:text-white transition-colors"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Admin Badge */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-2 mb-1">
          <div className="flex items-center gap-2 rounded-[14px] bg-[#242427] border border-white/5 px-3 py-2">
            <Shield className="h-4 w-4 text-[#E9A8C9]" />
            <span className="text-xs font-bold text-[#E9A8C9]">Administrator</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar space-y-6">
        {sidebarCollapsed ? (
          <div className="space-y-2">
            {navGroups
              .flatMap((g) => g.items)
              .map((item) => (
                <AdminNavItem key={`${item.label}-${item.href}`} item={item} collapsed />
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#747478]">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((navItem) => (
                    <AdminNavItem key={`${navItem.label}-${navItem.href}`} item={navItem} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Back to App Link */}
      {!sidebarCollapsed ? (
        <div className="p-3 mt-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-[20px] bg-[#242427] p-3 border border-white/5 shadow-sm text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-[18px] text-[#F6D365]">←</span>
            <span>Return to Learner App</span>
          </Link>
        </div>
      ) : (
        <div className="p-3 mt-auto flex justify-center">
          <Link href="/dashboard" title="Return to Learner App">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242427] text-[#F6D365] font-extrabold text-base border border-white/5">
              ←
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

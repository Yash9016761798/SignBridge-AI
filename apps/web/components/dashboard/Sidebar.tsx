'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  navigationByRole,
  helpNavigation,
  type NavGroup,
  type NavItem,
  type UserRole,
} from '@/config/navigation';

function NavItemComponent({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

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

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`group flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-[#2A2A2D] text-white font-bold shadow-sm'
              : 'text-[#A1A1AA] hover:bg-[#242427] hover:text-white'
          }`}
          aria-expanded={expanded}
        >
          {isActive && (
            <span className="w-1.5 h-5 rounded-full bg-[#E9A8C9] shadow-sm flex-shrink-0" />
          )}
          <item.icon
            className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
              isActive ? 'text-[#E9A8C9]' : 'text-[#A1A1AA] group-hover:text-white'
            }`}
          />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                {item.children!.map((child) => (
                  <NavItemComponent key={child.href} item={child} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
      <span className="flex-1 tracking-tight">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-[#E9A8C9] px-2 py-0.5 text-2xs font-extrabold text-[#111111]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroupComponent({ group, collapsed = false }: { group: NavGroup; collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="space-y-2">
        {group.items.map((item) => (
          <NavItemComponent key={item.href} item={item} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#747478]">
        {group.label}
      </h3>
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const role: UserRole = (user?.role as UserRole) || 'LEARNER';
  const navGroups = navigationByRole[role] || navigationByRole.LEARNER;

  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'SB';
  const displayRole = role.charAt(0) + role.slice(1).toLowerCase();

  return (
    <aside
      className={`flex flex-col bg-[#18181A] text-white rounded-[28px] border border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      } ${className}`}
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      {!sidebarCollapsed ? (
        <div className="flex h-20 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E9A8C9] to-[#F6D365] text-[#111111] shadow-sm flex-shrink-0">
              <Logo size="sm" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-extrabold text-white tracking-tight leading-tight">
                SignBridge AI
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8E8E93]">
                AI Platform
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
          <Link href="/dashboard" className="flex items-center justify-center">
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar space-y-6">
        {sidebarCollapsed ? (
          <div className="space-y-2">
            {navGroups
              .flatMap((g) => g.items)
              .map((item) => (
                <NavItemComponent key={item.href} item={item} collapsed />
              ))}
            <div className="border-t border-white/10 pt-2">
              <NavItemComponent item={helpNavigation} collapsed />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {navGroups.map((group) => (
              <NavGroupComponent key={group.label} group={group} />
            ))}
            <div className="border-t border-white/10 pt-4">
              <NavItemComponent item={helpNavigation} />
            </div>
          </div>
        )}
      </nav>

      {/* Footer Profile Block (Reference Match) */}
      {!sidebarCollapsed ? (
        <div className="p-3 mt-auto">
          <div className="flex items-center justify-between rounded-[20px] bg-[#242427] p-3 border border-white/5 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#F6D365] to-[#E9A8C9] text-[#111111] font-extrabold text-sm shadow-sm flex-shrink-0">
                {initials}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {fullName}
                </span>
                <span className="text-xs font-semibold text-[#8E8E93] truncate">
                  {displayRole} Portal
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#8E8E93] hover:bg-white/5 hover:text-white transition-colors flex-shrink-0"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Collapsed Profile Avatar (Reference Image Match) */
        <div className="p-3 mt-auto flex justify-center">
          <div className="rounded-[18px] bg-[#242427] p-2 border border-white/5 shadow-sm flex items-center justify-center">
            <Link href="/settings" title={fullName}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#F6D365] to-[#E9A8C9] text-[#111111] font-extrabold text-sm shadow-sm">
                {initials}
              </div>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

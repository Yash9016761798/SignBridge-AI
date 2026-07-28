'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
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
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-gradient-brand-soft text-white'
              : 'text-surface-400 hover:bg-white/[0.06] hover:text-surface-200'
          }`}
          aria-expanded={expanded}
        >
          <item.icon
            className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
              isActive ? 'text-primary-500' : 'text-surface-400 group-hover:text-surface-300'
            }`}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        <AnimatePresence>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-surface-700/50 pl-3">
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
      className={`group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gradient-brand-soft text-white'
          : 'text-surface-400 hover:bg-white/[0.06] hover:text-surface-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-[14px] bg-gradient-brand-soft"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        />
      )}
      <item.icon
        className={`relative z-10 h-[18px] w-[18px] flex-shrink-0 transition-colors ${
          isActive ? 'text-primary-500' : 'text-surface-400 group-hover:text-surface-300'
        }`}
      />
      {!collapsed && (
        <>
          <span className="relative z-10 flex-1">{item.label}</span>
          {item.badge && (
            <span className="relative z-10 rounded-full bg-gradient-brand px-2 py-0.5 text-2xs font-bold text-surface-900">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function NavGroupComponent({ group, collapsed = false }: { group: NavGroup; collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItemComponent key={item.href} item={item} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-surface-400">
        {group.label}
      </h3>
      <div className="space-y-0.5">
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

  return (
    <aside
      className={`flex flex-col bg-surface-950 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-white/[0.06] px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size="md" priority />
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white tracking-tight">SignBridge</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-surface-400">
                AI Platform
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center">
            <Logo size="md" priority />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`rounded-[10px] p-2 text-surface-400 transition-colors hover:bg-white/[0.06] hover:text-surface-300 ${
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
                  className="flex items-center justify-center rounded-[14px] p-2.5 text-surface-400 transition-all hover:bg-white/[0.06] hover:text-surface-200"
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
              <NavGroupComponent key={group.label} group={group} />
            ))}
            <div className="border-t border-white/[0.06] pt-4">
              <NavItemComponent item={helpNavigation} />
            </div>
          </div>
        )}
      </nav>

      {/* Upgrade Banner */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="rounded-card bg-gradient-brand p-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-secondary-400/20 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-surface-900" />
                <span className="text-sm font-bold text-surface-900">Upgrade to Pro</span>
              </div>
              <p className="text-xs font-medium text-surface-800/70">
                Unlock advanced features and unlimited translations.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

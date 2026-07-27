'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HandMetal, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
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
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950/50 dark:text-primary-400'
              : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200'
          }`}
          aria-expanded={expanded}
        >
          <item.icon
            className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-500' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'}`}
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
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-surface-200 pl-3 dark:border-surface-700">
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
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950/50 dark:text-primary-400'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon
        className={`h-5 w-5 flex-shrink-0 transition-colors ${
          isActive
            ? 'text-primary-500'
            : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
        }`}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-semibold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
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
      <h3 className="mb-2 px-3 text-2xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
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
      className={`flex flex-col border-r border-surface-200 bg-white transition-all duration-300 ease-in-out dark:border-surface-800 dark:bg-surface-900 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      } ${className}`}
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-surface-200 px-4 dark:border-surface-800">
        {!sidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-glow">
              <HandMetal className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-surface-900 dark:text-white">
                SignBridge
              </span>
              <span className="text-2xs font-medium text-surface-400">AI Platform</span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg shadow-glow">
              <HandMetal className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 ${
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
                  className="flex items-center justify-center rounded-xl p-2.5 text-surface-500 transition-all hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
                  aria-label={item.label}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {navGroups.map((group) => (
              <NavGroupComponent key={group.label} group={group} />
            ))}
            <div className="border-t border-surface-200 pt-4 dark:border-surface-800">
              <NavItemComponent item={helpNavigation} />
            </div>
          </div>
        )}
      </nav>

      {/* Upgrade Banner */}
      {!sidebarCollapsed && (
        <div className="border-t border-surface-200 p-4 dark:border-surface-800">
          <div className="rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 p-4 dark:from-primary-500/5 dark:to-secondary-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                Upgrade to Pro
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Unlock advanced features and unlimited translations.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

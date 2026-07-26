'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HandMetal, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { navigationByRole, helpNavigation, type NavGroup, type NavItem, type UserRole } from '@/config/navigation';

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
          aria-expanded={expanded}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {item.children!.map((child) => (
                  <NavItemComponent key={child.href} item={child} depth={depth + 1} />
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
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroupComponent({ group }: { group: NavGroup }) {
  return (
    <div>
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
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

  return (
    <aside
      className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
      aria-label="Sidebar navigation"
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <HandMetal className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SignBridge</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sidebarCollapsed ? (
          <div className="space-y-2">
            {navGroups.flatMap((g) => g.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
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
            <div className="border-t border-gray-200 pt-4">
              <NavItemComponent item={helpNavigation} />
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useUIStore } from '@/stores/ui-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${
          mobileSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

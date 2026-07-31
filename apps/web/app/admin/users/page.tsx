'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Filter,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import SearchBar from '@/components/dashboard/SearchBar';
import Pagination from '@/components/dashboard/Pagination';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import UserViewModal from '@/components/admin/UserViewModal';
import UserEditModal from '@/components/admin/UserEditModal';
import { adminUserApi } from '@/lib/admin-api';
import type { AdminUser, AdminUserRole, AdminUserStatus, AdminUserStats } from '@/types/admin';

const roleLabels: Record<string, string> = {
  LEARNER: 'Student',
  TEACHER: 'Teacher',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
  HOSPITAL: 'Hospital',
  NGO: 'NGO',
  GOVERNMENT: 'Government',
};

const roleBadgeColor: Record<string, string> = {
  LEARNER: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-500',
  TEACHER: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  INSTRUCTOR: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  ADMIN: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-500',
  HOSPITAL: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  NGO: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-600',
  GOVERNMENT: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
};

const statusBadgeColor: Record<string, string> = {
  active: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  inactive: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  suspended: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

const statusIcon: Record<string, React.ElementType> = {
  active: CheckCircle2,
  inactive: AlertTriangle,
  suspended: AlertTriangle,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    userId: string;
    userName: string;
  } | null>(null);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.getUsers({
        search: search || undefined,
        role: (roleFilter as AdminUserRole) || undefined,
        status: (statusFilter as AdminUserStatus) || undefined,
        page,
        limit: 10,
      });
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await adminUserApi.getStats();
      setStats(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRoleFilter = (role: AdminUserRole | '') => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleStatusFilter = (status: AdminUserStatus | '') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSuspend = async () => {
    if (!confirmAction) return;
    try {
      await adminUserApi.suspendUser(confirmAction.userId);
      fetchUsers();
      fetchStats();
    } catch {
      // ignore
    }
    setConfirmAction(null);
  };

  const handleActivate = async () => {
    if (!confirmAction) return;
    try {
      await adminUserApi.activateUser(confirmAction.userId);
      fetchUsers();
      fetchStats();
    } catch {
      // ignore
    }
    setConfirmAction(null);
  };

  const handleDelete = async () => {
    if (!confirmAction) return;
    try {
      await adminUserApi.deleteUser(confirmAction.userId);
      fetchUsers();
      fetchStats();
    } catch {
      // ignore
    }
    setConfirmAction(null);
  };

  const handleUserSaved = () => {
    fetchUsers();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all users on the platform"
        icon={Users}
        action={
          <span className="text-sm text-surface-500">{total} total users</span>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Active Users" value={stats.activeUsers} icon={CheckCircle2} />
          <StatCard title="Suspended" value={stats.suspendedUsers} icon={AlertTriangle} />
          <StatCard title="New This Month" value={stats.newUsersThisMonth} icon={Shield} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search users by name or email..."
          />
        </div>

        <div className="flex items-center gap-2" ref={dropdownRef}>
          {/* Role Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
              className={`flex min-h-[44px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                roleFilter
                  ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600'
              }`}
              aria-label="Filter by role"
              aria-expanded={openDropdown === 'role'}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Role</span>
              {roleFilter && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                  {roleLabels[roleFilter]}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'role' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openDropdown === 'role' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900"
                >
                  <div className="py-1">
                    <button
                      onClick={() => { handleRoleFilter(''); setOpenDropdown(null); }}
                      className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                        !roleFilter ? 'bg-surface-50 font-semibold text-surface-900 dark:bg-surface-800 dark:text-white' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800'
                      }`}
                    >
                      All Roles
                    </button>
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { handleRoleFilter(key as AdminUserRole); setOpenDropdown(null); }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                          roleFilter === key ? 'bg-surface-50 font-semibold text-surface-900 dark:bg-surface-800 dark:text-white' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className={`flex min-h-[44px] items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-medium transition-colors ${
                statusFilter
                  ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600'
              }`}
              aria-label="Filter by status"
              aria-expanded={openDropdown === 'status'}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
              {statusFilter && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-2xs font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                  {statusFilter}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openDropdown === 'status' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900"
                >
                  <div className="py-1">
                    {(['', 'active', 'inactive', 'suspended'] as const).map((s) => (
                      <button
                        key={s || 'all'}
                        onClick={() => { handleStatusFilter(s as AdminUserStatus | ''); setOpenDropdown(null); }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm capitalize transition-colors ${
                          statusFilter === s ? 'bg-surface-50 font-semibold text-surface-900 dark:bg-surface-800 dark:text-white' : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800'
                        }`}
                      >
                        {s || 'All Statuses'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader count={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={search || roleFilter || statusFilter ? 'Try adjusting your search or filters.' : 'No users have registered yet.'}
          accentColor="sky"
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-surface-200 dark:border-surface-700">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden md:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden xl:table-cell">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white dark:divide-surface-800 dark:bg-surface-900">
              {users.map((user) => {
                const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
                const StatusIcon = statusIcon[user.status] || CheckCircle2;

                return (
                  <tr key={user.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-surface-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${roleBadgeColor[user.role]}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeColor[user.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500 hidden xl:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500 hidden xl:table-cell">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewUserId(user.id)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                          aria-label={`View ${user.firstName}`}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditUserId(user.id)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                          aria-label={`Edit ${user.firstName}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {user.status === 'suspended' ? (
                          <button
                            onClick={() => setConfirmAction({ type: 'activate', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/10 dark:hover:text-success-500"
                            aria-label={`Activate ${user.firstName}`}
                            title="Activate"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmAction({ type: 'suspend', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-warning-50 hover:text-warning-600 dark:hover:bg-warning-500/10 dark:hover:text-warning-500"
                            aria-label={`Suspend ${user.firstName}`}
                            title="Suspend"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmAction({ type: 'delete', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 dark:hover:text-danger-500"
                          aria-label={`Delete ${user.firstName}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* View Modal */}
      <UserViewModal open={!!viewUserId} onClose={() => setViewUserId(null)} userId={viewUserId} />

      {/* Edit Modal */}
      <UserEditModal
        open={!!editUserId}
        onClose={() => setEditUserId(null)}
        userId={editUserId}
        onSaved={handleUserSaved}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmAction?.type === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleSuspend}
        title="Suspend User"
        message={`Are you sure you want to suspend ${confirmAction?.userName || ''}? They will not be able to access the platform.`}
        confirmLabel="Suspend"
        variant="warning"
      />
      <ConfirmDialog
        open={confirmAction?.type === 'activate'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActivate}
        title="Activate User"
        message={`Are you sure you want to activate ${confirmAction?.userName || ''}? They will regain access to the platform.`}
        confirmLabel="Activate"
        variant="info"
      />
      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${confirmAction?.userName || ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

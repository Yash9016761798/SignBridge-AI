import {
  LayoutDashboard,
  BookOpen,
  Video,
  MessageSquare,
  BookMarked,
  Settings,
  User,
  Award,
  Users,
  Building2,
  Heart,
  Landmark,
  HelpCircle,
  FileText,
  BarChart3,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export type UserRole =
  'LEARNER' | 'INSTRUCTOR' | 'TEACHER' | 'HOSPITAL' | 'NGO' | 'GOVERNMENT' | 'ADMIN';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const learnerNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Learn ISL', href: '/learn', icon: BookOpen },
      { label: 'AI Practice', href: '/practice', icon: Video },
      { label: 'Translation', href: '/translation', icon: MessageSquare },
      { label: 'Dictionary', href: '/dictionary', icon: BookMarked },
    ],
  },
  {
    label: 'Progress',
    items: [
      { label: 'Certificates', href: '/certificates', icon: Award },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

const teacherNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Courses', href: '/my-courses', icon: BookOpen },
      { label: 'Students', href: '/students', icon: Users },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

const hospitalNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Patients', href: '/patients', icon: Heart },
      { label: 'Translation', href: '/translation', icon: MessageSquare },
      { label: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    label: 'Management',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

const ngoNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Beneficiaries', href: '/beneficiaries', icon: Users },
      { label: 'Programs', href: '/programs', icon: BookOpen },
      { label: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    label: 'Management',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

const governmentNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Organizations', href: '/organizations', icon: Building2 },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    label: 'Management',
    items: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },
];

const adminNavigation: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Security', href: '/admin/security', icon: Shield },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const navigationByRole: Record<UserRole, NavGroup[]> = {
  LEARNER: learnerNavigation,
  INSTRUCTOR: teacherNavigation,
  TEACHER: teacherNavigation,
  HOSPITAL: hospitalNavigation,
  NGO: ngoNavigation,
  GOVERNMENT: governmentNavigation,
  ADMIN: adminNavigation,
};

export const helpNavigation: NavItem = {
  label: 'Help & Support',
  href: '/help',
  icon: HelpCircle,
};

export const profileNavigation: NavItem = {
  label: 'Profile',
  href: '/profile',
  icon: User,
};

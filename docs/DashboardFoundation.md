# Dashboard Foundation

## Overview

Phase 4 establishes the reusable dashboard framework that all user roles will share. This includes the responsive layout shell, navigation system, shared components, and error pages. No business logic or role-specific features are implemented yet.

## Architecture

### Directory Structure

```
apps/web/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard group layout
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard home page
│   └── error/
│       ├── 401/page.tsx            # Unauthorized page
│       ├── 403/page.tsx            # Forbidden page
│       ├── 404/page.tsx            # Not found page
│       └── 500/page.tsx            # Server error page
├── components/
│   └── dashboard/
│       ├── DashboardLayout.tsx      # Main layout wrapper
│       ├── Sidebar.tsx             # Responsive sidebar
│       ├── TopNavbar.tsx           # Top navigation bar
│       ├── UserMenu.tsx            # User dropdown menu
│       ├── PageHeader.tsx          # Page title + actions
│       ├── DashboardCard.tsx       # Reusable card wrapper
│       ├── StatCard.tsx            # Statistics display card
│       ├── DataTable.tsx           # Generic data table
│       ├── EmptyState.tsx          # Empty state placeholder
│       ├── SkeletonLoader.tsx      # Loading skeleton
│       ├── LoadingOverlay.tsx      # Loading spinner overlay
│       ├── SearchBar.tsx           # Search input
│       ├── NotificationBell.tsx    # Notification icon
│       ├── GenericModal.tsx        # Reusable modal
│       ├── ConfirmDialog.tsx       # Confirmation dialog
│       ├── Pagination.tsx          # Pagination controls
│       ├── DashboardTabs.tsx       # Tab navigation
│       ├── QuickActionCard.tsx     # Quick action card
│       └── WelcomeBanner.tsx       # Welcome banner
├── config/
│   └── navigation.ts              # Navigation configuration
├── stores/
│   └── ui-store.ts                # UI state management
└── types/
    └── auth.ts                    # Updated User type
```

### Layout Architecture

```
┌─────────────────────────────────────────────────┐
│                  Sidebar                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Logo + Collapse Button                    │  │
│  ├──────────────────────────────────────────┤  │
│  │ Nav Group: Main                          │  │
│  │   Dashboard                              │  │
│  │   Learn ISL                              │  │
│  │   AI Practice                            │  │
│  │   Translation                            │  │
│  │   Dictionary                             │  │
│  ├──────────────────────────────────────────┤  │
│  │ Nav Group: Progress                      │  │
│  │   Certificates                           │  │
│  │   Settings                               │  │
│  ├──────────────────────────────────────────┤  │
│  │ Help & Support                           │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Top Navbar                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Breadcrumbs | Search | Notifications |    │  │
│  │               User Menu                  │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Main Content Area                              │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │           {children}                     │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Navigation System

Navigation is configuration-driven via `config/navigation.ts`:

- **Config-driven**: All menu items defined in a single config file
- **Role-based**: Different navigation per user role (LEARNER, TEACHER, HOSPITAL, NGO, GOVERNMENT, ADMIN)
- **Expandable groups**: Menu items organized into collapsible groups
- **Active route highlighting**: Current route highlighted automatically
- **Collapsed mode**: Icon-only sidebar when collapsed

### Shared Components

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Main layout wrapper (sidebar + navbar + content) |
| `Sidebar` | Responsive sidebar with navigation |
| `TopNavbar` | Top bar with breadcrumbs, search, notifications, user menu |
| `PageHeader` | Page title with optional description and action buttons |
| `DashboardCard` | Reusable card with title, icon, and content |
| `StatCard` | Statistics display with value, icon, and change indicator |
| `DataTable` | Generic table with columns, data, and empty state |
| `EmptyState` | Empty state with icon, title, description, and action |
| `SkeletonLoader` | Loading skeleton placeholder |
| `LoadingOverlay` | Loading spinner with message |
| `SearchBar` | Search input with icon |
| `UserMenu` | User dropdown with profile, settings, sign out |
| `NotificationBell` | Notification icon with badge count |
| `GenericModal` | Reusable modal dialog |
| `ConfirmDialog` | Confirmation dialog with danger/warning/info variants |
| `Pagination` | Page navigation controls |
| `DashboardTabs` | Tab navigation with content panels |
| `QuickActionCard` | Quick action card with icon and arrow |
| `WelcomeBanner` | Welcome message with user info |

### State Management

**Zustand UI Store** (`stores/ui-store.ts`):
- `sidebarCollapsed`: Boolean for sidebar collapse state
- `mobileSidebarOpen`: Boolean for mobile drawer state
- `toggleSidebar()`: Toggle sidebar collapse
- `setSidebarCollapsed()`: Set sidebar state
- `toggleMobileSidebar()`: Toggle mobile drawer
- `setMobileSidebarOpen()`: Set mobile drawer state

### Route Protection

- `ProtectedRoute` component checks Firebase auth state via `onAuthStateChanged`
- Dashboard layout uses `ProtectedRoute` wrapper
- Unauthenticated users redirected to `/login`

### Error Pages

| Page | Purpose |
|------|---------|
| `/error/401` | Unauthorized - sign in required |
| `/error/403` | Forbidden - insufficient permissions |
| `/error/404` | Not found - page doesn't exist |
| `/error/500` | Server error - something went wrong |

### Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management on modals
- Screen reader compatible
- High contrast colors (WCAG 2.2 AA)

### Responsive Design

- **Mobile** (< 768px): Sidebar hidden, hamburger menu, full-width content
- **Tablet** (768px - 1024px): Sidebar collapsible, two-column layouts
- **Desktop** (> 1024px): Full sidebar, multi-column layouts
- **Large Desktop** (> 1280px): Wider content with comfortable margins

# Frontend Authentication

## Overview

SignBridge AI uses Firebase Authentication on the client side, with the NestJS backend verifying Firebase ID tokens server-side. The frontend handles user interaction, form validation, and session management through Firebase's SDK.

## Architecture

### Components

```
apps/web/
├── lib/
│   ├── firebase.ts          # Firebase Client SDK initialization
│   └── api.ts               # Axios API client with auth interceptors
├── stores/
│   └── auth-store.ts        # Zustand auth state management
├── providers/
│   └── AuthProvider.tsx      # Root auth provider (onAuthStateChanged)
├── components/auth/
│   ├── AuthLayout.tsx        # Split-screen auth layout
│   ├── LoginForm.tsx         # Email/password login form
│   ├── RegisterForm.tsx      # Registration form
│   ├── ForgotPasswordForm.tsx # Password reset request form
│   ├── ResetPasswordForm.tsx  # Password reset form
│   ├── PasswordField.tsx     # Reusable password input with toggle
│   ├── ProtectedRoute.tsx    # Client-side route protection
│   └── LoadingScreen.tsx     # Loading spinner
├── types/
│   └── auth.ts              # TypeScript interfaces
├── middleware.ts             # Next.js middleware for route protection
└── app/(auth)/
    ├── layout.tsx            # Auth pages layout
    ├── login/page.tsx        # Login page
    ├── register/page.tsx     # Register page
    ├── forgot-password/page.tsx
    └── reset-password/page.tsx
```

### Authentication Flow

1. **Login**: User enters credentials → Firebase `signInWithEmailAndPassword` → Get ID token → Send `{ idToken }` to `POST /api/v1/auth/login` → Backend verifies token, syncs user in PostgreSQL → Store user in Zustand
2. **Register**: User fills form → Firebase `createUserWithEmailAndPassword` → Get ID token → Send `{ idToken }` to `POST /api/v1/auth/login` (backend auto-creates user on first login) → User stored in Zustand
3. **Password Reset**: User enters email → Firebase `sendPasswordResetEmail` → User clicks link → `confirmPasswordReset` with token
4. **Session**: Firebase manages session persistence → `onAuthStateChanged` listener in AuthProvider fetches `GET /api/v1/auth/me` → Updates Zustand store → Axios interceptor attaches token to all API requests
5. **Logout**: `signOut(auth)` → Clear Zustand state → Redirect to login

### Route Protection

- **ProtectedRoute** (`ProtectedRoute.tsx`): Client-side component that checks Firebase auth state via `onAuthStateChanged`, redirects to `/login` if unauthenticated
- **Protected Routes**: `/dashboard`, `/learn`, `/practice`, `/translation`, `/profile`
- **Middleware** (`middleware.ts`): Pass-through middleware (auth handled client-side by ProtectedRoute)

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Form Validation

All forms use `react-hook-form` with `zod` schemas:

- **Login**: email (valid format), password (min 6 chars)
- **Register**: firstName/lastName (min 2 chars), email, password (min 8 chars), confirmPassword, terms (required)
- **Forgot Password**: email
- **Reset Password**: password (min 8 chars), confirmPassword

### API Client

Axios instance (`lib/api.ts`) with:
- **Request interceptor**: Attaches Firebase ID token as `Authorization: Bearer <token>`
- **Response interceptor**: Redirects to `/login` on 401 responses
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`

### State Management

Zustand store (`stores/auth-store.ts`) manages:
- `user`: Current user object (from backend)
- `isLoading`: Loading state for async operations
- `isAuthenticated`: Derived from user presence
- `error`: Error message for display
- Actions: `login`, `register`, `logout`, `forgotPassword`, `resetPassword`, `setUser`, `clearError`

### Dependencies

- `firebase`: Firebase Client SDK
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Zod resolver for react-hook-form
- `zod`: Schema validation
- `zustand`: State management
- `axios`: HTTP client
- `sonner`: Toast notifications
- `lucide-react`: Icons

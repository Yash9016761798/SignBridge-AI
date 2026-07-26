# Authentication Architecture

## Overview

SignBridge AI uses Firebase Authentication as the identity provider. The backend verifies Firebase ID tokens and synchronizes user data with the local PostgreSQL database.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Web/Mobile)                       │
│  1. User signs in with Firebase (Email/Password, Google, etc.)  │
│  2. Receives Firebase ID Token                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NestJS Backend                            │
│  3. Client sends ID Token in Authorization header               │
│  4. FirebaseAuthGuard verifies token with Firebase Admin SDK    │
│  5. Backend loads/creates user in PostgreSQL                    │
│  6. User profile attached to request                            │
│  7. RolesGuard checks role-based permissions                    │
│  8. Controller handles request                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                       │
│  - User records (synced from Firebase)                          │
│  - Role assignments                                             │
│  - Organization membership                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login with Firebase token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| POST | `/api/v1/auth/refresh` | Refresh authentication | Yes |

## User Synchronization

### First Login
1. Firebase token is verified
2. New User record is created in database
3. Default role (LEARNER) is assigned
4. Firebase UID is stored for future lookups

### Subsequent Logins
1. Firebase token is verified
2. Existing User record is loaded
3. Last login timestamp is updated
4. Email verification status is synced

## Role-Based Access Control (RBAC)

### Supported Roles
- **LEARNER**: Basic user with access to courses and practice
- **TEACHER**: Can create and manage courses
- **HOSPITAL**: Hospital organization staff
- **NGO**: Non-profit organization staff
- **GOVERNMENT**: Government organization staff
- **ADMIN**: System administrator

### Using Guards

#### Public Endpoint
```typescript
@Public()
@Get('public-endpoint')
publicEndpoint() {
  return 'This is public';
}
```

#### Authenticated Endpoint
```typescript
@UseGuards(FirebaseAuthGuard)
@Get('protected-endpoint')
protectedEndpoint(@CurrentUser() user: AuthenticatedUser) {
  return `Hello ${user.firstName}`;
}
```

#### Role-Restricted Endpoint
```typescript
@UseGuards(FirebaseAuthGuard)
@Roles('ADMIN', 'TEACHER')
@Get('admin-endpoint')
adminEndpoint() {
  return 'Admin only';
}
```

## Environment Variables

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

## Security Considerations

1. **Token Verification**: All tokens are verified server-side using Firebase Admin SDK
2. **No Password Storage**: Passwords are managed by Firebase Authentication
3. **Role Validation**: Roles are loaded from database, not client-provided tokens
4. **Secure Errors**: Authentication errors don't expose internal details
5. **Development Mode**: Runs without Firebase when credentials not configured

## Development Mode

When Firebase credentials are not configured, the backend runs in development mode:
- Token verification returns mock tokens
- User creation uses mock data
- All endpoints are accessible without real authentication

This allows development without a Firebase project setup.

## File Structure

```
backend/src/
├── auth/
│   ├── auth.controller.ts      # Auth endpoints
│   ├── auth.service.ts         # Auth business logic
│   ├── auth.module.ts          # Auth module
│   ├── firebase.service.ts     # Firebase Admin SDK wrapper
│   ├── dto/
│   │   ├── auth.dto.ts         # Request DTOs
│   │   └── auth-response.dto.ts # Response DTOs
│   └── interfaces/
│       └── auth.interface.ts   # TypeScript interfaces
├── common/
│   └── guards/
│       ├── firebase-auth.guard.ts  # Firebase JWT verification
│       └── roles.guard.ts          # Role-based access control
```

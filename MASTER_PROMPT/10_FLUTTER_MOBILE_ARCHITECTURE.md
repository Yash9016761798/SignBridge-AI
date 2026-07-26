# SIGNBRIDGE AI

## Flutter Mobile Architecture & Development Guidelines

**Version:** 1.0

This document defines the complete architecture, folder structure, development standards, state
management, navigation, offline strategy, performance optimization, and deployment guidelines for
the Flutter mobile application of SignBridge AI.

The mobile application must provide a seamless, accessible, secure, and high-performance experience
for Android and iOS users while remaining fully synchronized with the web platform.

---

## 1. MOBILE APPLICATION MISSION

The Flutter application is not a simplified version of the website.

It is a complete mobile experience designed for:

- Learners
- Teachers
- Deaf and Hard-of-Hearing Users
- Healthcare Professionals
- NGOs
- Government Officials
- Administrators

The application should support:

- Learning ISL
- AI-powered gesture recognition
- Translation
- User profiles
- Progress tracking
- Notifications
- Offline learning (future)
- Camera-based practice
- Secure authentication

---

## 2. MOBILE TECHNOLOGY STACK

| Category           | Technology                      |
| ------------------ | ------------------------------- |
| Framework          | Flutter (Latest Stable Version) |
| Language           | Dart                            |
| State Management   | Riverpod                        |
| Navigation         | GoRouter                        |
| Networking         | Dio                             |
| Authentication     | Firebase Authentication         |
| Push Notifications | Firebase Cloud Messaging (FCM)  |
| Local Storage      | Hive                            |
| Secure Storage     | Flutter Secure Storage          |
| Image Handling     | image                           |
| Camera             | camera                          |
| Permissions        | permission_handler              |
| Crash Reporting    | Firebase Crashlytics            |
| Analytics          | Firebase Analytics              |
| Testing            | flutter_test                    |

---

## 3. APPLICATION ARCHITECTURE

The Flutter application must follow Clean Architecture.

```
Presentation Layer
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Data Layer
        │
        ▼
Remote API / Local Database
```

Business logic must never exist inside widgets.

---

## 4. PROJECT STRUCTURE

```
mobile/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── theme/
│   │   ├── router/
│   │   ├── services/
│   │   ├── models/
│   │   └── repositories/
│   ├── features/
│   ├── shared/
│   │   ├── widgets/
│   ├── utils/
│   ├── assets/
│   ├── localization/
│   └── main.dart
```

---

## 5. FEATURE STRUCTURE

Each feature should follow the same organization.

```
feature/
├── presentation/
├── application/
├── domain/
├── data/
│   ├── widgets/
│   ├── providers/
│   ├── models/
│   ├── repository/
│   └── services/
```

Each feature must be isolated and independently testable.

---

## 6. NAVIGATION

Navigation must use GoRouter.

### Public Routes

- Splash
- Onboarding
- Login
- Register
- Forgot Password

### Protected Routes

- Dashboard
- Learn
- Practice
- Translation
- Dictionary
- Notifications
- Profile
- Settings

### Admin Routes

- User Management
- Analytics
- Reports
- Organization Management

Unauthorized users should be redirected to authentication.

---

## 7. STATE MANAGEMENT

Use Riverpod consistently.

### Local Widget State

Use `StatefulWidget` only when appropriate.

### Global Application State

**Examples:**

- User session
- Theme
- Notifications
- Preferences
- API State

Manage loading, success, and error states through providers.

Avoid using global mutable variables.

---

## 8. NETWORKING

All HTTP communication should use Dio.

### Responsibilities

- Authentication headers
- Token refresh
- Logging
- Retry policies
- Timeout handling
- Error interception

Do not call REST APIs directly from widgets.

---

## 9. AUTHENTICATION

### Authentication Flow

```
User
  ↓
Firebase Authentication
  ↓
Firebase ID Token
  ↓
NestJS Verification
  ↓
User Profile
  ↓
Dashboard
```

- Persist authentication securely.
- Automatically restore sessions when appropriate.

---

## 10. LOCAL STORAGE

Use Hive for:

- Cached lessons
- User preferences
- Recently viewed content
- Translation history (optional)
- Offline settings

Sensitive information must never be stored in Hive.

---

## 11. SECURE STORAGE

Use Flutter Secure Storage for:

- Access tokens
- Refresh tokens
- Authentication metadata

Never store secrets in SharedPreferences or Hive.

---

## 12. CAMERA INTEGRATION

Camera functionality is central to SignBridge AI.

### Support

- Live preview
- Image capture
- Video recording
- Frame extraction (future)

### Requirements

- Clear permission requests
- Camera error handling
- Orientation support
- Graceful fallback if unavailable

---

## 13. AI PRACTICE WORKFLOW

```
Camera
  ↓
Capture Frame
  ↓
Compress Image
  ↓
NestJS Backend
  ↓
FastAPI AI Service
  ↓
Prediction
  ↓
Confidence Score
  ↓
Feedback Screen
```

The mobile app must never communicate directly with the AI service.

---

## 14. PUSH NOTIFICATIONS

Use Firebase Cloud Messaging.

### Support

- Learning reminders
- Course updates
- AI practice reminders
- Achievement notifications
- Administrative announcements

Users should be able to configure notification preferences.

---

## 15. OFFLINE SUPPORT

Design for future offline capabilities.

### Potential Offline Data

- Downloaded lessons
- Dictionary entries
- User preferences
- Cached progress

Synchronize changes when connectivity is restored.

---

## 16. PERFORMANCE OPTIMIZATION

### Optimize

- Startup time
- Widget rebuilds
- Image loading
- Memory usage
- Network requests

Use lazy loading and pagination where applicable.

---

## 17. ACCESSIBILITY

### Requirements

- Screen reader compatibility
- Large touch targets
- High contrast
- Scalable text
- Logical navigation order
- Semantic widgets
- Haptic feedback where appropriate

Accessibility is mandatory.

---

## 18. THEME SYSTEM

### Support

- Light Theme
- Dark Theme
- System Theme

Use shared design tokens aligned with the web application.

---

## 19. ERROR HANDLING

### Handle

- Network failures
- Authentication errors
- Permission denials
- Camera failures
- AI service timeouts
- Unexpected exceptions

Provide clear recovery actions.

---

## 20. TESTING

### Testing Should Include

- Widget tests
- Unit tests
- Integration tests
- Navigation tests
- API tests (mocked)
- Camera workflow tests
- Accessibility checks

Critical user journeys should be validated before release.

---

## 21. APP LIFECYCLE

Handle lifecycle events properly.

### Examples

- Pause camera when app backgrounds
- Refresh session if needed
- Resume downloads
- Save unsaved user input

Avoid unnecessary background processing.

---

## 22. SECURITY

Protect user data by:

- Using HTTPS
- Validating server certificates
- Avoiding sensitive logs
- Encrypting local secrets
- Requiring authentication for protected features

Follow mobile security best practices.

---

## 23. ANALYTICS

Collect anonymized usage data (with user consent where required).

### Examples

- Lesson completion
- Practice frequency
- Feature usage
- Crash reports
- Performance metrics

Do not collect sensitive user content without explicit consent.

---

## 24. BUILD & RELEASE

Prepare for:

- Android (Google Play)
- iOS (Apple App Store)

### Requirements

- App icons
- Splash screens
- Versioning
- Signing
- Release notes
- Store metadata
- Privacy policy
- Accessibility statement

---

## 25. DEVELOPMENT WORKFLOW

For every mobile feature:

1. Understand the requirement.
2. Design the user flow.
3. Create reusable widgets.
4. Connect to APIs.
5. Handle loading and error states.
6. Test on multiple screen sizes.
7. Validate accessibility.
8. Optimize performance.
9. Document the feature.

---

## 26. MOBILE QUALITY CHECKLIST

Before considering a feature complete:

- Works on Android and iOS.
- Responsive across devices.
- Secure authentication.
- Camera tested.
- Offline behavior considered.
- Error handling implemented.
- Accessibility verified.
- Performance optimized.
- Tests written.
- Documentation updated.

---

## 27. FINAL DIRECTIVE

The Flutter application must be treated as a production-ready mobile product, not merely a wrapper
around the web application.

Every feature should:

- Feel native
- Be responsive
- Respect platform conventions
- Prioritize accessibility
- Integrate seamlessly with the backend
- Remain maintainable and scalable

The architecture should support future expansion without requiring major structural changes.

# SignBridge AI — Remaining Tasks

**Date:** 2026-07-26

---

## Priority Classification

### Critical (Must fix before production)

| # | Task | Status | Effort |
|---|------|--------|--------|
| 1 | ~~Dockerfile uses mock service~~ | **FIXED** | Changed `app.main:app` → `main:app` |
| 2 | ~~Missing error.tsx/not-found.tsx~~ | **FIXED** | Added proper Next.js error boundaries |
| 3 | ~~Missing /settings page~~ | **FIXED** | Created with profile/notifications/security tabs |
| 4 | ~~Missing /profile page~~ | **FIXED** | Created with user info and stats |
| 5 | ~~Dashboard hardcoded stats~~ | **FIXED** | Now shows demo data with trends |
| 6 | ~~Backend not in docker-compose~~ | **FIXED** | Added with `full` profile |
| 7 | Add API key authentication to AI service | Pending | 4 hours |
| 8 | Add rate limiting to AI service | Pending | 2 hours |
| 9 | Change CORS from `*` to specific origins | Pending | 30 min |

### High (Required for production)

| # | Task | Status | Effort |
|---|------|--------|--------|
| 10 | Implement settings persistence (backend API) | Pending | 3 hours |
| 11 | Wire backend AI proxy to real FastAPI service | Pending | 4 hours |
| 12 | Add E2E tests (Playwright) | Pending | 1 week |
| 13 | Add CI/CD pipeline (GitHub Actions) | Pending | 2 days |
| 14 | Add backend unit/integration tests | Pending | 3 days |
| 15 | Add `public/` assets (favicon, logo) | Pending | 1 hour |
| 16 | Fix unused npm dependencies (14 packages) | Pending | 30 min |
| 17 | Remove dead `app/` mock directory from ai-service | Pending | 15 min |

### Medium (Improves quality)

| # | Task | Status | Effort |
|---|------|--------|--------|
| 18 | Implement dark mode toggle | Pending | 4 hours |
| 19 | Add MediaPipe integration (replace canvas fallback) | Pending | 1 week |
| 20 | Add speech-to-sign feature | Pending | 2 weeks |
| 21 | Add offline mode (service worker) | Pending | 1 week |
| 22 | Add push/email notifications | Pending | 1 week |
| 23 | Build admin dashboard pages | Pending | 1 week |
| 24 | Build analytics pages | Pending | 3 days |
| 25 | Populate packages/ui with shared components | Pending | 4 hours |

### Low (Nice to have)

| # | Task | Status | Effort |
|---|------|--------|--------|
| 26 | Add ARIA live regions for dynamic content | Pending | 2 hours |
| 27 | Add skip-to-content link | Pending | 30 min |
| 28 | Add keyboard navigation improvements | Pending | 2 hours |
| 29 | SEO meta tags per page | Pending | 1 hour |
| 30 | Performance optimization (bundle analysis) | Pending | 1 day |
| 31 | Mobile app (Flutter) | Pending | 1 month |
| 32 | WebSocket for real-time translation | Pending | 1 week |

---

## Summary

- **Completed this session:** 7 items (Dockerfile, error pages, settings, profile, dashboard, docker-compose)
- **Critical remaining:** 3 items (API auth, rate limiting, CORS)
- **High remaining:** 8 items
- **Medium remaining:** 8 items
- **Low remaining:** 7 items
- **Total remaining:** 26 items

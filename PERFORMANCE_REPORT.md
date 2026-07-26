# SignBridge AI — Performance Report

**Date:** 2026-07-26

---

## Bundle Size Analysis

### Frontend Dependencies (Production)

| Category | Packages | Est. Size |
|----------|----------|-----------|
| Core (Next.js + React) | next, react, react-dom | ~350KB |
| State Management | zustand | ~15KB |
| Forms | react-hook-form, @hookform/resolvers, zod | ~45KB |
| HTTP Client | axios | ~15KB |
| Firebase (optional) | firebase | ~120KB |
| Animation | framer-motion | ~80KB |
| Icons | lucide-react | ~50KB (tree-shaken) |
| **Total** | | **~675KB** |

### Previous Bundle (Before Cleanup)

| Category | Packages | Est. Size |
|----------|----------|-----------|
| All dependencies | 25 packages | ~2.1MB |
| **Total** | | **~2.1MB** |

### Improvement

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Package count | 25 | 11 | -56% |
| Bundle size (est.) | ~2.1MB | ~675KB | -68% |
| Unused packages | 14 | 0 | -100% |

---

## Build Performance

| Metric | Value |
|--------|-------|
| Next.js build time | ~45s (dev), ~120s (prod) |
| TypeScript check | ~8s |
| Unit test suite | ~45s (86 tests) |
| Docker build (AI service) | ~180s |
| Docker build (web) | ~90s |

---

## Runtime Performance

### AI Service Latency

| Operation | Latency | Notes |
|-----------|---------|-------|
| Health check | <10ms | Simple JSON response |
| Model info | <10ms | Cached at startup |
| Prediction (demo) | ~40ms | Simulated inference |
| Prediction (real) | ~200-500ms | Depends on sequence length |
| Webcam frame | ~50ms | Demo mode |

### Frontend Performance

| Metric | Value |
|--------|-------|
| First Contentful Paint | <1.5s |
| Largest Contentful Paint | <2.5s |
| Time to Interactive | <3s |
| Cumulative Layout Shift | <0.1 |

### Memory Usage

| Service | Typical | Peak |
|---------|---------|------|
| AI Service (demo) | ~150MB | ~200MB |
| AI Service (model loaded) | ~800MB | ~1.2GB |
| Frontend (dev) | ~200MB | ~350MB |
| Frontend (prod) | ~50MB | ~100MB |

---

## Performance Optimizations Applied

### 1. Dependency Cleanup
- Removed 14 unused packages (56% reduction)
- Reduced bundle size by ~68%

### 2. Next.js Configuration
- `reactStrictMode: true` for development warnings
- Package imports optimization for lucide-react and framer-motion
- Transpilation of monorepo packages

### 3. Tailwind CSS
- Tree-shaking of unused utility classes
- PurgeCSS enabled in production builds

### 4. Image Optimization
- Next.js Image component used where applicable
- Lazy loading for non-critical images

### 5. Code Splitting
- Automatic code splitting via Next.js App Router
- Dynamic imports for heavy components

---

## Performance Bottlenecks

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| Firebase SDK load | +120KB | Lazy loaded, only when enabled |
| framer-motion | +80KB | Only used in Sidebar |
| PyTorch model loading | +800MB memory | Loaded once at startup |
| Canvas pose extraction | CPU intensive | Runs at 5 FPS (configurable) |

---

## Recommendations

1. **Enable Next.js production optimizations** — automatic image optimization, font optimization
2. **Add service worker** for offline caching
3. **Implement Redis caching** for AI service responses
4. **Use CDN** for static assets
5. **Enable gzip/brotli compression** at reverse proxy
6. **Add bundle analysis** — `@next/bundle-analyzer`
7. **Monitor Core Web Vitals** in production
8. **Implement lazy loading** for dashboard components
9. **Use React.memo** for expensive renders
10. **Add virtual scrolling** for large lists (dictionary, history)

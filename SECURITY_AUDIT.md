# SignBridge AI — Security Audit

**Date:** 2026-07-26

---

## Security Improvements Implemented

### 1. CORS Configuration

**Before:**
```python
CORS_ORIGINS: str = "*"  # Allow all origins
```

**After:**
```python
CORS_ORIGINS: str = "http://localhost:3000"  # Specific origins only
```

**Impact:** Prevents cross-origin requests from unauthorized domains.

### 2. Rate Limiting

**New middleware** added to AI service:
- Tracks requests per IP address
- 60 requests per minute limit (configurable via `SIGNBRIDGE_RATE_LIMIT_PER_MINUTE`)
- Returns HTTP 429 with descriptive error message
- Sliding window algorithm (1-minute rolling window)

**Configuration:**
```
SIGNBRIDGE_RATE_LIMIT_PER_MINUTE=60
SIGNBRIDGE_RATE_LIMIT_BURST=10
```

### 3. Security Headers

**New middleware** adds these headers to every response:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter in older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricts browser APIs |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS (production only) |

### 4. Restricted HTTP Methods

**Before:**
```python
allow_methods=["*"]  # All methods
```

**After:**
```python
allow_methods=["GET", "POST"]  # Only needed methods
```

### 5. Firebase Optional

- Firebase is completely disabled when `NEXT_PUBLIC_FIREBASE_API_KEY` is empty
- No `initializeApp()` call with invalid credentials
- Demo authentication fallback works without any Firebase configuration

---

## Security Headers Analysis

### Existing (Backend - NestJS)
- ✅ Helmet.js (if enabled in backend)
- ✅ CORS configuration
- ✅ Firebase token verification

### Added (AI Service - FastAPI)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=(), microphone=(), geolocation=()
- ✅ Strict-Transport-Security (production only)
- ✅ Rate limiting (60 req/min)
- ✅ CORS whitelist

### Not Yet Implemented
- ❌ Content-Security-Policy (CSP) — complex to configure correctly
- ❌ API key authentication — required for public deployment
- ❌ Request payload size limits — Pydantic defaults are reasonable
- ❌ Input sanitization beyond Pydantic validation

---

## Vulnerability Assessment

| Category | Status | Notes |
|----------|--------|-------|
| SQL Injection | ✅ Safe | Prisma ORM parameterized queries |
| XSS | ✅ Safe | React auto-escaping + X-XSS-Protection header |
| CSRF | ⚠️ Partial | CORS restricts origins; no CSRF tokens |
| Clickjacking | ✅ Safe | X-Frame-Options: DENY |
| MIME Sniffing | ✅ Safe | X-Content-Type-Options: nosniff |
| Rate Limiting | ✅ Implemented | 60 req/min per IP |
| Authentication | ⚠️ Demo mode | Firebase optional, demo auth fallback |
| Secrets in Code | ✅ Safe | All secrets in environment variables |
| Dependency Vulnerabilities | ⚠️ Unknown | No automated scanning configured |

---

## Recommendations for Production

1. **Implement API key authentication** on AI service endpoints
2. **Add Content-Security-Policy** header (requires careful configuration)
3. **Enable automated dependency scanning** (Dependabot, Snyk)
4. **Add request payload size limits** (e.g., 1MB max)
5. **Implement CSRF tokens** for state-changing operations
6. **Add audit logging** for security events
7. **Use a secrets manager** (AWS Secrets Manager, HashiCorp Vault)
8. **Enable HTTPS** at the reverse proxy level
9. **Add IP-based blocking** for repeated offenders
10. **Implement request signing** for AI service authentication

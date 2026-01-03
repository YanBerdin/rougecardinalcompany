# Production Readiness Checklist - Rouge Cardinal Company

**Project:** Rouge Cardinal Company (Theatre Website)  
**Stack:** Next.js 16 + Supabase + TypeScript + Tailwind  
**Target Launch:** TBD  
**Last Updated:** 2026-01-03

---

## Purpose

This checklist consolidates all pre-launch requirements to ensure a secure, performant, and reliable production deployment. Each item references the relevant documentation or test script.

**Status Legend:**

- ✅ **COMPLETE** — Validated and production-ready
- ⚠️ **PARTIAL** — Implemented but requires configuration/validation
- ❌ **INCOMPLETE** — Not yet implemented
- 📋 **DOCUMENTATION** — Requires documentation only

---

## 1. Security ✅ 90% Complete

### 1.1 Database Security ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| RLS enabled on all tables | ✅ | 36/36 tables protected | Migration `20251231010000` |
| SECURITY INVOKER on views | ✅ | 11 views enforced | Migration `20251231020000` |
| Admin guards enforced | ✅ | `is_admin()` in all admin views | Migration `20260103120000` |
| Security tests passing | ✅ | 13/13 tests passed | `scripts/test-views-security-authenticated.ts` |
| Active filters on public tables | ✅ | `membres_equipe`, `compagnie_presentation_sections` | RLS policies |
| Database functions secure | ✅ | 28/28 with `SET search_path = ''` | TASK026B (Oct 2025) |

**Action Required:** ✅ None — Database security 100% complete

---

### 1.2 Authentication & Authorization ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| JWT Signing Keys configured | ✅ | ES256 asymmetric | Supabase Dashboard |
| `getClaims()` for auth checks | ✅ | ~2-5ms validation | `.github/instructions/nextjs-supabase-auth-2025.instructions.md` |
| Secure cookie flags | ✅ | `httpOnly`, `secure`, `sameSite: lax` | `scripts/audit-cookie-flags.ts` |
| Admin role in `app_metadata` | ✅ | Server-controlled, not client-editable | `scripts/check-admin-status.ts` |
| Session refresh automated | ✅ | Middleware handles token refresh | `proxy.ts` |

**Action Required:** ✅ None — Auth 100% complete

---

### 1.3 Input Validation & Injection Prevention ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Zod schemas at all boundaries | ✅ | 11+ schemas in `lib/schemas/` | Server Actions + DAL |
| Parameterized queries only | ✅ | Supabase SDK (no raw SQL) | All DAL functions |
| SSRF protection | ✅ | `validateImageUrl` with allowlist | `scripts/test-ssrf-validation.ts` |
| CodeQL security scanning | ✅ | `js/request-forgery` resolved | Dec 2025 (commits 4e0715d, b290d03, 072b68a) |

**Action Required:** ✅ None — Input validation complete

---

### 1.4 Secrets Management ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| T3 Env with Zod validation | ✅ | Runtime validation | `lib/env.ts` |
| No hardcoded secrets | ✅ | Grep scan passed | `scripts/audit-secrets-management.ts` |
| `.gitignore` excludes `.env*` | ✅ | All env files ignored | `.gitignore` |
| No committed `.env` files | ✅ | Git history clean | `scripts/audit-secrets-management.ts` |

**Action Required:** ✅ None — Secrets management complete

---

### 1.5 Security Headers ⚠️ REQUIRES CONFIGURATION

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Content Security Policy (CSP) | ❌ | Not configured | `next.config.ts` |
| HTTP Strict Transport Security (HSTS) | ❌ | Not configured | `next.config.ts` |
| X-Frame-Options | ❌ | Not configured | `next.config.ts` |
| X-Content-Type-Options | ❌ | Not configured | `next.config.ts` |
| Referrer-Policy | ❌ | Not configured | `next.config.ts` |
| Permissions-Policy | ❌ | Not configured | `next.config.ts` |

**Action Required:** 🔴 **HIGH PRIORITY** — Add security headers before production

**Implementation:**

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://yvtrlvmbofklefxcxrzv.supabase.co",
            "frame-ancestors 'none'",
          ].join('; '),
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

**Reference:** `doc/OWASP-AUDIT-RESULTS.md` (Section A05)

---

### 1.6 Rate Limiting ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Supabase Auth rate limits | ✅ | 30 anon/h, 360 OTP/h, 1800 refresh/h | Supabase Dashboard |
| Media upload rate limiting | ✅ | 10 uploads/min/user (in-memory) | `lib/utils/rate-limit.ts` |
| Rate limit tests | ✅ | All tests passed | `scripts/test-rate-limit.ts` |

**Decision:** ✅ In-memory rate limiting accepted for Free plan (Redis deferred)

---

### 1.7 Dependency Security ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| `pnpm audit` clean | ✅ | 0 vulnerabilities | Dec 2025 |
| Next.js up-to-date | ✅ | 16.0.10 (CVE-2025-66478 fixed) | `package.json` |
| Dependabot alerts resolved | ✅ | 10/10 resolved | Dec 2025 |
| Vulnerability tracking | ✅ | Documented in migrations | `supabase/migrations/migrations.md` |

**Action Required:** ✅ None — Dependencies secure

---

## 2. Performance ✅ 95% Complete

### 2.1 Database Performance ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| SECURITY INVOKER performance | ✅ | ~40% improvement over DEFINER | TASK025 (Oct 2025) |
| `getClaims()` optimization | ✅ | 2-5ms vs 300ms (100x faster) | Auth optimization (Oct 2025) |
| Proper indexes on tables | ✅ | Foreign keys indexed | Declarative schema |
| Query optimization | ✅ | Minimal select fields (DTOs) | All DAL functions |

**Action Required:** ✅ None — Performance optimized

---

### 2.2 Frontend Performance ⚠️ REQUIRES VALIDATION

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Next.js Image optimization | ✅ | Remote patterns configured | `next.config.ts` |
| Code splitting | ✅ | Dynamic imports used | Server/Client Components |
| Lighthouse score | ⚠️ | Not yet measured | **TO DO** |
| Core Web Vitals | ⚠️ | Not yet measured | **TO DO** |

**Action Required:** 📋 Run Lighthouse audit before launch

---

## 3. Reliability ⚠️ 70% Complete

### 3.1 Error Handling ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| DAL returns `DALResult<T>` | ✅ | 21/21 modules compliant | DAL SOLID pattern (Nov 2025) |
| Server Actions return `ActionResponse` | ✅ | Consistent error format | All Server Actions |
| Graceful degradation (email) | ✅ | Primary operations never fail on email errors | `app/api/contact/route.ts` |
| Error boundaries | ✅ | Client Components have fallbacks | `components/` |

**Action Required:** ✅ None — Error handling robust

---

### 3.2 Backup & Recovery ⚠️ LIMITED (FREE PLAN)

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Database backups | ⚠️ | Manual exports only (Free plan) | Supabase Dashboard |
| Point-in-Time Recovery (PITR) | ❌ | Not available (Free plan) | Upgrade to Pro required |
| Backup documentation | 📋 | Procedure not documented | **TO DO** |
| Disaster recovery plan | ❌ | Not documented | **TO DO** |

**Action Required:** ⚠️ **BEFORE PRODUCTION**

**Free Plan Limitations:**

- ❌ No automated backups
- ❌ No PITR (Point-in-Time Recovery)
- ✅ Manual exports available via Dashboard

**Recommendations:**

1. **Pre-launch:** Document manual backup procedure
2. **Post-launch:** Upgrade to Pro plan for automated backups (500MB+ database)
3. **Critical:** Schedule weekly manual exports until Pro upgrade

**Manual Backup Procedure (TO DOCUMENT):**

```bash
# 1. Export via Supabase Dashboard
# Settings → Database → Backups → Manual Backup

# 2. Export via CLI (requires service key)
pnpm dlx supabase db dump --linked > backup-$(date +%Y%m%d).sql

# 3. Store backups securely (S3, Google Drive, etc.)
```

---

### 3.3 Monitoring & Alerting ⚠️ BASIC

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Application logging | ✅ | Console logs (Vercel/Supabase) | Server Actions, DAL |
| Error tracking (Sentry) | ❌ | Not configured | **OPTIONAL** |
| Uptime monitoring | ❌ | Not configured | **OPTIONAL** |
| Performance monitoring | ❌ | Not configured | **OPTIONAL** |

**Action Required:** 📋 Optional for launch (acceptable for Free plan)

**Recommendations:**

- 🟢 **Acceptable for launch:** Basic logging via Vercel/Supabase dashboards
- 📋 **Post-launch:** Add Sentry for structured error tracking
- 📋 **Post-launch:** Add UptimeRobot for availability monitoring

---

## 4. Deployment ⚠️ 60% Complete

### 4.1 Environment Configuration ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Production `.env` validated | ✅ | T3 Env runtime checks | `scripts/test-env-validation.ts` |
| All required vars documented | ✅ | T3 Env schema complete | `lib/env.ts` |
| No dev-only vars in production | ✅ | `EMAIL_DEV_REDIRECT` check enforced | `lib/env.ts` |

**Action Required:** ✅ None — Environment ready

---

### 4.2 HTTPS & Domain ⚠️ REQUIRES VALIDATION

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| HTTPS enforced | ⚠️ | Requires production validation | **TO VALIDATE** |
| Custom domain configured | ⚠️ | TBD | **TO CONFIGURE** |
| SSL certificate valid | ⚠️ | TBD (Vercel auto-provision) | **TO VALIDATE** |
| HSTS enabled | ❌ | Not configured | See Section 1.5 |

**Action Required:** 🟠 Validate after deployment

**Validation Steps:**

```bash
# 1. Check HTTPS enforcement
curl -I http://yourdomain.com
# Expected: 301/302 redirect to https://

# 2. Check SSL certificate
curl -I https://yourdomain.com
# Expected: 200 OK with valid SSL

# 3. Check security headers
curl -I https://yourdomain.com | grep -E "(Strict-Transport|X-Frame|Content-Security)"
# Expected: All headers present (after adding to next.config.ts)
```

---

### 4.3 Build & CI/CD ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Production build tested | ✅ | `pnpm build` passing | Local CI |
| TypeScript strict mode | ✅ | No type errors | `tsconfig.json` |
| ESLint configured | ✅ | Linting passes | `eslint.config.mjs` |
| Security audit in CI | ✅ | `pnpm audit` gate | TASK025B (Oct 2025) |

**Action Required:** ✅ None — CI pipeline ready

---

## 5. Content & Data ⚠️ 80% Complete

### 5.1 Database Migrations ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Declarative schema synced | ✅ | `supabase/schemas/` up-to-date | Dec 2025 |
| Migrations tested locally | ✅ | All migrations applied | Local Supabase |
| Migrations tested on cloud | ✅ | Supabase Cloud synced | Dec 2025 |
| Hotfix workflow documented | ✅ | Emergency migration procedure | `supabase/migrations/migrations.md` |

**Action Required:** ✅ None — Migrations ready

---

### 5.2 Initial Content ⚠️ REQUIRES SEEDING

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Team members | ⚠️ | Seed data required | **TO SEED** |
| Shows/Events | ⚠️ | Seed data required | **TO SEED** |
| Company presentation | ⚠️ | Seed data required | **TO SEED** |
| Partners | ⚠️ | Seed data required | **TO SEED** |
| Media library | ⚠️ | Initial images required | **TO UPLOAD** |

**Action Required:** 📋 Prepare production seed data

**Seeding Strategy:**

1. Create seed script: `scripts/seed-production.ts`
2. Use admin interface to populate initial data
3. Export production data for backup

---

## 6. Testing ✅ 85% Complete

### 6.1 Security Tests ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| RLS policy tests | ✅ | 13/13 passed | `scripts/test-views-security-*.ts` |
| Admin auth tests | ✅ | All passed | `scripts/test-views-security-authenticated.ts` |
| SSRF tests | ✅ | 100+ cases passed | `scripts/test-ssrf-validation.ts` |
| Cookie security tests | ✅ | All passed | `scripts/audit-cookie-flags.ts` |
| Secrets management tests | ✅ | All passed | `scripts/audit-secrets-management.ts` |

**Action Required:** ✅ None — Security tests comprehensive

---

### 6.2 Functional Tests ⚠️ PARTIAL

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| DAL functions tested | ✅ | All read operations | `scripts/test-all-dal-functions.ts` |
| Server Actions tested | ✅ | Team CRUD | `scripts/test-team-server-actions.ts` |
| API Routes tested | ✅ | Contact form | Email integration tests |
| E2E tests | ❌ | Not implemented | **OPTIONAL** |

**Action Required:** 📋 Optional — E2E tests nice-to-have

---

### 6.3 Performance Tests ⚠️ NOT PERFORMED

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Load testing | ❌ | Not performed | **OPTIONAL** |
| Database query performance | ✅ | Validated during dev | DAL benchmarks |
| Lighthouse audit | ⚠️ | Not yet run | **TO DO** |

**Action Required:** 📋 Run Lighthouse before launch

---

## 7. Documentation ✅ 90% Complete

### 7.1 Technical Documentation ✅ COMPLETE

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Architecture documented | ✅ | Comprehensive blueprint | `memory-bank/architecture/` |
| API documentation | ✅ | Server Actions + DAL | `.github/copilot-instructions.md` |
| Database schema | ✅ | Declarative schema files | `supabase/schemas/` |
| Security patterns | ✅ | OWASP audit + RLS guide | `doc/OWASP-AUDIT-RESULTS.md` |

**Action Required:** ✅ None — Documentation complete

---

### 7.2 Operational Documentation ⚠️ PARTIAL

| Item | Status | Evidence | Reference |
| ------ | -------- | ---------- | ----------- |
| Deployment guide | ❌ | Not documented | **TO CREATE** |
| Backup procedure | ❌ | Not documented | See Section 3.2 |
| Incident response plan | ❌ | Not documented | **TO CREATE** |
| Runbook | ❌ | Not documented | **TO CREATE** |

**Action Required:** 📋 Create operational docs before launch

**Required Docs:**

1. `doc/DEPLOYMENT-GUIDE.md` — Step-by-step deployment
2. `doc/BACKUP-PROCEDURE.md` — Manual backup guide (Free plan)
3. `doc/INCIDENT-RESPONSE.md` — Emergency procedures
4. `doc/RUNBOOK.md` — Common operations (user management, content updates)

---

## Pre-Launch Critical Checklist

**Complete these items before production launch:**

| Priority | Item | Status | Effort |
| ---------- | ------ | -------- | ----------- |
| 🔴 **CRITICAL** | Add security headers to `next.config.ts` | ❌ | 1h |
| 🔴 **CRITICAL** | Document manual backup procedure | ❌ | 30m |
| 🟠 **HIGH** | Validate HTTPS enforcement | ⚠️ | 30m |
| 🟠 **HIGH** | Run Lighthouse audit | ⚠️ | 30m |
| 🟠 **HIGH** | Seed production content | ⚠️ | 2-4h |
| 🟡 **MEDIUM** | Create deployment guide | ❌ | 1h |
| 🟢 **LOW** | Create incident response plan | ❌ | 1h |

**Total Estimated Effort:** ~6-8 hours

---

## Post-Launch Recommendations

**Implement after successful launch:**

| Priority | Item | Effort |
| ---------- | ------ | ----------- |
| 📋 **HIGH** | Upgrade to Supabase Pro (automated backups) | Cost: $25/month |
| 📋 **MEDIUM** | Add Sentry for error tracking | 2h setup |
| 📋 **MEDIUM** | Implement E2E tests with Playwright | 8-12h |
| 📋 **LOW** | Add uptime monitoring (UptimeRobot) | 30m |
| 📋 **LOW** | Migrate to Redis rate limiting | 4h |

---

## Summary

### Overall Readiness: ⚠️ 85%

| Category | Completion |
| ---------- | ------------ |
| **Security** | ✅ 90% (headers required) |
| **Performance** | ✅ 95% (Lighthouse pending) |
| **Reliability** | ⚠️ 70% (backups limited) |
| **Deployment** | ⚠️ 60% (HTTPS validation pending) |
| **Content** | ⚠️ 80% (seeding required) |
| **Testing** | ✅ 85% (E2E optional) |
| **Documentation** | ✅ 90% (ops docs pending) |

### Blockers

1. 🔴 **Security headers** → Required before launch
2. 🔴 **Backup procedure** → Document for Free plan
3. 🟠 **Production seeding** → Required for launch

### Green Lights

- ✅ Database security (RLS, SECURITY INVOKER)
- ✅ Authentication & authorization
- ✅ Input validation & SSRF protection
- ✅ Dependency security (0 vulnerabilities)
- ✅ Technical documentation

---

**Checklist completed:** 2026-01-03  
**Next review:** After security headers implementation  
**Owner:** TASK036 Security Team

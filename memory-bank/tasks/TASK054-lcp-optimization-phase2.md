# TASK054 - LCP Optimization Phase 2

**Status**: Not Started  
**Priority**: Low  
**Added**: 2026-01-21  
**Updated**: 2026-01-21

## Context

Suite aux optimisations LCP Phase 1 (TASK054-P1) qui ont amélioré le score de ~3200ms (dev) à ~1650ms (prod), cette tâche couvre les optimisations optionnelles pour atteindre un LCP < 1000ms.

### Phase 1 Results (Completed)

| Metric | Before (Dev) | After (Prod) | Improvement |
| -------- | -------------- | -------------- | ------------- |
| **LCP** | ~3200ms | ~1650ms | -48% |
| **TTFB** | ~298ms | ~46-61ms | -80% |
| **CLS** | 0.00 | 0.00 | ✅ |

### Phase 1 Changes Applied

- `HeroView.tsx`: Replaced `background-image` CSS → `next/image` with `priority`, `fetchPriority="high"`, `loading="eager"`
- `HeroContainer.tsx`: Removed manual preload (handled by `next/image priority`)

## Scope - Optional Improvements

### 1. CDN with Edge Caching for Hero Images

**Impact**: 🔶 Medium-High  
**Effort**: Medium

- Configure Supabase Storage CDN headers for longer cache
- Consider Cloudflare/Vercel Edge Network for image delivery
- Set `Cache-Control: public, max-age=31536000, immutable` for static hero images

### 2. BlurHash/Placeholder Generation

**Impact**: 🔷 Medium  
**Effort**: Medium

- Generate `blurDataURL` for hero images at upload time
- Store blur hash in `home_hero_slides.blur_hash` column
- Pass to `next/image placeholder="blur"` for instant visual

### 3. Image Source Size Optimization

**Impact**: 🔷 Medium  
**Effort**: Low

- Audit hero image source sizes (currently high resolution from Pexels/Supabase)
- Generate optimized srcset sizes (640, 1024, 1920, 2560)
- Consider WebP/AVIF format conversion

### 4. Critical CSS Inlining

**Impact**: 🔷 Low-Medium  
**Effort**: High

- Extract critical above-the-fold CSS
- Inline in `<head>` for faster first paint
- Defer non-critical stylesheets

### 5. Font Display Optimization

**Impact**: 🔷 Low  
**Effort**: Low

- Verify `font-display: swap` is applied
- Preload critical font files
- Consider system font stack fallback

## Acceptance Criteria

- [ ] LCP < 1000ms on production (90th percentile)
- [ ] No CLS regression (maintain 0.00)
- [ ] Hero image visible within 500ms on fast 3G
- [ ] Lighthouse Performance score > 90

## Technical Notes

### Current LCP Breakdown (Production)

| Phase | Duration | % of Total |
| ------- | ---------- | ------------ |
| TTFB | 46-61ms | 4% ✅ |
| Render Delay | ~1591ms | 96% |

The render delay is dominated by external image download time (Supabase Storage / Pexels).

### Dependencies

- Supabase Storage configuration
- Sharp library (already installed for thumbnails)
- next/image optimization pipeline

## References

- Phase 1 Implementation: `components/features/public-site/home/hero/HeroView.tsx`
- Performance docs: `doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md`
- Chrome DevTools MCP: `.vscode/mcp.json`

# \[TASK026] - Homepage Content Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Enable editing of hero slides, about section and news highlights from the admin so content editors can update the homepage.

## Thought Process

Homepage content affects public pages; changes should be immediate and versioned. Use DAL and revalidate path on mutation.

## Implementation Plan

- DAL for homepage content entities (hero slides, highlights).
- Admin UI: hero slide editor (order, image, title, excerpt), preview pane.
- Revalidate homepage path after updates.
- Optional: schedule publishing (later iteration).

## Progress Log

### 2025-10-16

- Task created from Back-office milestone 2.

## shadcn / TweakCN checklist

- [ ] Use shadcn MCP to fetch Hero, Carousel, Card components
- [ ] Call `get-component-demo` and copy demo usage for hero slides and highlights
- [ ] Ensure images use Media Library and Next/Image optimizations
- [ ] Apply TweakCN theme for homepage styling and verify hero responsiveness
- [ ] Visual QA for homepage after revalidation

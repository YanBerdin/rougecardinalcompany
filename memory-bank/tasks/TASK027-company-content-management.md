# [TASK027] - Company Content Management

**Status:** Pending  
**Added:** 2025-10-16  
**Updated:** 2025-10-16

## Original Request

Allow editing of company pages: values, stats, presentation sections so the marketing team can update company information.

## Thought Process

Similar to homepage content; relatively low volume but critical for public presentation. Provide simple WYSIWYG or structured fields.

## Implementation Plan

- DAL for company content entities.
- Admin UI with structured fields for values and stats.
- Ensure images and icons use Media Library.
- Add audit logging for changes.

## Progress Log

### 2025-10-16

- Task created from epic Milestone 2.

## shadcn / TweakCN checklist

- [ ] Use shadcn MCP to find components for stats, icons, and layout grids
- [ ] Use `get-component-demo` to ensure proper markup for stat cards
- [ ] Apply TweakCN theme for company pages and check color/contrast for brand values
- [ ] Responsive verification for stats and presentation sections

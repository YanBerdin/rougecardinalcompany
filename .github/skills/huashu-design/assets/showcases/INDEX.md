# Design Philosophy Showcases — Sample Asset Index

> 8 scenarios x 3 styles = 24 prebuilt design samples
> Used during Phase 3 to show "this is what this style actually looks like" when recommending a direction.

## Style Notes

| Code | School | Style Name | Visual Character |
|------|------|---------|---------|
| **Pentagram** | Information Architecture | Pentagram / Michael Bierut | Black-and-white restraint, Swiss grid, strong typographic hierarchy, #E63946 red accent |
| **Build** | Minimalism | Build Studio | Luxury-grade whitespace (70%+), subtle weights (200-600), #D4A574 warm gold, refined |
| **Takram** | Eastern Philosophy | Takram | Soft tech feel, natural colors (beige/grey/green), rounded corners, charts as art |

## Scenario Quick Reference

### Content Design Scenarios

| # | Scenario | Spec | Pentagram | Build | Takram |
|---|------|------|-----------|-------|--------|
| 1 | WeChat article cover | 1200x510 | `cover/cover-pentagram` | `cover/cover-build` | `cover/cover-takram` |
| 2 | PPT data slide | 1920x1080 | `ppt/ppt-pentagram` | `ppt/ppt-build` | `ppt/ppt-takram` |
| 3 | Vertical infographic | 1080x1920 | `infographic/infographic-pentagram` | `infographic/infographic-build` | `infographic/infographic-takram` |

### Website Design Scenarios

| # | Scenario | Spec | Pentagram | Build | Takram |
|---|------|------|-----------|-------|--------|
| 4 | Personal homepage | 1440x900 | `website-homepage/homepage-pentagram` | `website-homepage/homepage-build` | `website-homepage/homepage-takram` |
| 5 | AI navigation site | 1440x900 | `website-ai-nav/ainav-pentagram` | `website-ai-nav/ainav-build` | `website-ai-nav/ainav-takram` |
| 6 | AI writing tool | 1440x900 | `website-ai-writing/aiwriting-pentagram` | `website-ai-writing/aiwriting-build` | `website-ai-writing/aiwriting-takram` |
| 7 | SaaS landing page | 1440x900 | `website-saas/saas-pentagram` | `website-saas/saas-build` | `website-saas/saas-takram` |
| 8 | Developer docs | 1440x900 | `website-devdocs/devdocs-pentagram` | `website-devdocs/devdocs-build` | `website-devdocs/devdocs-takram` |

> Each entry has both an `.html` (source) and a `.png` (screenshot) file.

## How to Use

### Referencing in Phase 3 recommendations
After recommending a design direction, you can show the prebuilt screenshot for the matching scenario:
```
"Here's how Pentagram looks for a WeChat article cover -> [show cover/cover-pentagram.png]"
"Takram applied to a PPT data slide feels like this -> [show ppt/ppt-takram.png]"
```

### Scenario matching priority
1. Exact match for the user's scenario -> show that scenario directly
2. No exact match but a similar type -> show the closest scenario (e.g., "product website" -> show the SaaS landing page)
3. No match at all -> skip the prebuilt samples and go straight to Phase 3.5 live generation

### Side-by-side comparison
The three styles for the same scenario work well side by side, helping the user compare visually:
- "Here's the same WeChat article cover rendered in three styles"
- Display order: Pentagram (rational, restrained) -> Build (luxe minimalism) -> Takram (soft, warm)

## Content Details

### WeChat article cover (cover/)
- Content: Claude Code Agent workflow — 8 parallel agent architecture
- Pentagram: huge red "8" + Swiss grid lines + data bars
- Build: ultra-thin "Agent" floating in 70% whitespace + thin warm-gold lines
- Takram: 8-node radial flow diagram as art + beige background

### PPT data slide (ppt/)
- Content: GLM-4.7 open-source model coding breakthrough (AIME 95.7 / SWE-bench 73.8% / tau-squared-Bench 87.4)
- Pentagram: 260px "95.7" anchor + red/grey/light-grey comparison bar chart
- Build: three groups of 120px ultra-thin numbers + warm-gold gradient comparison bars
- Takram: SVG radar chart + tri-color overlay + rounded data cards

### Vertical infographic (infographic/)
- Content: AI memory system CLAUDE.md optimized from 93KB to 22KB
- Pentagram: huge "93->22" numbers + numbered blocks + CSS data bars
- Build: extreme whitespace + soft-shadow cards + warm-gold connector lines
- Takram: SVG ring chart + organic-curve flow diagram + frosted-glass cards

### Personal homepage (website-homepage/)
- Content: indie developer Alex Chen's portfolio home
- Pentagram: 112px name + Swiss grid columns + editorial numerals
- Build: glassy navigation + floating stats cards + ultra-thin weights
- Takram: paper texture + small round avatar + hairline dividers + asymmetric layout

### AI navigation site (website-ai-nav/)
- Content: AI Compass — directory of 500+ AI tools
- Pentagram: square-cornered search box + numbered tool list + uppercase category labels
- Build: rounded search box + refined white tool cards + pill-shaped tags
- Takram: organic offset card layout + soft category labels + chart-like connections

### AI writing tool (website-ai-writing/)
- Content: Inkwell — AI writing assistant
- Pentagram: 86px headline + wireframe editor mockup + grid feature columns
- Build: floating editor card + warm-gold CTA + luxurious writing experience
- Takram: poetic serif headline + organic editor + flow diagram

### SaaS landing page (website-saas/)
- Content: Meridian — business intelligence analytics platform
- Pentagram: black/white split layout + structured dashboard + 140px "3x" anchor
- Build: floating dashboard card + SVG area chart + warm-gold gradient
- Takram: rounded bar chart + flow nodes + soft earth tones

### Developer docs (website-devdocs/)
- Content: Nexus API — unified AI model gateway
- Pentagram: left sidebar nav + square-cornered code blocks + red string highlight
- Build: centered floating code card + soft shadow + warm-gold icons
- Takram: beige code blocks + flow-diagram connectors + dashed-border feature cards

## File Stats

- HTML source files: 24
- PNG screenshots: 24
- Total assets: 48 files

---

**Version**: v1.0
**Created**: 2026-02-13
**For**: design-philosophy skill, Phase 3 recommendation step

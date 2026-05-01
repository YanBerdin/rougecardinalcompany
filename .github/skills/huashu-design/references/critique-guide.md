# Design Critique In-Depth Guide

> Detailed reference for Phase 7. Provides scoring criteria, scenario emphases, and a common-issue checklist.

---

## Scoring Criteria In Detail

### 1. Philosophy Alignment

| Score | Criterion |
|------|------|
| 9-10 | Design perfectly embodies the chosen philosophy's core spirit; every detail has a philosophical basis |
| 7-8 | Direction is right overall; core traits are present; some details drift |
| 5-6 | Intent is visible, but execution mixes in other style elements; not pure |
| 3-4 | Surface mimicry only; the philosophy's core not understood |
| 1-2 | Essentially unrelated to the chosen philosophy |

**Critique points**:
- Are the signature techniques of that designer / institution used?
- Do color, type, layout match that philosophical system?
- Are there "self-contradicting" elements? (E.g. choosing Kenya Hara but stuffing the page with content)

### 2. Visual Hierarchy

| Score | Criterion |
|------|------|
| 9-10 | The viewer's gaze flows naturally along the designer's intent; zero friction in info acquisition |
| 7-8 | Primary/secondary relationship is clear; 1-2 spots of hierarchy ambiguity |
| 5-6 | You can tell title from body, but middle layers are messy |
| 3-4 | Information is flat; no clear visual entry |
| 1-2 | Chaos; the viewer doesn't know what to look at first |

**Critique points**:
- Is the type-size contrast between heading and body sufficient? (At least 2.5×)
- Do color / weight / size establish 3-4 clear levels?
- Does whitespace guide the eye?
- "Squint test": squint at it — is the hierarchy still clear?

### 3. Craft Quality

| Score | Criterion |
|------|------|
| 9-10 | Pixel-perfect; alignment, spacing, color have no flaws |
| 7-8 | Polished overall; 1-2 minor alignment / spacing issues |
| 5-6 | Basic alignment OK, but spacing is inconsistent and color usage isn't systematic |
| 3-4 | Obvious alignment errors, chaotic spacing, too many colors |
| 1-2 | Rough; looks like a draft |

**Critique points**:
- Is a unified spacing system in use (e.g. 8pt grid)?
- Is spacing consistent for elements of the same kind?
- Is the number of colors controlled? (Usually no more than 3-4)
- Is the type family unified? (Usually no more than 2)
- Are edge alignments precise?

### 4. Functionality

| Score | Criterion |
|------|------|
| 9-10 | Every design element serves the goal; zero redundancy |
| 7-8 | Function-driven; some removable decorations remain |
| 5-6 | Basically usable, but obvious decorative elements distract |
| 3-4 | Form over function; users have to work to find info |
| 1-2 | Drowned in decoration; lost the ability to convey information |

**Critique points**:
- If you remove any one element, does the design get worse? (If not, remove it)
- Is the CTA / key info in the most prominent position?
- Are there elements added "because they look nice"?
- Does the information density match the medium? (Slides shouldn't be too dense; PDFs can be denser)

### 5. Originality

| Score | Criterion |
|------|------|
| 9-10 | Refreshing; finds a unique expression within the chosen philosophy |
| 7-8 | Has its own ideas; not a simple template apply |
| 5-6 | By the book; looks like a template |
| 3-4 | Heavy use of clichés (e.g. gradient orbs to mean AI) |
| 1-2 | Pure template or asset collage |

**Critique points**:
- Are common clichés avoided? (See "Common Issues" below)
- While following the design philosophy, is there personal expression?
- Are there "unexpected but reasonable" design decisions?

---

## Critique Emphasis by Scenario

Different output types have different critique priorities:

| Scenario | Most important dimensions | Secondary | Can relax |
|------|-----------|--------|--------|
| WeChat cover/illustration | Originality, hierarchy | Philosophy alignment | Functionality (single image, no interaction) |
| Infographic | Functionality, hierarchy | Craft | Originality (accuracy first) |
| PPT / Keynote | Hierarchy, functionality | Craft | Originality (clarity first) |
| PDF / whitepaper | Craft, functionality | Hierarchy | Originality (professionalism first) |
| Landing page / website | Functionality, hierarchy | Originality | — (full requirements) |
| App UI | Functionality, craft | Hierarchy | Philosophy alignment (usability first) |
| Xiaohongshu image | Originality, hierarchy | Philosophy alignment | Craft (mood first) |

---

## Top 10 Common Design Issues

### 1. AI Tech Cliché
**Issue**: gradient orbs, digital rain, blue circuit boards, robot faces
**Why it's a problem**: viewers are visually fatigued by these and can't distinguish you from anyone else
**Fix**: replace literal symbols with abstract metaphors (e.g. use a "dialogue" metaphor instead of a chat-bubble icon)

### 2. Insufficient Type-Size Hierarchy
**Issue**: heading and body too close in size (<2.5×)
**Why it's a problem**: viewers can't quickly locate key info
**Fix**: heading at least 3× body (e.g. body 16px → heading 48-64px)

### 3. Too Many Colors
**Issue**: 5+ colors in use, no hierarchy
**Why it's a problem**: visually chaotic, weak brand feel
**Fix**: limit to 1 primary + 1 secondary + 1 accent + grayscale

### 4. Inconsistent Spacing
**Issue**: arbitrary spacing between elements; no system
**Why it's a problem**: looks unprofessional; visual rhythm is chaotic
**Fix**: establish an 8pt grid (use only 8 / 16 / 24 / 32 / 48 / 64px for spacing)

### 5. Insufficient Whitespace
**Issue**: every space filled with content
**Why it's a problem**: information crowding causes reading fatigue, actually reducing communication efficiency
**Fix**: whitespace should be at least 40% of total area (60%+ for minimal styles)

### 6. Too Many Fonts
**Issue**: 3+ typefaces in use
**Why it's a problem**: visual noise; weakens unity
**Fix**: at most 2 typefaces (1 heading + 1 body); create variation with weight and size

### 7. Inconsistent Alignment
**Issue**: some left-aligned, some centered, some right-aligned
**Why it's a problem**: breaks the sense of visual order
**Fix**: pick one alignment (left recommended); apply globally

### 8. Decoration Over Content
**Issue**: background patterns / gradients / shadows steal the show from main content
**Why it's a problem**: priorities reversed; users came for info, not decoration
**Fix**: "If I delete this decoration, does the design get worse?" If not, delete

### 9. Cyber Neon Overuse
**Issue**: deep-blue background (#0D1117) + neon glow effects
**Why it's a problem**: a default aesthetic forbidden zone (this skill's taste baseline) and one of the biggest clichés — users may override per their brand
**Fix**: choose a more recognizable palette (refer to the 20 styles' color systems)

### 10. Information Density Doesn't Match the Medium
**Issue**: a whole page of text on a PPT slide / 10 elements crammed into a cover image
**Why it's a problem**: different media have different optimal info densities
**Fix**:
- PPT: one core point per slide
- Cover: one visual focal point
- Infographic: layered display
- PDF: can be denser, but needs clear navigation

---

## Critique Output Template

```
## Design Critique Report

**Overall Score**: X.X/10 [Excellent (8+) / Good (6-7.9) / Needs Improvement (4-5.9) / Failing (<4)]

**Sub-scores**:
- Philosophy alignment: X/10 [one-line note]
- Visual hierarchy: X/10 [one-line note]
- Craft: X/10 [one-line note]
- Functionality: X/10 [one-line note]
- Originality: X/10 [one-line note]

### Strengths (Keep)
- [Point out what's done well, in design language]

### Issues (Fix)
[Sorted by severity]

**1. [Issue name]** — ⚠️ critical / ⚡ important / 💡 nice-to-have
- Current: [describe the status quo]
- Issue: [why it's a problem]
- Fix: [specific action, with values]

### Quick Wins
If you only have 5 minutes, do these 3:
- [ ] [Highest-impact fix]
- [ ] [Second most important]
- [ ] [Third]
```

---

**Version**: v1.0
**Updated**: 2026-02-13

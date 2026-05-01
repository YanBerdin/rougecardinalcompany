# Editable PPTX Export: HTML Hard Constraints + Sizing Decisions + Common Errors

This document covers the path of using `scripts/html2pptx.js` + `pptxgenjs` to translate HTML element-by-element into truly editable PowerPoint text boxes. It is also the only path supported by `export_deck_pptx.mjs`.

> **Core premise**: To go this route, the HTML must be written to follow the 4 constraints below from the very first line. **Don't write it first and convert later** — after-the-fact remediation will trigger 2-3 hours of rework (real-world experience from the 2026-04-20 Options Private Board project).
>
> For scenarios that prioritize visual freedom (animations / web components / CSS gradients / complex SVGs), use the PDF path instead (`export_deck_pdf.mjs` / `export_deck_stage_pdf.mjs`). **Don't** expect pptx export to give you both visual fidelity and editability — that's a physical constraint of the PPTX file format itself (see "Why the 4 constraints aren't a bug but a physical constraint" at the end).

---

## Canvas size: use 960×540pt (LAYOUT_WIDE)

PPTX units are **inch** (physical size), not px. Decision principle: the body's computedStyle dimensions must **match the presentation layout's inch dimensions** (±0.1", strictly enforced by `validateDimensions` in `html2pptx.js`).

### Comparison of 3 candidate sizes

| HTML body | Physical size | Corresponding PPT layout | When to choose |
|---|---|---|---|
| **`960pt × 540pt`** | **13.333″ × 7.5″** | **pptxgenjs `LAYOUT_WIDE`** | ✅ **Default recommendation** (modern PowerPoint 16:9 standard) |
| `720pt × 405pt` | 10″ × 5.625″ | Custom | Only when the user specifies the "old PowerPoint Widescreen" template |
| `1920px × 1080px` | 20″ × 11.25″ | Custom | ❌ Non-standard size; fonts look unusually small when projected |

**Don't think of HTML size as resolution.** PPTX is a vector document; body dimensions determine **physical size**, not clarity. An oversized body (20″×11.25″) won't make text clearer — it just makes the pt font size relatively smaller against the canvas, which actually looks worse when projected/printed.

### Three equivalent body declarations

```css
body { width: 960pt;  height: 540pt; }    /* Clearest, recommended */
body { width: 1280px; height: 720px; }    /* Equivalent, px convention */
body { width: 13.333in; height: 7.5in; }  /* Equivalent, inch intuition */
```

Matching pptxgenjs code:

```js
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, no customization needed
```

---

## 4 hard constraints (violations cause direct errors)

`html2pptx.js` translates the HTML's DOM element-by-element into PowerPoint objects. PowerPoint's format constraints projected onto HTML = the 4 rules below.

### Rule 1: Text cannot be placed directly inside DIV — must be wrapped in `<p>` or `<h1>`-`<h6>`

```html
<!-- ❌ Wrong: text directly in div -->
<div class="title">Q3 Revenue Growth 23%</div>

<!-- ✅ Correct: text inside <p> or <h1>-<h6> -->
<div class="title"><h1>Q3 Revenue Growth 23%</h1></div>
<div class="body"><p>New users are the main driver</p></div>
```

**Why**: PowerPoint text must live inside a text frame, and text frames correspond to paragraph-level HTML elements (p/h*/li). A bare `<div>` has no corresponding text container in PPTX.

**You also can't use `<span>` to carry primary text** — span is an inline element and can't independently align as a text box. span can only be **embedded inside p/h\*** for local styling (bold, color change).

### Rule 2: CSS gradients are not supported — only solid colors

```css
/* ❌ Wrong */
background: linear-gradient(to right, #FF6B6B, #4ECDC4);

/* ✅ Correct: solid color */
background: #FF6B6B;

/* ✅ If multi-color stripes are required, use flex children each with its own solid color */
.stripe-bar { display: flex; }
.stripe-bar div { flex: 1; }
.red   { background: #FF6B6B; }
.teal  { background: #4ECDC4; }
```

**Why**: PowerPoint's shape fill only supports solid/gradient-fill, but pptxgenjs's `fill: { color: ... }` only maps to solid. Going through PowerPoint's native gradient requires writing different structure, which the toolchain doesn't currently support.

### Rule 3: Background/border/shadow can only go on DIVs, not on text tags

```html
<!-- ❌ Wrong: <p> has background -->
<p style="background: #FFD700; border-radius: 4px;">Key content</p>

<!-- ✅ Correct: outer div carries background/border, <p> only handles text -->
<div style="background: #FFD700; border-radius: 4px; padding: 8pt 12pt;">
  <p>Key content</p>
</div>
```

**Why**: In PowerPoint, shapes (rectangles/rounded rectangles) and text frames are two different objects. HTML's `<p>` only translates to a text frame; background/border/shadow belong to a shape — they must be written on the **div wrapping the text**.

### Rule 4: DIVs cannot use `background-image` — use `<img>` tags

```html
<!-- ❌ Wrong -->
<div style="background-image: url('chart.png')"></div>

<!-- ✅ Correct -->
<img src="chart.png" style="position: absolute; left: 50%; top: 20%; width: 300pt; height: 200pt;" />
```

**Why**: `html2pptx.js` only extracts image paths from `<img>` elements; it does not parse CSS `background-image` URLs.

---

## Path A HTML template skeleton

Each slide is an independent HTML file, scope-isolated from the others (avoiding the CSS pollution of single-file decks).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 960pt; height: 540pt;           /* ⚠️ Match LAYOUT_WIDE */
    font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
    background: #FEFEF9;                    /* Solid color, no gradients */
    overflow: hidden;
  }
  /* DIV handles layout/background/border */
  .card {
    position: absolute;
    background: #1A4A8A;                    /* Background on DIV */
    border-radius: 4pt;
    padding: 12pt 16pt;
  }
  /* Text tags only handle font styling — no background/border */
  .card h2 { font-size: 24pt; color: #FFFFFF; font-weight: 700; }
  .card p  { font-size: 14pt; color: rgba(255,255,255,0.85); }
</style>
</head>
<body>

  <!-- Title area: outer div for positioning, inner text tags -->
  <div style="position: absolute; top: 40pt; left: 60pt; right: 60pt;">
    <h1 style="font-size: 36pt; color: #1A1A1A; font-weight: 700;">Use assertion sentences for titles, not topic words</h1>
    <p style="font-size: 16pt; color: #555555; margin-top: 10pt;">Subtitle adds supplementary explanation</p>
  </div>

  <!-- Content card: div handles background, h2/p handle text -->
  <div class="card" style="top: 130pt; left: 60pt; width: 240pt; height: 160pt;">
    <h2>Point one</h2>
    <p>Brief explanatory text</p>
  </div>

  <!-- List: use ul/li, don't manually add • symbols -->
  <div style="position: absolute; top: 320pt; left: 60pt; width: 540pt;">
    <ul style="font-size: 16pt; color: #1A1A1A; padding-left: 24pt; list-style: disc;">
      <li>First point</li>
      <li>Second point</li>
      <li>Third point</li>
    </ul>
  </div>

  <!-- Illustration: use <img> tag, not background-image -->
  <img src="illustration.png" style="position: absolute; right: 60pt; top: 110pt; width: 320pt; height: 240pt;" />

</body>
</html>
```

---

## Common errors quick reference

| Error message | Cause | Fix |
|---------|------|---------|
| `DIV element contains unwrapped text "XXX"` | Bare text inside div | Wrap text in `<p>` or `<h1>`-`<h6>` |
| `CSS gradients are not supported` | Used linear/radial-gradient | Switch to solid color or use flex children for segments |
| `Text element <p> has background` | `<p>` tag has a background color | Wrap with `<div>` to carry the background; `<p>` only contains text |
| `Background images on DIV elements are not supported` | div uses background-image | Switch to `<img>` tag |
| `HTML content overflows body by Xpt vertically` | Content exceeds 540pt | Reduce content or shrink font size, or use `overflow: hidden` to clip |
| `HTML dimensions don't match presentation layout` | Body size doesn't match pres layout | Use `960pt × 540pt` body with `LAYOUT_WIDE`; or defineLayout with custom size |
| `Text box "XXX" ends too close to bottom edge` | A large-font `<p>` is < 0.5 inch from the body bottom edge | Move it up; leave enough bottom margin — PPT's bottom area gets partially obscured anyway |

---

## Basic workflow (3 steps to PPTX)

### Step 1: Write per-page independent HTML following the constraints

```
MyDeck/
├── slides/
│   ├── 01-cover.html    # Each file is a complete 960×540pt HTML
│   ├── 02-agenda.html
│   └── ...
└── illustration/        # All images referenced by <img>
    ├── chart1.png
    └── ...
```

### Step 2: Write build.js calling `html2pptx.js`

```js
const pptxgen = require('pptxgenjs');
const html2pptx = require('../scripts/html2pptx.js');  // Script from this skill

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, matching HTML's 960×540pt

  const slides = ['01-cover.html', '02-agenda.html', '03-content.html'];
  for (const file of slides) {
    await html2pptx(`./slides/${file}`, pres);
  }

  await pres.writeFile({ fileName: 'deck.pptx' });
})();
```

### Step 3: Open and inspect

- Open the exported PPTX in PowerPoint/Keynote
- Double-clicking any text should let you edit it directly (if it's an image, Rule 1 was violated)
- Verify overflow: each page should be within the body bounds, not clipped

---

## This path vs. other options (when to choose what)

| Need | Choose |
|------|------|
| Colleagues will edit text in the PPTX / send to non-technical people for further editing | **This path** (editable, requires writing HTML to the 4 constraints from scratch) |
| Just for presentation / archive, no further edits | `export_deck_pdf.mjs` (multi-file) or `export_deck_stage_pdf.mjs` (single-file deck-stage), produces vector PDF |
| Visual freedom prioritized (animations, web components, CSS gradients, complex SVGs), accept non-editable | **PDF** (as above) — PDF is faithful and cross-platform, more suitable than "image-based PPTX" |

**Never run html2pptx forcibly on visually-rich HTML** — empirically, visual-driven HTML has a < 30% pass rate, and reworking the remaining pages takes longer than rewriting from scratch. For these scenarios, output PDF, not forced PPTX.

---

## Fallback: existing visual draft but user insists on editable PPTX

Occasionally you'll encounter this scenario: you/the user have already written a visually-driven HTML (gradients, web components, complex SVGs all used), where PDF would be the natural fit, but the user explicitly says "no, it must be an editable PPTX."

**Don't run `html2pptx` forcibly hoping it'll pass** — empirically, visual-driven HTML has a <30% pass rate on html2pptx, with the remaining 70% erroring out or distorting. The correct fallback is:

### Step 1 · State the limitations first (transparent communication)

In one sentence, tell the user three things:

> "Your current HTML uses [list specifics: gradients / web components / complex SVGs / ...]. Direct conversion to editable PPTX will fail. I have two options:
> - A. **Output PDF** (recommended) — visual 100% preserved, recipient can view and print but cannot edit text
> - B. **Using the visual draft as a blueprint, rewrite an editable HTML version** (preserve color/layout/copy design decisions, but reorganize HTML structure following the 4 hard constraints, **sacrificing** gradients, web components, complex SVGs, and other visual capabilities) → then export as editable PPTX
>
> Which do you want?"

Don't downplay option B — explicitly state **what will be lost**. Let the user make the trade-off.

### Step 2 · If user chooses B: AI rewrites proactively, doesn't ask user to do it

The doctrine here is: **the user provides design intent, you translate it into compliant implementation**. Don't make the user learn the 4 hard constraints and rewrite themselves.

Principles when rewriting:
- **Preserve**: color system (primary/secondary/neutral), information hierarchy (title/subtitle/body/annotation), core copy, layout skeleton (top-middle-bottom / left-right columns / grid), page rhythm
- **Downgrade**: CSS gradient → solid color or flex segments, web component → paragraph-level HTML, complex SVG → simplified `<img>` or solid geometry, shadow → remove or reduce to very weak, custom font → align with system fonts
- **Rewrite**: bare text → wrap in `<p>` / `<h*>`, `background-image` → `<img>` tag, background/border on `<p>` → carried by outer div

### Step 3 · Produce comparison checklist (transparent delivery)

After rewriting, give the user a before/after comparison so they know which visual details were simplified:

```
Original design → editable version adjustment
- Title area purple gradient → primary color #5B3DE8 solid background
- Data card shadow → removed (replaced with 2pt border)
- Complex SVG line chart → simplified to <img> PNG (generated from HTML screenshot)
- Hero web component animation → static first frame (web components can't be translated)
```

### Step 4 · Export & dual-format delivery

- `editable` version HTML → run `scripts/export_deck_pptx.mjs` to produce editable PPTX
- **Recommended**: also keep the original visual draft → run `scripts/export_deck_pdf.mjs` to produce hi-fi PDF
- Dual-format delivery to user: visual-draft PDF + editable PPTX, each serving its purpose

### When to refuse option B outright

In some scenarios the rewrite cost is too high; you should advise the user to abandon editable PPTX:
- The HTML's core value is animation or interaction (after rewrite only the static first frame remains; 50%+ information loss)
- More than 30 pages, rewrite cost exceeds 2 hours
- Visual design depends heavily on precise SVG / custom filters (after rewrite it's almost unrelated to the original)

In this case tell the user: "The rewrite cost for this deck is too high. I recommend exporting PDF rather than PPTX. If the recipient really requires pptx format, then accept that visuals will be greatly simplified — would you like to switch to PDF?"

---

## Why the 4 constraints aren't a bug but a physical constraint

These 4 aren't because the `html2pptx.js` author was lazy — they are the **PowerPoint file format (OOXML) itself's constraints** projected onto HTML:

- Text in PPTX must live in a text frame (`<a:txBody>`), corresponding to paragraph-level HTML elements
- PPTX shapes and text frames are two separate objects; you can't draw background and write text on the same element
- PPTX shape fills have limited gradient support (only certain preset gradients, no support for arbitrary CSS gradient angles)
- PPTX picture objects must reference real image files, not CSS properties

After understanding this, **don't expect the tool to get smarter** — it's HTML that must adapt to PPTX format, not the other way around.

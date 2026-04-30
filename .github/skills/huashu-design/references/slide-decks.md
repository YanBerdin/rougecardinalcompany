# Slide Decks: HTML Slide Deck Production Spec

Building slide decks is a high-frequency design scenario. This document describes how to do it well — from architecture choice and per-slide design to the full export path for PDF / PPTX.

**This skill's coverage**:
- **HTML presentation version (the foundational artifact, always required by default)** → one HTML per slide + `assets/deck_index.html` aggregator; keyboard navigation and fullscreen presentation in the browser
- HTML → PDF export → `scripts/export_deck_pdf.mjs` / `scripts/export_deck_stage_pdf.mjs`
- HTML → editable PPTX export → `references/editable-pptx.md` + `scripts/html2pptx.js` + `scripts/export_deck_pptx.mjs` (requires HTML written under 4 hard constraints)

> **⚠️ HTML is the foundation; PDF / PPTX are derivatives.** Whatever the final delivery format, you **must** first build the HTML aggregate presentation (`index.html` + `slides/*.html`) — it's the "source" of the slide-deck artifact. PDF / PPTX are one-line export snapshots from the HTML.

> **Why HTML first**:
> - Best for the live presentation venue (project / share screen, fullscreen, keyboard navigation, no Keynote / PPT software dependency)
> - Each slide can be double-clicked open during development for verification — no re-export every time
> - It is the sole upstream of the PDF / PPTX export (avoids the "have to redo HTML after exporting" loop)
> - The deliverable can be "HTML + PDF" or "HTML + PPTX" pairs; the receiver picks whichever they prefer

> 2026-04-22 moxt brochure validation: after building the 13-page HTML + index.html aggregator, `export_deck_pdf.mjs` produced the PDF in one line, zero edits. The HTML version was itself a directly-presentable browser deliverable.

---

## 🛑 Confirm Delivery Format Before Starting (the Hardest Checkpoint)

**This decision precedes "single-file vs multi-file".** 2026-04-20 options private-board project validation: **not confirming the delivery format before starting = 2-3 hours of rework.**

### Decision Tree (HTML-first architecture)

All deliveries start from the same HTML aggregator (`index.html` + `slides/*.html`). The delivery format only determines the **HTML's authoring constraints** and the **export command**:

```
[Always default · required] HTML aggregate presentation (index.html + slides/*.html)
  │
   ├── only need browser presentation / local HTML archive   → done at this point; max visual freedom in the HTML
   │
   ├── also need PDF (print / share / archive)               → run export_deck_pdf.mjs, one-shot export
   │                                                            HTML authoring is free, no visual constraints
   │
   └── also need editable PPTX (colleague will edit text)    → write HTML to the 4 hard constraints from line one
                                                                run export_deck_pptx.mjs, one-shot export
                                                                give up gradients / web components / complex SVG
```

### Kickoff Script (Copy / Paste)

> Whatever the final delivery is — HTML, PDF or PPTX — I'll first build a browser-switchable, presentable HTML aggregate (`index.html` plus keyboard navigation). That's the always-default foundational artifact. On top of that I'll ask whether you also want a PDF / PPTX snapshot.
>
> Which export format do you need?
> - **HTML only** (presentation / archive) → fully visual freedom
> - **Also PDF** → same as above, plus one extra export command
> - **Also editable PPTX** (colleagues will edit text in PowerPoint) → I have to write HTML under 4 hard constraints from line one, sacrificing some visual capability (no gradients, no web components, no complex SVG).

### Why "Wanting PPTX = Going Through 4 Hard Constraints from the Start"

Editable PPTX requires `html2pptx.js` to translate the DOM element-by-element into PowerPoint objects. It needs **4 hard constraints**:

1. body fixed at 960pt × 540pt (matches `LAYOUT_WIDE`, 13.333″ × 7.5″, not 1920×1080px)
2. all text wrapped in `<p>` / `<h1>`-`<h6>` (no text directly inside a div, no `<span>` carrying primary text)
3. `<p>` / `<h*>` themselves cannot have background / border / shadow (put those on an outer div)
4. `<div>` cannot use `background-image` (use an `<img>` tag)
5. no CSS gradients, no web components, no complex SVG decoration

**This skill's default HTML has high visual freedom** — extensive spans, nested flex, complex SVG, web components (like `<deck-stage>`), CSS gradients — **almost none of which naturally satisfy html2pptx constraints** (empirically, throwing visual-driven HTML at html2pptx has a pass rate < 30%).

### Cost Comparison of Two Real Paths (2026-04-20 real pitfall)

| Path | Approach | Result | Cost |
|---|---|---|---|
| ❌ **Write free-form HTML, patch up PPTX afterward** | Single-file deck-stage with extensive SVG / span decoration | To get editable PPTX, only two routes left:<br>A. Hand-write hundreds of lines of pptxgenjs hardcoded coordinates<br>B. Rewrite all 17 HTML pages into Path A format | 2-3 hours of rework, plus the hand-written version's **maintenance cost is permanent** (every word change in HTML requires manual sync to PPTX) |
| ✅ **Write to Path A constraints from step one** | Per-slide HTML + 4 hard constraints + 960×540pt | One-line export to a 100%-editable PPTX, also presentable fullscreen in the browser (Path A HTML is standard browser-playable HTML) | 5 extra minutes per slide thinking "how to wrap text in `<p>`", zero rework |

### What About Mixed Deliverables

User says "I want HTML for presentation **and** editable PPTX" — **this isn't mixed**, it's PPTX requirements covering HTML requirements. HTML written to Path A is itself fullscreen-presentable in the browser (just add a `deck_index.html` aggregator). **No additional cost.**

User says "I want PPTX **and** animation / web components" — **this is a real conflict.** Tell the user: editable PPTX means giving up these visual capabilities. Make them pick; do not silently take the hand-written-pptxgenjs route (it becomes permanent maintenance debt).

### What If You Find Out You Need PPTX After the Fact (Emergency Salvage)

Rarely: HTML is already written when PPTX is required. Recommended **fallback flow** (full description in `references/editable-pptx.md` end "Fallback: existing visual draft but user insists on editable PPTX"):

1. **First choice: produce a PDF** (visuals 100% preserved, cross-platform, the receiver can view and print) — if the receiver's actual need is "presentation / archive", PDF is the best deliverable
2. **Second choice: AI rewrites a fresh editable HTML using the visual draft as the blueprint** → export editable PPTX — preserves color / layout / copy decisions, sacrifices gradients, web components, complex SVG
3. **Not recommended: hand-rebuild via pptxgenjs** — every position, font, alignment must be hand-tuned, high maintenance cost, and any later HTML word change requires manual re-sync

Always tell the user the choices and let them decide. **Never make hand-written pptxgenjs your first instinct** — it's the absolute last resort.

---

## 🛑 Before Mass-Producing: Build a 2-Slide Showcase to Lock the Grammar

**Whenever a deck is ≥ 5 slides, never write straight from page 1 to the end.** The correct sequence validated on 2026-04-22 moxt brochure:

1. Pick the **2 most visually divergent slide types** for a showcase (e.g. "cover" + "emotion / quote slide", or "cover" + "product showcase slide")
2. Screenshot, have the user confirm the grammar (masthead / typography / color / spacing / structure / Chinese-English bilingual ratio)
3. Once direction is approved, mass-produce the remaining N-2 pages, each reusing the established grammar
4. Once everything is done, assemble the HTML aggregate + PDF / PPTX derivatives

**Why**: writing 13 pages straight through → user says "wrong direction" = 13× rework. Showcase first → wrong direction = 2× rework. Once visual grammar is set, decision space for the remaining N pages collapses dramatically; only "where the content goes" remains.

**Showcase page selection principle**: pick the two most visually different pages. If those two pass = all the in-between states will pass.

| Deck Type | Recommended Showcase Pair |
|---|---|
| B2B brochure / product launch | Cover + content slide (philosophy / emotion slide) |
| Brand launch | Cover + product feature slide |
| Data report | Big data slide + analysis-conclusion slide |
| Tutorial deck | Chapter cover + concrete-knowledge-point slide |

---

## 📐 Publication-grade Grammar Template (moxt-validated, reusable)

Suitable for B2B brochure / product launch / long-report decks. Reusing this structure across pages = 13 pages of fully consistent visuals, zero rework.

### Per-page Skeleton

```
┌─ masthead (top strip + horizontal line) ────────────┐
│
│  ── kicker (green short bar + uppercase tag)
│
│  H1 (Chinese Noto Serif SC 900)
│  Key terms get the brand primary color individually
│
│  English subtitle (Lora italic, subtitle)
│  ─────────── divider ──────────
│
│  [actual content: two-column 60/40 / 2x2 grid / list]
│
└──
```

### Style Conventions (Copy Directly)

- **H1**: Chinese Noto Serif SC 900, 80-140px depending on content density; key terms get the brand primary color individually (don't paint everything)
- **English subtitle**: Lora italic 26-46px; brand-signature words (e.g. "AI team") bold + primary color italic
- **Body**: Noto Serif SC 17-21px, line-height 1.75-1.85
- **Accent emphasis**: bold + primary color on key words inside body, max 3 per page (any more loses anchor effect)
- **Background**: warm off-white #FAFAFA + ultra-light radial-gradient noise (`rgba(33,33,33,0.015)`) for paper feel

### Visual Lead Must Differentiate

If all 13 pages are "text + one screenshot" they get monotonous. **Rotate the visual-lead type per page**:

| Visual type | Best-fit section |
|---|---|
| Cover typography (big text + masthead + pillar) | Cover / chapter cover |
| Single-character portrait (oversize single momo etc.) | Introduce a single concept / character |
| Multi-character group / avatar cards in a row | Team / user case |
| Timeline-card progression | Show "long-term relationship" / "evolution" |
| Knowledge graph / connected node diagram | Show "collaboration" / "flow" |
| Before/After comparison cards + arrow between | Show "change" / "difference" |
| Product UI screenshot + outlined device frame | Concrete feature demo |
| Big-quote (half-page big text) | Emotion / problem / quote slide |
| Real-person avatar + quote card (2×2 or 1×4) | User testimonials / use cases |
| Big-text closer + URL pill button | CTA / closer |

---

## ⚠️ Common Pitfalls (moxt Real-world Summary)

### 1. Emoji doesn't render in Chromium / Playwright export

Chromium ships without color emoji fonts by default; emoji renders as empty squares in `page.pdf()` or `page.screenshot()`.

**Mitigation**: substitute Unicode glyphs (`✦` `✓` `✕` `→` `·` `—`) or switch to plain text ("Email · 23" instead of "📧 23 emails").

### 2. `export_deck_pdf.mjs` errors with `Cannot find package 'playwright'`

Reason: ESM module resolution walks up from the script's directory looking for `node_modules`. The script lives in `~/.claude/skills/huashu-design/scripts/`, where there are no dependencies.

**Mitigation**: copy the script into the deck project (e.g. `brochure/build-pdf.mjs`), run `npm install playwright pdf-lib` at the project root, then `node build-pdf.mjs --slides slides --out output/deck.pdf`.

### 3. Google Fonts hasn't finished loading at screenshot time → Chinese renders as system default Heiti

Before Playwright screenshot / PDF, at least `wait-for-timeout=3500` to let webfont download and paint. Or self-host fonts to `shared/fonts/` to reduce network reliance.

### 4. Information density imbalance: content slides packed too full

The first version of the moxt philosophy slide had 2×2 = 4 sections + 3 tenets at the bottom = 7 blocks of content; squeezed and repetitive. Switching to 1×3 = 3 sections immediately restored breathing room.

**Mitigation**: keep each slide to "1 core message + 3-4 supporting points + 1 visual lead"; anything more splits to a new slide. **Less is more** — viewers spend 10 seconds per slide; giving them 1 memory hook beats 4.

---

## 🛑 Architecture First: Single File or Multi-file?

**This choice is the first step in building a deck; getting it wrong leads to repeated pitfalls. Read this section before starting.**

### Two Architectures Compared

| Dimension | Single file + `deck_stage.js` | **Multi-file + `deck_index.html` aggregator** |
|------|--------------------------|--------------------------------------|
| Code structure | One HTML, every slide is a `<section>` | Each slide is its own HTML; `index.html` aggregates via iframe |
| CSS scope | ❌ Global; one slide's styles can affect all | ✅ Naturally isolated; each iframe is its own world |
| Verification granularity | ❌ Need JS goTo to switch to a slide | ✅ Open any single-slide file by double-clicking |
| Parallel development | ❌ One file; multi-agent edits collide | ✅ Multiple agents can edit different slides in parallel, zero-conflict merges |
| Debug difficulty | ❌ One CSS error and the whole deck breaks | ✅ A single-page error only affects itself |
| Embedded interaction | ✅ Cross-slide shared state is trivial | 🟡 Iframes need postMessage |
| Print PDF | ✅ Built in | ✅ Aggregator iterates iframes on beforeprint |
| Keyboard navigation | ✅ Built in | ✅ Built into the aggregator |

### Pick Which? (Decision Tree)

```
│ Q: how many slides will the deck have?
├── ≤ 10 pages, needs in-deck animation or cross-slide interaction, pitch deck → single file
└── ≥ 10 pages, academic lecture, courseware, long deck, multi-agent parallel → multi-file (recommended)
```

**Default to the multi-file path.** It's not a "fallback"; it's **the main path for long decks and team collaboration**. Reason: every advantage of the single-file architecture (keyboard navigation, print, scaling) is also in multi-file, while multi-file's scope isolation and per-slide verifiability cannot be retrofitted to single-file.

### Why Is This Rule So Hard? (Real Incident Log)

The single-file architecture hit four pitfalls in a row when producing the AI-psychology lecture deck:

1. **CSS specificity overrides**: `.emotion-slide { display: grid }` (specificity 10) overrode `deck-stage > section { display: none }` (specificity 2), causing all slides to render simultaneously and overlap.
2. **Shadow DOM slot rules suppressed by outer CSS**: `::slotted(section) { display: none }` couldn't beat outer-rule overrides; sections refused to hide.
3. **localStorage + hash navigation race**: after refresh, the page didn't go to the hash, it stopped at the old localStorage position.
4. **High verification cost**: had to call `page.evaluate(d => d.goTo(n))` to screenshot a specific slide — twice as slow as `goto(file://.../slides/05-X.html)`, and frequently errored.

All root-caused to **a single global namespace** — multi-file architecture eliminates these problems at the physical level.

---

## Path A (Default): Multi-file Architecture

### Directory Structure

```
MyDeck/
├── index.html              # copied from assets/deck_index.html, edit MANIFEST
├── shared/
│   ├── tokens.css          # shared design tokens (palette / type scale / common chrome)
│   └── fonts.html          # <link> imports for Google Fonts (each slide includes)
└── slides/
    ├── 01-cover.html       # each file is a complete 1920×1080 HTML
    ├── 02-agenda.html
    ├── 03-problem.html
    └── ...
```

### Per-slide Template Skeleton

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>P05 · Chapter Title</title>
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
<link rel="stylesheet" href="../shared/tokens.css">
<style>
  /* Styles unique to this slide. Any class name here cannot pollute another slide. */
  body { padding: 120px; }
  .my-thing { ... }
</style>
</head>
<body>
  <!-- 1920×1080 content (body's width/height locked in tokens.css) -->
  <div class="page-header">...</div>
  <div>...</div>
  <div class="page-footer">...</div>
</body>
</html>
```

**Key constraints**:
- `<body>` is the canvas — lay out directly on it. Don't wrap in `<section>` or other wrapper.
- `width: 1920px; height: 1080px` is locked by the `body` rule in `shared/tokens.css`.
- Import `shared/tokens.css` for shared design tokens (palette, type scale, page-header / footer, etc.).
- Each slide writes its own font `<link>` (separate font imports are cheap and ensure each slide is independently openable).

### Aggregator: `deck_index.html`

**Copy directly from `assets/deck_index.html`**. The only thing you change is one place — the `window.DECK_MANIFEST` array, listing each slide file and a human-readable label in order:

```js
window.DECK_MANIFEST = [
  { file: "slides/01-cover.html",    label: "Cover" },
  { file: "slides/02-agenda.html",   label: "Agenda" },
  { file: "slides/03-problem.html",  label: "Problem statement" },
  // ...
];
```

The aggregator already includes: keyboard navigation (←/→/Home/End/number keys/P print), scale + letterbox, bottom-right counter, localStorage memory, hash deep-linking, print mode (iterate iframes and emit pages to PDF).

### Per-slide Verification (the killer advantage of multi-file)

Each slide is its own HTML. **Build one, double-click it open in the browser**:

```bash
open slides/05-personas.html
```

Playwright screenshots also `goto(file://.../slides/05-personas.html)` directly — no JS jump, no cross-slide CSS interference. This drops the cost of "edit a little, verify a little" to near zero.

### Parallel Development

Hand each slide to a different agent and run them simultaneously — HTML files are independent, no merge conflicts. Long decks built this way compress production time to 1/N.

### What Belongs in `shared/tokens.css`

Only things that are **truly cross-slide common**:

- CSS variables (palette, type scale, spacing scale)
- Canvas locks like `body { width: 1920px; height: 1080px; }`
- Chrome that's identical on every slide, like `.page-header` / `.page-footer`

**Don't** stuff per-slide layout classes in here — that regresses to single-file's global pollution.

---

## Path B (Small Decks): Single File + `deck_stage.js`

For decks ≤ 10 pages, requiring cross-slide shared state (e.g. one React tweaks panel controlling all slides), or pitch-deck demos requiring extreme compactness.

### Basic Usage

1. Read the contents of `assets/deck_stage.js` and embed in HTML's `<script>` (or `<script src="deck_stage.js">`)
2. Wrap slides in `<deck-stage>` inside body
3. 🛑 **The script tag must come after `</deck-stage>`** (see hard-constraint below)

```html
<body>

  <deck-stage>
    <section>
      <h1>Slide 1</h1>
    </section>
    <section>
      <h1>Slide 2</h1>
    </section>
  </deck-stage>

  <!-- ✅ correct: script after deck-stage -->
  <script src="deck_stage.js"></script>

</body>
```

### 🛑 Script Position Hard Constraint (2026-04-20 real pitfall)

**Don't put `<script src="deck_stage.js">` in `<head>`.** Even though it can define `customElements` from there, the parser fires `connectedCallback` the moment it sees the `<deck-stage>` start tag — at which point the child `<section>`s aren't parsed yet, `_collectSlides()` gets an empty array, the counter shows `1 / 0`, and all slides render stacked on top of each other.

**Three compliant patterns** (pick any):

```html
<!-- ✅ most recommended: script after </deck-stage> -->
</deck-stage>
<script src="deck_stage.js"></script>

<!-- ✅ also OK: script in head with defer -->
<head><script src="deck_stage.js" defer></script></head>

<!-- ✅ also OK: module scripts are deferred by nature -->
<head><script src="deck_stage.js" type="module"></script></head>
```

`deck_stage.js` itself includes `DOMContentLoaded` deferred-collection defense, so even script-in-head won't fully blow up — but `defer` or placement at body bottom is still the cleaner approach, avoiding reliance on the defensive branch.

### ⚠️ Single-file Architecture's CSS Trap (Must Read)

Single-file's most common pitfall — **the `display` property is hijacked by per-slide styles**.

Common error pattern 1 (writing display: flex directly on section):

```css
/* ❌ External CSS specificity 2; overrides shadow DOM's ::slotted(section){display:none} (also 2) */
deck-stage > section {
  display: flex;            /* All slides will render simultaneously stacked! */
  flex-direction: column;
  padding: 80px;
  ...
}
```

Common error pattern 2 (section has a higher-specificity class):

```css
.emotion-slide { display: grid; }   /* specificity: 10, worse */
```

Both make **all slides render stacked simultaneously** — the counter may show `1 / 10` pretending to be fine, but visually slide 1 is on top of slide 2 on top of slide 3.

### ✅ Starter CSS (copy at start, no pitfalls)

**Section itself** only handles "visible / hidden"; **layout (flex / grid etc.) lives on `.active`**:

```css
/* section only defines non-display common styles */
deck-stage > section {
  background: var(--paper);
  padding: 80px 120px;
  overflow: hidden;
  position: relative;
  /* ⚠️ Do not write display here! */
}

/* Lock "non-active = hidden" — specificity + weight double safety */
deck-stage > section:not(.active) {
  display: none !important;
}

/* Only the active slide gets the desired display + layout */
deck-stage > section.active {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Print mode: all slides must show; override :not(.active) */
@media print {
  deck-stage > section { display: flex !important; }
  deck-stage > section:not(.active) { display: flex !important; }
}
```

Alternative: **put per-slide flex / grid on an inner wrapper `<div>`**; the section itself stays a `display: block/none` switch. This is the cleanest approach:

```html
<deck-stage>
  <section>
    <div class="slide-content flex-layout">...</div>
  </section>
</deck-stage>
```

### Custom Dimensions

```html
<deck-stage width="1080" height="1920">
  <!-- 9:16 vertical -->
</deck-stage>
```

---

## Slide Labels

Both deck_stage and deck_index put a label on each slide (shown in the counter). Give them **more meaningful** labels:

**Multi-file**: in `MANIFEST` write `{ file, label: "04 Problem Statement" }`
**Single-file**: on the section, add `<section data-screen-label="04 Problem Statement">`

**Key: slide numbering starts at 1, not 0.**

When the user says "slide 5" they mean the 5th slide, never the array position `[4]`. Humans don't speak 0-indexed.

---

## Speaker Notes

**Off by default**, only when the user explicitly asks.

With speaker notes you can drop the on-slide text to a minimum and focus on impactful visuals — notes carry the full script.

### Format

**Multi-file**: in `index.html`'s `<head>`:

```html
<script type="application/json" id="speaker-notes">
[
  "Slide 1 script...",
  "Slide 2 script...",
  "..."
]
</script>
```

**Single-file**: same location.

### Notes Writing Tips

- **Complete**: not an outline — actual spoken words
- **Conversational**: as you'd speak, not written prose
- **Aligned**: array index N corresponds to slide N
- **Length**: 200-400 words is best
- **Emotion line**: mark stresses, pauses, emphasis points

---

## Slide Design Patterns

### 1. Establish a System (required)

After exploring design context, **state the system you'll use verbally**:

```markdown
Deck system:
- Background colors: at most 2 (90% white + 10% dark section divider)
- Type: display in Instrument Serif, body in Geist Sans
- Rhythm: section dividers full-bleed colored + white text; normal slides white background
- Imagery: hero slides full-bleed photo, data slides chart

I'll work to this system; flag anything off.
```

Move on once the user confirms.

### 2. Common Slide Layouts

- **Title slide**: solid background + huge title + subtitle + author / date
- **Section divider**: colored background + section number + section title
- **Content slide**: white background + title + 1-3 bullet points
- **Data slide**: title + big chart / number + short caption
- **Image slide**: full-bleed photo + small caption at bottom
- **Quote slide**: white space + huge quote + attribution
- **Two-column**: left/right comparison (vs / before-after / problem-solution)

Use at most 4-5 layouts in one deck.

### 3. Scale (worth repeating)

- Body minimum **24px**, ideal 28-36px
- Title **60-120px**
- Hero text **180-240px**
- Slides are read from 10 meters away — type must be big enough

### 4. Visual Rhythm

A deck needs **intentional variety**:

- Color rhythm: mostly white background + occasional colored section divider + occasional dark segments
- Density rhythm: a few text-heavy + a few image-heavy + a few open-quote pages
- Scale rhythm: regular titles + occasional giant hero type

**Don't make every slide look the same** — that's a PPT template, not design.

### 5. Spatial Breathing (mandatory for data-dense slides)

**The most common rookie mistake**: cram every available piece of information into one page.

Information density ≠ effective communication. Be especially restrained on academic / lecture decks:

- List / matrix slides: don't render N elements all at the same size. Use **primary / secondary layering** — enlarge the 5 you'll talk about today as protagonists, shrink the remaining 16 as background hints.
- Big-number slides: the number itself is the visual lead. Don't let surrounding caption exceed 3 lines, or the eye ping-pongs.
- Quote slides: separate the quote and attribution with whitespace; don't glue them together.

Self-audit on "is the data actually the lead?" and "is the text squeezed together?"; revise until the whitespace makes you slightly uneasy.

---

## Print to PDF

**Multi-file**: `deck_index.html` already handles `beforeprint`, emitting per-page output.

**Single-file**: `deck_stage.js` does the same.

Print styles are pre-written; you don't need to write extra `@media print` CSS.

---

## Export to PPTX / PDF (Self-serve Scripts)

HTML-first is first-class. But users frequently need PPTX / PDF deliveries. Two general-purpose scripts are provided that **work for any multi-file deck**, in `scripts/`:

### `export_deck_pdf.mjs` — Vector PDF Export (multi-file architecture)

```bash
node scripts/export_deck_pdf.mjs --slides <slides-dir> --out deck.pdf
```

**Features**:
- Text **stays vector** (copyable, searchable)
- 100% visual fidelity (Playwright's bundled Chromium renders, then prints)
- **No HTML edits required**
- Each slide gets its own `page.pdf()`, then merged with `pdf-lib`

**Dependency**: `npm install playwright pdf-lib`

**Limitation**: text in the PDF can't be re-edited — go back to the HTML for that.

### `export_deck_stage_pdf.mjs` — Single-file deck-stage Architecture Specific ⚠️

**When to use**: the deck is a single HTML file + `<deck-stage>` web component wrapping N `<section>`s (i.e. Path B architecture). Here the `export_deck_pdf.mjs` "one `page.pdf()` per HTML" model doesn't work; this dedicated script is required.

```bash
node scripts/export_deck_stage_pdf.mjs --html deck.html --out deck.pdf
```

**Why we can't reuse export_deck_pdf.mjs** (2026-04-20 real-pitfall log):

1. **Shadow DOM beats `!important`**: deck-stage's shadow CSS has `::slotted(section) { display: none }` (only the active one is `display: block`). Even adding `@media print { deck-stage > section { display: block !important } }` in light DOM can't override it — once `page.pdf()` triggers print media, Chromium's final render keeps only the active slide, and the **whole PDF has 1 page** (the current active slide repeated).

2. **Loop-goto each slide still emits 1 page each**: the intuitive fix "navigate to each `#slide-N` then `page.pdf({pageRanges:'1'})`" also fails — even after `deck-stage > section { display: block }` overrides outside shadow DOM, the final render is always the first section in the list (not the one you navigated to). Result: 17 loop iterations produced 17 P01 covers.

3. **Absolute children spilling onto the next page**: even after successfully rendering all sections, if the section is `position: static` its absolute-positioned `cover-footer` / `slide-footer` will position relative to the initial containing block — when print forces section to 1080px height, the absolute footer can be pushed onto the next page (PDF has 1 more page than section count, the extra page contains only an orphan footer).

**Fix strategy** (the script implements this):

```js
// After opening the HTML, page.evaluate to lift sections out of the deck-stage slot
// and append them under a regular div in body, with inline style ensuring position:relative + fixed dimensions
await page.evaluate(() => {
  const stage = document.querySelector('deck-stage');
  const sections = Array.from(stage.querySelectorAll(':scope > section'));
  document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
      @page { size: 1920px 1080px; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; }
      deck-stage { display: none !important; }
    `,
  }));
  const container = document.createElement('div');
  sections.forEach(s => {
    s.style.cssText = 'width:1920px!important;height:1080px!important;display:block!important;position:relative!important;overflow:hidden!important;page-break-after:always!important;break-after:page!important;background:#F7F4EF;margin:0!important;padding:0!important;';
    container.appendChild(s);
  });
  // Disable page-break on the last slide to avoid a trailing empty page
  sections[sections.length - 1].style.pageBreakAfter = 'auto';
  sections[sections.length - 1].style.breakAfter = 'auto';
  document.body.appendChild(container);
});

await page.pdf({ width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
```

**Why this works**:
- Pulling sections out of the shadow DOM slot into a regular div in light DOM completely bypasses `::slotted(section) { display: none }`
- Inline `position: relative` makes absolute children position relative to the section, no overflow
- `page-break-after: always` makes the browser print each section on its own page
- `:last-child` no-page-break prevents the trailing empty page

**Note when verifying with `mdls -name kMDItemNumberOfPages`**: macOS Spotlight metadata is cached; after rewriting a PDF run `mdimport file.pdf` to force-refresh, otherwise it shows the old page count. Use `pdfinfo` or `pdftoppm` to count files for the real number.

---

### `export_deck_pptx.mjs` — Editable PPTX Export

```bash
# Single mode: text frames are natively editable (fonts fall back to system fonts)
node scripts/export_deck_pptx.mjs --slides <dir> --out deck.pptx
```

How it works: `html2pptx` reads computedStyle element-by-element and translates the DOM into PowerPoint objects (text frame / shape / picture). Text becomes a real text box, double-click-editable in PPT.

**Hard constraints** (HTML must satisfy, otherwise the slide is skipped — full description in `references/editable-pptx.md`):
- All text must be inside `<p>` / `<h1>`-`<h6>` / `<ul>` / `<ol>` (no naked text in a div)
- `<p>` / `<h*>` themselves cannot have background / border / shadow (put on outer div)
- No `::before` / `::after` to insert decorative text (pseudo-elements can't be lifted)
- inline elements (span / em / strong) cannot have margin
- No CSS gradient (cannot render)
- div cannot use `background-image` (use `<img>`)

The script has a built-in **automatic preprocessor** — it auto-wraps "naked text in a leaf div" into a `<p>` (preserving classes). This solves the most common violation (naked text). Other violations (border on p, margin on span, etc.) still require source-HTML compliance.

**Font fallback caveat**:
- Playwright uses webfonts to measure text-box dimensions; PowerPoint / Keynote uses local fonts to render
- Differences cause **overflow or misalignment** — eyeball every slide
- Recommend installing the HTML fonts on the target machine, or fallback to `system-ui`

**Don't take this path for visual-priority scenarios** → use `export_deck_pdf.mjs` for a PDF instead. PDF is 100% visually faithful, vector, cross-platform, text-searchable — that's the real home for visual-priority decks, not "an uneditable compromise".

### Make HTML Export-friendly from Day One

The most stable deck for export performance: **write HTML to the 4 hard editable constraints from the start**. Then `export_deck_pptx.mjs` passes everything cleanly. The extra cost is small:

```html
<!-- ❌ bad -->
<div class="title">Key Findings</div>

<!-- ✅ good (p wrapper, class inherited) -->
<p class="title">Key Findings</p>

<!-- ❌ bad (border on p) -->
<p class="stat" style="border-left: 3px solid red;">41%</p>

<!-- ✅ good (border on outer div) -->
<div class="stat-wrap" style="border-left: 3px solid red;">
  <p class="stat">41%</p>
</div>
```

### When to Pick Which

| Scenario | Recommendation |
|---|---|
| For organizers / archival | **PDF** (universal, high fidelity, text-searchable) |
| Send to collaborators for fine-tuning copy | **PPTX editable** (accept font fallback) |
| Live presentation, no content edits | **PDF** (vector fidelity, cross-platform) |
| HTML is the primary presentation medium | Just play in the browser; export is backup |

## Deep Path to Editable PPTX (long-term projects only)

If your deck will be maintained long-term, edited repeatedly, and collaborated on — recommended to **write HTML to the html2pptx constraints from the start**, so `export_deck_pptx.mjs` passes everything. See `references/editable-pptx.md` (4 hard constraints + HTML template + common-error quick reference + fallback flow when a visual draft already exists).

---

## FAQ

**Multi-file: a slide in iframe doesn't open / blank screen**
→ Check that the `MANIFEST`'s `file` path is correct relative to `index.html`. Use the browser's DevTools to see if the iframe's src is directly accessible.

**Multi-file: one slide's styles conflict with another's**
→ Impossible (iframes are isolated). If it feels like a conflict, it's the cache — Cmd+Shift+R hard-reload.

**Single-file: multiple slides rendered stacked together**
→ CSS specificity issue. See the "Single-file Architecture's CSS Trap" section above.

**Single-file: scaling looks wrong**
→ Check that all slides are direct `<section>` children of `<deck-stage>`. No intermediate `<div>`.

**Single-file: jump to a specific slide**
→ Add the hash to the URL: `index.html#slide-5` jumps to slide 5.

**Both architectures: text positions inconsistent across screen sizes**
→ Use fixed dimensions (1920×1080) and `px` units; don't use `vw` / `vh` or `%`. Scaling is handled centrally.

---

## Verification Checklist (must pass after building a deck)

1. [ ] Open `index.html` (or main HTML) directly in the browser; check the cover has no broken images and fonts have loaded
2. [ ] Press → through every slide; no blank pages, no layout breaks
3. [ ] Press P for print preview; each slide is exactly one A4 (or 1920×1080) with no clipping
4. [ ] Pick 3 random slides and Cmd+Shift+R hard-reload; localStorage memory still works
5. [ ] Bulk Playwright screenshots (multi-file: iterate `slides/*.html`; single-file: use goTo to switch); eyeball every one
6. [ ] Search for residual `TODO` / `placeholder`; confirm all cleaned up

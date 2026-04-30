# Gallery Ripple + Multi-Focus · Scene Choreography Philosophy

> **A reusable visual choreography structure** distilled from the huashu-design hero animation v9 (25 seconds, 8 scenes).
> Not a video production pipeline, but **when this kind of choreography is "right"**.
> Real-world reference: [demos/hero-animation-v9.mp4](../demos/hero-animation-v9.mp4) · [https://www.huasheng.ai/huashu-design-hero/](https://www.huasheng.ai/huashu-design-hero/)

## TL;DR first

> **When you have 20+ homogeneous visual assets, and the scene needs to "express scale and depth," prefer the Gallery Ripple + Multi-Focus choreography over piling up layouts.**

General SaaS feature animations, product launches, skill promos, series portfolio showcases — as long as you have enough assets with consistent style, this structure almost always works.

---

## What is this technique actually expressing?

It's not "showing off assets" — it tells a narrative through **two rhythm changes**:

**Beat 1 · Ripple unfold (~1.5s)**: 48 cards spread out from the center, the audience is hit by "volume" — "oh, this thing has produced so much."

**Beat 2 · Multi-Focus (~8s, 4 loops)**: while the camera slowly pans, 4 times the background dims + desaturates and one card is enlarged alone to screen center — the audience switches from "shock at quantity" to "gaze at quality," each instance steadily paced at 1.7s.

**Core narrative structure**: **Scale (Ripple) → Gaze (Focus × 4) → Fade (Walloff)**. These three beats together express "Breadth × Depth" — not just that there's a lot, but each one is worth stopping to look at.

Compare with anti-examples:

| Approach | Audience perception |
|------|---------|
| 48 cards static layout (no Ripple) | Pretty but no narrative, like a grid screenshot |
| One-by-one fast cuts (no Gallery context) | Like a slideshow, loses "scale" |
| Ripple only, no Focus | Shocking but didn't make you remember any specific one |
| **Ripple + Focus × 4 (this recipe)** | **First shocked by quantity, then gazing at quality, finally calm fade — complete emotional arc** |

---

## Prerequisites (must all be met)

This choreography is **not universal**; the 4 conditions below are all required:

1. **Asset count ≥ 20, ideally 30+**
   Fewer than 20 makes Ripple feel "empty" — only with all 48 grids in motion do you get density. v9 used 48 grids × 32 images (cyclic fill).

2. **Visual style consistent across assets**
   All 16:9 slide previews / all app screenshots / all cover designs — aspect ratio, tone, and layout must look like "a set." Mixing makes the Gallery look like a clipboard.

3. **Assets retain readable info when enlarged individually**
   Focus enlarges a card to 960px wide; if the original looks blurry or info-thin when enlarged, this beat is wasted. Reverse check: can you pick 4 "most representative" out of 48? If you can't, asset quality is uneven.

4. **Scene is landscape or square, not vertical**
   Gallery's 3D tilt (`rotateX(14deg) rotateY(-10deg)`) requires horizontal extension; vertical screens make the tilt look narrow and awkward.

**Fallback paths when conditions are missing**:

| Missing what | Degrade to what |
|-------|-----------|
| Assets < 20 | Use "3-5 side-by-side static + sequential focus" |
| Style inconsistent | Use "cover + 3 chapter big-image" keynote-style |
| Info-thin | Use "data-driven dashboard" or "punch-line + big text" |
| Vertical scene | Use "vertical scroll + sticky cards" |

---

## Technical recipe (v9 real-world parameters)

### 4-Layer structure

```
viewport (1920×1080, perspective: 2400px)
  └─ canvas (4320×2520, oversized overflow) → 3D tilt + pan
      └─ 8×6 grid = 48 cards (gap 40px, padding 60px)
          └─ img (16:9, border-radius 9px)
      └─ focus-overlay (absolute center, z-index 40)
          └─ img (matches selected slide)
```

**Key**: canvas is 2.25× the viewport, giving pan the feeling of "peeking at a larger world."

### Ripple unfold (distance-delay algorithm)

```js
// Each card's entry time = distance from center × 0.8s delay
const col = i % 8, row = Math.floor(i / 8);
const dc = col - 3.5, dr = row - 2.5;       // offset to center
const dist = Math.hypot(dc, dr);
const maxDist = Math.hypot(3.5, 2.5);
const delay = (dist / maxDist) * 0.8;       // 0 → 0.8s
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
const opacity = expoOut(Math.min(1, localT));
```

**Core parameters**:
- Total duration 1.7s (`T.s3_ripple: [8.3, 10.0]`)
- Max delay 0.8s (center first, corners last)
- Each card entry duration 0.7s
- Easing: `expoOut` (burst feel, not smooth)

**Concurrent action**: canvas scale from 1.25 → 0.94 (zoom out to reveal) — synchronized push-back feel that complements the appearance.

### Multi-Focus (4-beat rhythm)

```js
T.focuses = [
  { start: 11.0, end: 12.7, idx: 2  },  // 1.7s
  { start: 13.3, end: 15.0, idx: 3  },  // 1.7s
  { start: 15.6, end: 17.3, idx: 10 },  // 1.7s
  { start: 17.9, end: 19.6, idx: 16 },  // 1.7s
];
```

**Rhythm pattern**: each focus 1.7s, 0.6s breath between them. Total 8s (11.0–19.6s).

**Inside each focus**:
- In ramp: 0.4s (`expoOut`)
- Hold: middle 0.9s (`focusIntensity = 1`)
- Out ramp: 0.4s (`easeOut`)

**Background change (this is key)**:

```js
if (focusIntensity > 0) {
  const dimOp = entryOp * (1 - 0.6 * focusIntensity);  // dim to 40%
  const brt = 1 - 0.32 * focusIntensity;                // brightness 68%
  const sat = 1 - 0.35 * focusIntensity;                // saturate 65%
  card.style.filter = `brightness(${brt}) saturate(${sat})`;
}
```

**Not just opacity — desaturate + darken simultaneously**. This makes the foreground overlay's colors "pop out" rather than just "get a bit brighter."

**Focus overlay size animation**:
- From 400×225 (entry) → 960×540 (hold state)
- Surrounded by 3 layers of shadow + a 3px accent-color outline ring, presenting a "framed" feel

### Pan (continuous motion keeps stillness from being boring)

```js
const panT = Math.max(0, t - 8.6);
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;
```

- Sine wave + linear drift double-layer motion — not a pure loop; position differs at every moment
- X/Y frequencies differ (0.12 vs 0.09) to avoid visually noticeable "regular cycling"
- Clamped to ±900/500px to prevent drifting out

**Why not pure linear pan**: with pure linear, the audience can "predict" where it will be next second; sine + drift makes every second new, and 3D tilt produces "subtle motion sickness" (the good kind), holding attention.

---

## 5 reusable patterns (distilled from v6→v9 iterations)

### 1. **expoOut as primary easing, not cubicOut**

`easeOut = 1 - (1-t)³` (smooth) vs `expoOut = 1 - 2^(-10t)` (burst, then quickly converges).

**Why**: expoOut hits 90% in the first 30%, more like physical damping, matching the "heavy thing landing" intuition. Especially good for:
- Card entry (sense of weight)
- Ripple spread (shockwave)
- Brand float-up (sense of settlement)

**When still use cubicOut**: focus out ramp, symmetric micro-motions.

### 2. **Paper base + terracotta orange accent (Anthropic lineage)**

```css
--bg: #F7F4EE;        /* warm paper */
--ink: #1D1D1F;       /* near-black */
--accent: #D97757;    /* terracotta orange */
--hairline: #E4DED2;  /* warm line */
```

**Why**: warm base color retains a "breathing" feel even after GIF compression, unlike pure white which feels "screen-y." Terracotta orange as the sole accent runs through terminal prompt, dir-card selected, cursor, brand hyphen, focus ring — all visual anchors strung together by this single color.

**v5 lesson**: added noise overlay to simulate "paper texture," but GIF frame compression destroyed it (every frame differs). v6 changed to "base color + warm shadow only," paper feel preserved 90%, GIF size reduced 60%.

### 3. **Two-tier shadow simulates depth, no real 3D**

```css
.gallery-card.depth-near { box-shadow: 0 32px 80px -22px rgba(60,40,20,0.22), ... }
.gallery-card.depth-far  { box-shadow: 0 14px 40px -16px rgba(60,40,20,0.10), ... }
```

Use the deterministic algorithm `sin(i × 1.7) + cos(i × 0.73)` to assign each card a near/mid/far shadow tier — **visually you get a "3D stacking" feel, but transform doesn't change between frames at all, GPU cost is 0**.

**Cost of true 3D**: each card with its own `translateZ`, GPU computing 48 transforms + shadow blurs every frame. Tried in v4, even Playwright recording at 25fps struggled. v6's two-tier shadow looks <5% different to the eye but is 10× cheaper.

### 4. **Font weight change (font-variation-settings) is more cinematic than size change**

```js
const wght = 100 + (700 - 100) * morphP;  // 100 → 700 over 0.9s
wordmark.style.fontVariationSettings = `"wght" ${wght.toFixed(0)}`;
```

Brand wordmark transitions from Thin → Bold over 0.9s, paired with letter-spacing fine-tuning (-0.045 → -0.048em).

**Why it's better than scaling up/down**:
- Audience has seen scaling too many times; expectations are fixed
- Weight change feels like "intrinsic fullness," like a balloon being inflated, not "being pushed closer"
- Variable fonts only became common in 2020+; the audience subconsciously feels "modern"

**Limitation**: must use a font that supports variable fonts (Inter / Roboto Flex / Recursive, etc.). Plain static fonts can only mimic (switching between fixed weights causes jumps).

### 5. **Corner brand low-intensity persistent signature**

The Gallery stage has a small `HUASHU · DESIGN` mark in the top-left corner, 16% opacity color, 12px font, wide letter-spacing.

**Why add this**:
- After Ripple bursts, audience tends to "lose focus" not remembering what they're watching; the small corner mark helps anchor
- More tasteful than a full-screen big logo — branding people know that brand signatures don't need to shout
- When the GIF is screenshot-shared, the attribution signal still remains

**Rule**: only appears in the middle (busy frames), off at the opening (don't obscure terminal), off at the ending (brand reveal is the protagonist).

---

## Anti-examples: when not to use this choreography

**❌ Product demos (where features need to be shown)**: Gallery makes each one flash by; audience can't remember any feature. Use "single-screen focus + tooltip annotation" instead.

**❌ Data-driven content**: viewers need to read numbers; Gallery's fast pace doesn't allow reading time. Use "data charts + sequential reveal" instead.

**❌ Story narration**: Gallery is a "parallel" structure; stories require "causality." Use keynote chapter switching instead.

**❌ Only 3-5 assets**: Ripple density is insufficient, looks like a "patch." Use "static layout + sequential highlight" instead.

**❌ Vertical (9:16)**: 3D tilt requires horizontal extension; vertical makes the tilt feel "askew" rather than "unfolded."

---

## How to judge whether your task fits this choreography

Three-step quick check:

**Step 1 · Asset count**: count how many similar visual assets you have. < 15 → stop; 15-25 → patch together; 25+ → use directly.

**Step 2 · Consistency test**: place 4 random assets side by side — do they look like "a set"? If not → unify style first or change approach.

**Step 3 · Narrative match**: are you trying to express "Breadth × Depth" (quantity × quality)? Or "process," "feature," "story"? If not the former, don't force fit.

If all three are yes, fork the v6 HTML directly, change the `SLIDE_FILES` array and timeline to reuse. Change `--bg / --accent / --ink` palette, full reskin without changing the bones.

---

## Related References

- Complete technical workflow: [references/animations.md](animations.md) · [references/animation-best-practices.md](animation-best-practices.md)
- Animation export pipeline: [references/video-export.md](video-export.md)
- Audio configuration (BGM + SFX dual-track): [references/audio-design-rules.md](audio-design-rules.md)
- Apple gallery-style horizontal reference: [references/apple-gallery-showcase.md](apple-gallery-showcase.md)
- Source HTML (v6 + audio integrated version): `www.huasheng.ai/huashu-design-hero/index.html`

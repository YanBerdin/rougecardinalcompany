# Apple Gallery Showcase · Gallery-Wall Animation Style

> Inspirations: Claude Design website hero video + Apple product page "wall of work" displays
> Battle-tested: huashu-design release hero v5
> Use cases: **product launch hero animations, skill capability demos, portfolio showcases** — any scenario that needs to display "many high-quality pieces of output" together while guiding viewer attention

---

## Trigger Decision: When to Use This Style

**Suitable for**:
- 10+ real outputs to show on the same screen (slides, app screens, web pages, infographics)
- Audience is professional (developers, designers, PMs) and sensitive to "craft"
- Desired vibe: "restrained, exhibition-style, premium, with a sense of space"
- Need both focus and overview at the same time (see detail without losing the whole)

**Not suitable for**:
- Single-product focus (use the product hero template in frontend-design)
- Mood-driven / strong-narrative animation (use a timeline-narrative template)
- Small screens / vertical orientation (the tilted perspective gets blurry on small canvas)

---

## Core Visual Tokens

```css
:root {
  /* Light gallery palette */
  --bg:         #F5F5F7;   /* Main canvas background — Apple website gray */
  --bg-warm:    #FAF9F5;   /* Warm cream variant */
  --ink:        #1D1D1F;   /* Main text color */
  --ink-80:     #3A3A3D;
  --ink-60:     #545458;
  --muted:      #86868B;   /* Secondary text */
  --dim:        #C7C7CC;
  --hairline:   #E5E5EA;   /* Card 1px border */
  --accent:     #D97757;   /* Terracotta orange — Claude brand */
  --accent-deep:#B85D3D;

  --serif-cn: "Noto Serif SC", "Songti SC", Georgia, serif;
  --serif-en: "Source Serif 4", "Tiempos Headline", Georgia, serif;
  --sans:     "Inter", -apple-system, "PingFang SC", system-ui;
  --mono:     "JetBrains Mono", "SF Mono", ui-monospace;
}
```

**Key principles**:
1. **Never use a pure-black background**. Black makes work look like cinema, not "work product you can adopt"
2. **Terracotta orange is the only chromatic accent**; everything else is grayscale + white
3. **Three-typeface stack** (serif EN + serif CN + sans + mono) creates an "editorial" rather than "internet product" feel

---

## Core Layout Patterns

### 1. Floating Card (the basic unit of the entire style)

```css
.gallery-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 6px;                          /* Inner padding is the "matting" */
  border: 1px solid var(--hairline);
  box-shadow:
    0 20px 60px -20px rgba(29, 29, 31, 0.12),   /* Main shadow, soft and long */
    0 6px 18px -6px rgba(29, 29, 31, 0.06);     /* Second-layer near light, creates float */
  aspect-ratio: 16 / 9;                  /* Unified slide ratio */
  overflow: hidden;
}
.gallery-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 9px;                    /* Slightly smaller corner radius than the card, for visual nesting */
}
```

**Counter-example**: don't tile edge-to-edge (no padding, no border, no shadow) — that's information-graphic density expression, not exhibition.

### 2. 3D Tilted Wall of Work

```css
.gallery-viewport {
  position: absolute; inset: 0;
  overflow: hidden;
  perspective: 2400px;                   /* Deeper perspective, gentle tilt */
  perspective-origin: 50% 45%;
}
.gallery-canvas {
  width: 4320px;                         /* Canvas = 2.25× viewport */
  height: 2520px;                        /* Reserve pan space */
  transform-origin: center center;
  transform: perspective(2400px)
             rotateX(14deg)              /* Tilt back */
             rotateY(-10deg)             /* Turn left */
             rotateZ(-2deg);             /* Slight roll, removes too-clean feel */
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 40px;
  padding: 60px;
}
```

**Parameter sweet spots**:
- rotateX: 10-15deg (more and it looks like a VIP gala backdrop)
- rotateY: ±8-12deg (left-right balance)
- rotateZ: ±2-3deg (the human touch of "this wasn't placed by a machine")
- perspective: 2000-2800px (under 2000 = fisheye, over 3000 ≈ parallel projection)

### 3. 2×2 Four-Corner Convergence (Selection Scene)

```css
.grid22 {
  display: grid;
  grid-template-columns: repeat(2, 800px);
  gap: 56px 64px;
  align-items: start;
}
```

Each card slides in toward the center from its corresponding corner (tl/tr/bl/br) + fade in. Corresponding `cornerEntry` vectors:

```js
const cornerEntry = {
  tl: { dx: -700, dy: -500 },
  tr: { dx:  700, dy: -500 },
  bl: { dx: -700, dy:  500 },
  br: { dx:  700, dy:  500 },
};
```

---

## Five Core Animation Patterns

### Pattern A · Four-Corner Convergence (0.8-1.2s)

4 elements slide in from the viewport corners while scaling 0.85→1.0, ease-out. Good for an opener that "shows multi-directional choices."

```js
const inP = easeOut(clampLerp(t, start, end));
card.style.transform = `translate3d(${(1-inP)*ce.dx}px, ${(1-inP)*ce.dy}px, 0) scale(${0.85 + 0.15*inP})`;
card.style.opacity = inP;
```

### Pattern B · Selected Zooms In + Others Slide Out (0.8s)

The selected card scales 1.0→1.28, others fade out + blur + drift back to corners:

```js
// Selected
card.style.transform = `translate3d(${cellDx*outP}px, ${cellDy*outP}px, 0) scale(${1 + 0.28*easeOut(zoomP)})`;
// Not selected
card.style.opacity = 1 - outP;
card.style.filter = `blur(${outP * 1.5}px)`;
```

**Key**: non-selected cards must blur, not just fade. Blur simulates depth of field and visually "pushes the selected card forward."

### Pattern C · Ripple Expansion (1.7s)

From center outward, delay by distance; each card fades in while scaling 1.25x → 0.94x ("camera pulling back"):

```js
const col = i % COLS, row = Math.floor(i / COLS);
const dc = col - (COLS-1)/2, dr = row - (ROWS-1)/2;
const dist = Math.sqrt(dc*dc + dr*dr);
const delay = (dist / maxDist) * 0.8;
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
card.style.opacity = easeOut(Math.min(1, localT));

// Simultaneously the whole gallery scales 1.25 → 0.94
const galleryScale = 1.25 - 0.31 * easeOut(rippleProgress);
```

### Pattern D · Sinusoidal Pan (Continuous Drift)

Use a sine wave + linear drift combo to avoid the "marquee" feel of "has a start and an end" loop:

```js
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;    // Drift left
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;    // Drift up
const clampedX = Math.max(-900, Math.min(900, panX));   // Prevent edge exposure
```

**Parameters**:
- Sine period `0.09-0.15 rad/s` (slow, ~30-50s per oscillation)
- Linear drift `5-8 px/s` (slower than blinking)
- Amplitude `120-220 px` (large enough to feel, small enough not to nauseate)

### Pattern E · Focus Overlay (Focus Switch)

**Key design**: the focus overlay is a **flat element** (no tilt) floating above the tilted canvas. The selected slide scales from tile position (~400×225) to screen center (960×540); the background canvas doesn't change tilt but **dims to 45%**:

```js
// Focus overlay (flat, centered)
focusOverlay.style.width = (startW + (endW - startW) * focusIntensity) + 'px';
focusOverlay.style.height = (startH + (endH - startH) * focusIntensity) + 'px';
focusOverlay.style.opacity = focusIntensity;

// Background cards dim but remain visible (key! don't 100% mask)
card.style.opacity = entryOp * (1 - 0.55 * focusIntensity);   // 1 → 0.45
card.style.filter = `brightness(${1 - 0.3 * focusIntensity})`;
```

**Iron rule for sharpness**:
- The focus overlay's `<img>` `src` must point directly to the original image — **don't reuse the compressed thumbnail in the gallery**
- Preload all originals into a `new Image()[]` array
- Compute the overlay's own `width/height` per frame; the browser resamples the original each frame

---

## Timeline Architecture (Reusable Skeleton)

```js
const T = {
  DURATION: 25.0,
  s1_in: [0.0, 0.8],    s1_type: [1.0, 3.2],  s1_out: [3.5, 4.0],
  s2_in: [3.9, 5.1],    s2_hold: [5.1, 7.0],  s2_out: [7.0, 7.8],
  s3_hold: [7.8, 8.3],  s3_ripple: [8.3, 10.0],
  panStart: 8.6,
  focuses: [
    { start: 11.0, end: 12.7, idx: 2  },
    { start: 13.3, end: 15.0, idx: 3  },
    { start: 15.6, end: 17.3, idx: 10 },
    { start: 17.9, end: 19.6, idx: 16 },
  ],
  s4_walloff: [21.1, 21.8], s4_in: [21.8, 22.7], s4_hold: [23.7, 25.0],
};

// Core easing
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
function lerp(time, start, end, fromV, toV, easing) {
  if (time <= start) return fromV;
  if (time >= end) return toV;
  let p = (time - start) / (end - start);
  if (easing) p = easing(p);
  return fromV + (toV - fromV) * p;
}

// Single render(t) function reads the timestamp and writes all elements
function render(t) { /* ... */ }
requestAnimationFrame(function tick(now) {
  const t = ((now - startMs) / 1000) % T.DURATION;
  render(t);
  requestAnimationFrame(tick);
});
```

**Architecture essence**: **all state derived from timestamp t**, no state machine, no setTimeout. So:
- Jumping to any moment via `window.__setTime(12.3)` is instant (handy for Playwright per-frame capture)
- Looping is naturally seamless (t mod DURATION)
- Any frame can be frozen during debugging

---

## Texture Details (Easily Overlooked but Crucial)

### 1. SVG Noise Texture

Light backgrounds easily look "too flat." Layer a very weak fractalNoise:

```html
<style>
.stage::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.078  0 0 0 0 0.078  0 0 0 0 0.074  0 0 0 0.035 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.5;
  pointer-events: none;
  z-index: 30;
}
</style>
```

Looks like no difference; remove it and you'll see.

### 2. Corner Brand Mark

```html
<div class="corner-brand">
  <div class="mark"></div>
  <div>HUASHU · DESIGN</div>
</div>
```

```css
.corner-brand {
  position: absolute; top: 48px; left: 72px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}
```

Only shown in the gallery scene; fades in/out. Like a museum exhibition tag.

### 3. Brand Close-Out Wordmark

```css
.brand-wordmark {
  font-family: var(--sans);
  font-size: 148px;
  font-weight: 700;
  letter-spacing: -0.045em;   /* Negative tracking is key — pulls letters tight into a mark */
}
.brand-wordmark .accent {
  color: var(--accent);
  font-weight: 500;           /* Accent character is actually thinner — visual contrast */
}
```

`letter-spacing: -0.045em` is the standard treatment for Apple product page large text.

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| Looks like a PPT template | Cards have no shadow / hairline | Add two-layer box-shadow + 1px border |
| Tilt looks cheap | Used only rotateY, no rotateZ | Add ±2-3deg rotateZ to break the orderliness |
| Pan feels "janky" | Used setTimeout or CSS keyframes loop | Use rAF + sin/cos continuous functions |
| Text unclear during focus | Reused gallery tile's low-res image | Independent overlay + direct original src |
| Background too empty | Plain `#F5F5F7` | Layer SVG fractalNoise at 0.5 opacity |
| Type feels too "internet" | Inter only | Add Serif (CN + EN each) + mono — three-stack |

---

## References

- Full implementation sample: `/Users/alchain/Documents/writing/01-public-account-writing/projects/2026.04-huashu-design-release/visuals/hero-animation-v5.html`
- Original inspiration: claude.ai/design hero video
- Reference aesthetics: Apple product pages, Dribbble shot collection pages

When you encounter "many high-quality outputs to display" animation needs, copy the skeleton from this file directly, swap content + tweak timing.

# Animation Best Practices · Positive Animation Design Grammar

> Based on a deep deconstruction of Anthropic's three official product animations
> (Claude Design / Claude Code Desktop / Claude for Word), distilled into
> "Anthropic-grade" animation design rules.
>
> Use together with `animation-pitfalls.md` (the avoid-list) — this file is "**do this**",
> pitfalls is "**don't do that**". The two are orthogonal, read both.
>
> **Constraint statement**: this file only documents **motion logic and expressive style**;
> it **introduces no specific brand color values**. Color decisions go through the §1.a
> Core Asset Protocol (extracted from the brand spec) or the "Design Direction Advisor"
> (each of the 20 philosophies has its own palette). This reference discusses **how things
> move**, not **what color they are**.

---

## §0 · Who You Are · Identity and Taste

> Before reading any technical rule below, read this section first. Rules **emerge from
> identity** — not the other way around.

### §0.1 Identity Anchor

**You are a motion designer who has studied the motion archives of Anthropic / Apple / Pentagram / Field.io.**

When you make animation, you are not tweaking CSS transitions — you are using digital
elements to **simulate a physical world**, making the audience's subconscious believe
"these are objects with weight, inertia, and overshoot."

You don't make PowerPoint-style animation. You don't make "fade in fade out" animation.
You make animations that **convince the viewer the screen is a space they can reach into**.

### §0.2 Core Beliefs (3)

1. **Animation is physics, not animation curves**
   `linear` is digital, `expoOut` is physical. You believe the pixels on screen deserve
   to be treated as "objects." Every easing choice answers the physics question
   "how heavy is this element? how much friction does it have?"

2. **Time allocation matters more than curve shape**
   Slow-Fast-Boom-Stop is your breathing. **Even-rhythm animation is a tech demo;
   rhythm-driven animation is narrative.** Slowing down at the right moment —
   matters more than picking the right easing at the wrong moment.

3. **Yielding to the viewer is harder than showing off**
   A 0.5s pause before a key result is a **technique**, not a compromise. **Giving the
   human brain reaction time is the highest virtue of an animator.** AI defaults to
   making a pause-free, information-dense animation — that's the rookie. What you do
   is restraint.

### §0.3 Taste Standard · What Is Beauty

Your judgment between "good" and "great" follows the criteria below. Each has an
**identification method** — when you see a candidate animation, use these questions
to judge whether it qualifies, rather than mechanically checking 14 rules.

| Dimension of beauty | Identification method (audience reaction) |
|---|---|
| **Sense of physical weight** | At the end of the animation, the element "**lands**" steadily — it doesn't just "**stop**" there. The viewer subconsciously feels "this has weight" |
| **Yielding to the viewer** | A perceptible pause (≥300ms) before key info appears — the viewer has time to "**see**" before continuing |
| **Negative space** | Ending is a hard cut + hold, not fade to black. The last frame is clear, definitive, decisive |
| **Restraint** | Across the whole piece there's only one moment of "120% polish"; the other 80% is just-right — **showing off everywhere is a cheap signal** |
| **Hand-feel** | Arcs (not straight lines), irregularity (not setInterval's mechanical rhythm), with breathing |
| **Respect** | Show the tweaking process, show the bug being fixed — **don't hide the work, don't sell "magic"**. AI is a collaborator, not a magician |

### §0.4 Self-Check · Audience First-Reaction Test

After making an animation, **what's the audience's first reaction?** — that is the only
metric you should optimize.

| Audience reaction | Grade | Diagnosis |
|---|---|---|
| "Looks pretty smooth" | good | Acceptable but unremarkable; you're making PowerPoint |
| "This animation is really fluid" | good+ | Technique is right but no wow factor |
| "This thing actually looks like **it floated up off the desk**" | great | You hit the sense of physical weight |
| "This doesn't look AI-made" | great+ | You hit the Anthropic threshold |
| "I want to **screenshot** this and share it" | great++ | You made the audience actively spread it |

**The difference between great and good is not technical correctness, it's taste judgment**.
Technical correctness + taste = great. Technical correctness + no taste = good.
Technical errors = not even at the entrance.

### §0.5 The Relationship Between Identity and Rules

The technical rules in §1-§8 below are the **execution means** of this identity in
specific scenarios — not a standalone rule list.

- When a scenario isn't covered by a rule → return to §0, judge with **identity**, don't guess
- When rules conflict → return to §0, use the **taste standard** to decide which matters more
- When you want to break a rule → first answer: "Does breaking it satisfy which clause of §0.3?"
  If you can answer, break it. If not, don't.

Good. Read on.

---

## Overview · Animation Is Physics in Three Layers

The root of the cheap feel in most AI-generated animation is — **they behave like
"digits," not "objects"**. Real-world objects have mass, inertia, elasticity, overshoot.
The "high-end feel" of Anthropic's three pieces comes from giving digital elements
a set of **physical-world motion rules**.

This rule set has 3 layers:

1. **Narrative rhythm layer**: Slow-Fast-Boom-Stop time allocation
2. **Motion curve layer**: Expo Out / Overshoot / Spring, refusing linear
3. **Expressive language layer**: showing process, mouse arcs, logo morph close-out

---

## 1. Narrative Rhythm · Slow-Fast-Boom-Stop 5-Phase Structure

All three Anthropic pieces follow this structure without exception:

| Phase | Share | Rhythm | Function |
|---|---|---|---|
| **S1 Trigger** | ~15% | Slow | Gives humans reaction time, establishes realism |
| **S2 Generate** | ~15% | Mid | Visual wow appears |
| **S3 Process** | ~40% | Fast | Shows controllability / density / detail |
| **S4 Burst** | ~20% | Boom | Camera pull-out / 3D pop-out / multi-panel surge |
| **S5 Land** | ~10% | Still | Brand logo + hard cut |

**Concrete duration mapping** (15s animation example):
S1 Trigger 2s · S2 Generate 2s · S3 Process 6s · S4 Burst 3s · S5 Land 2s

**Things you must not do**:
- ❌ Even rhythm (same info density per second) — fatigues the viewer
- ❌ Sustained high density — no peak, no memorable moment
- ❌ Fade-out ending (fade out to transparent) — should be a **hard cut**

**Self-check**: sketch 5 thumbnails on paper, each representing the climax frame of one
phase. If the 5 sketches look similar, you haven't built the rhythm.

---

## 2. Easing Philosophy · Refuse Linear, Embrace Physics

All motion in Anthropic's three pieces uses Bézier curves with a "damping feel."
The default cubic easeOut (`1-(1-t)³`) **isn't sharp enough** — too slow at the start,
not steady enough at the stop.

### Three Core Easings (already built into animations.jsx)

```js
// 1. Expo Out · fast launch, slow brake (most common, default main easing)
// CSS equivalent: cubic-bezier(0.16, 1, 0.3, 1)
Easing.expoOut(t) // = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

// 2. Overshoot · elastic toggle / button pop
// CSS equivalent: cubic-bezier(0.34, 1.56, 0.64, 1)
Easing.overshoot(t)

// 3. Spring physics · geometric settle / natural drop
Easing.spring(t)
```

### Usage Mapping

| Scenario | Which Easing |
|---|---|
| Card rise-in / panel entry / Terminal fade / focus overlay | **`expoOut`** (main easing, most common) |
| Toggle / button pop / emphasized interaction | `overshoot` |
| Preview geometry settle / physical drop / UI element bounce | `spring` |
| Continuous motion (e.g. mouse trajectory interpolation) | `easeInOut` (preserves symmetry) |

### Counterintuitive Insight

Most product trailers' animations are **too fast and too hard**. `linear` makes digital
elements look like machines, `easeOut` is the baseline, `expoOut` is the technical root
of the "high-end feel" — it gives digital elements a **physical-world sense of weight**.

---

## 3. Motion Language · 8 Common Principles

### 3.1 Don't Use Pure Black or Pure White as Background

None of Anthropic's three pieces use `#FFFFFF` or `#000000` as the primary background.
**Color-temperature-tinted neutrals** (warm or cool) carry a "paper / canvas / desktop"
materiality that reduces the machine feel.

**Concrete color value decisions** go through §1.a Core Asset Protocol (extracted from
brand spec) or the "Design Direction Advisor" (each of the 20 philosophies has its own
ground-color scheme). This reference doesn't give specific values — that's a **brand
decision**, not a motion rule.

### 3.2 Easing Is Never Linear

See §2.

### 3.3 Slow-Fast-Boom-Stop Narrative

See §1.

### 3.4 Show "Process" Rather Than "Magic Result"

- Claude Design shows tweaking parameters, dragging sliders (not one-click perfect output)
- Claude Code shows code errors + AI fixing (not first-try success)
- Claude for Word shows the Redline red-strike / green-add editing process (not delivering the final draft directly)

**Shared subtext**: the product is a **collaborator, pair engineer, senior editor** — not
a one-click magician. This precisely targets professional users' pain points around
"controllability" and "authenticity."

**Anti-AI-slop**: AI defaults to "magic one-click success" animations (one click → perfect
result). That's the common denominator. **Do the opposite** — show process, show tweak,
show bugs and fixes — that's where brand recognition comes from.

### 3.5 Hand-Drawn Mouse Trajectory (Arc + Perlin Noise)

A real human's mouse motion is not a straight line; it's "accelerate to start → arc →
decelerate to correct → click." A mouse trajectory generated by simple straight-line
interpolation **provokes subconscious rejection**.

```js
// Quadratic Bézier interpolation (start → control point → end)
function bezierQuadratic(p0, p1, p2, t) {
  const x = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
  const y = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
  return [x, y];
}

// Path: start → off-center midpoint → end (creates arc)
const path = [[100, 100], [targetX - 200, targetY + 80], [targetX, targetY]];

// Layer in tiny Perlin noise (±2px) to fake "hand jitter"
const jitterX = (simpleNoise(t * 10) - 0.5) * 4;
const jitterY = (simpleNoise(t * 10 + 100) - 0.5) * 4;
```

### 3.6 Logo "Morph Close-Out"

The logo entrance in all three Anthropic pieces is **not a simple fade-in** — it
**morphs in from the previous visual element**.

**Common pattern**: in the last 1-2 seconds, do a Morph / Rotate / Converge so the entire
narrative "collapses" onto the brand mark.

**Low-cost implementation** (without a true morph): collapse the previous visual element
into a color block (scale → 0.1, translate toward center), then have the block "expand"
into the wordmark. Use a 150ms quick cut + motion blur (`filter: blur(6px)` → `0`) for
the transition.

```js
<Sprite start={13} end={14}>
  {/* Collapse: previous element scale 0.1, opacity holds, filter blur grows */}
  const scale = interpolate(t, [0, 0.5], [1, 0.1], Easing.expoOut);
  const blur = interpolate(t, [0, 0.5], [0, 6]);
</Sprite>
<Sprite start={13.5} end={15}>
  {/* Expand: logo from block center scale 0.1 → 1, blur 6 → 0 */}
  const scale = interpolate(t, [0, 0.6], [0.1, 1], Easing.overshoot);
  const blur = interpolate(t, [0, 0.6], [6, 0]);
</Sprite>
```

### 3.7 Serif + Sans-Serif Dual Typeface

- **Brand / narration**: serif (carries "academic / editorial / taste")
- **UI / code / data**: sans-serif + monospace

**A single typeface is wrong.** Serif gives "taste"; sans gives "function."

Specific font choices go through the brand spec (the Display / Body / Mono trio in
brand-spec.md) or the Design Direction Advisor's 20 philosophies. This reference doesn't
give specific fonts — that's a **brand decision**.

### 3.8 Focus Switch = Background Recede + Foreground Sharpen + Flash Cue

A focus switch is **not just** lowering opacity. The full recipe is:

```js
// Filter combo for non-focus elements
tile.style.filter = `
  brightness(${1 - 0.5 * focusIntensity})
  saturate(${1 - 0.3 * focusIntensity})
  blur(${focusIntensity * 4}px)        // ← key: blur is what actually makes it "recede"
`;
tile.style.opacity = 0.4 + 0.6 * (1 - focusIntensity);

// After focus completes, do a 150ms flash highlight at the focus position to guide the eye back
focusOverlay.animate([
  { background: 'rgba(255,255,255,0.3)' },
  { background: 'rgba(255,255,255,0)' }
], { duration: 150, easing: 'ease-out' });
```

**Why blur is mandatory**: with only opacity + brightness, non-focus elements remain
"sharp" and don't visually "recede into the background." A blur of 4-8px gives non-focus
elements a real depth-of-field push-back.

---

## 4. Concrete Motion Techniques (Copy-Pasteable Snippets)

### 4.1 FLIP / Shared Element Transition

Button "expands" into an input — **not** button disappears + new panel appears. The core
is **the same DOM element** transitioning between two states, not two elements
cross-fading.

```jsx
// Using Framer Motion layoutId
<motion.div layoutId="design-button">Design</motion.div>
// ↓ same layoutId after click
<motion.div layoutId="design-button">
  <input placeholder="Describe your design..." />
</motion.div>
```

Native implementation reference: https://aerotwist.com/blog/flip-your-animations/

### 4.2 "Breathing" Expansion (width → height)

Panel expansion is **not pulling width and height simultaneously**, but rather:
- First 40% of the time: pull width only (height stays small)
- Last 60% of the time: width holds, height expands

This simulates the physical-world feeling of "open first, then fill with water."

```js
const widthT = interpolate(t, [0, 0.4], [0, 1], Easing.expoOut);
const heightT = interpolate(t, [0.3, 1], [0, 1], Easing.expoOut);
style.width = `${widthT * targetW}px`;
style.height = `${heightT * targetH}px`;
```

### 4.3 Staggered Fade-up (30ms stagger)

For table rows, card columns, list items entering, **delay each element by 30ms**;
`translateY` from 10px back to 0.

```js
rows.forEach((row, i) => {
  const localT = Math.max(0, t - i * 0.03);  // 30ms stagger
  row.style.opacity = interpolate(localT, [0, 0.3], [0, 1], Easing.expoOut);
  row.style.transform = `translateY(${
    interpolate(localT, [0, 0.3], [10, 0], Easing.expoOut)
  }px)`;
});
```

### 4.4 Non-Linear Breathing · 0.5s Hold Before Key Result

Machines execute fast and continuously, but **hold 0.5s before the key result appears**
so the viewer's brain has reaction time.

```jsx
// Typical scenario: AI finishes generating → 0.5s hold → result emerges
<Sprite start={8} end={8.5}>
  {/* 0.5s pause — nothing moves, let the viewer stare at the loading state */}
  <LoadingState />
</Sprite>
<Sprite start={8.5} end={10}>
  <ResultAppear />
</Sprite>
```

**Counter-example**: AI finishes generating and seamlessly cuts to result — the viewer
has no reaction time, info is lost.

### 4.5 Chunk Reveal · Simulating Token Streaming

When AI generates text, **don't use `setInterval` to spit out single characters** (like
old movie subtitles); use **chunk reveal** — 2-5 characters at a time at irregular
intervals, simulating real token streaming output.

```js
// Split into chunks, not characters
const chunks = text.split(/(\s+|,\s*|\.\s*|;\s*)/);  // Cut by word + punctuation
let i = 0;
function reveal() {
  if (i >= chunks.length) return;
  element.textContent += chunks[i++];
  const delay = 40 + Math.random() * 80;  // Irregular 40-120ms
  setTimeout(reveal, delay);
}
reveal();
```

### 4.6 Anticipation → Action → Follow-through

3 of Disney's 12 principles. Anthropic uses them very explicitly:

- **Anticipation**: a small reverse motion before the main action begins (button briefly shrinks before popping out)
- **Action**: the main action itself
- **Follow-through**: a bit of after-motion when the action ends (card slightly bounces after settling)

```js
// Full three phases of card entry
const anticip = interpolate(t, [0, 0.2], [1, 0.95], Easing.easeIn);     // Anticipation
const action  = interpolate(t, [0.2, 0.7], [0.95, 1.05], Easing.expoOut); // Action
const settle  = interpolate(t, [0.7, 1], [1.05, 1], Easing.spring);       // Follow-through
// Final scale = product of three or applied piecewise
```

**Counter-example**: animations with only Action and no Anticipation + Follow-through
look like "PowerPoint animations."

### 4.7 3D Perspective + translateZ Layering

For the "tilted 3D + floating cards" vibe, give the container a perspective and give
each element a different translateZ:

```css
.stage-wrap {
  perspective: 2400px;
  perspective-origin: 50% 30%;  /* Slight bird's-eye view */
}
.card-grid {
  transform-style: preserve-3d;
  transform: rotateX(8deg) rotateY(-4deg);  /* Golden ratio */
}
.card:nth-child(3n) { transform: translateZ(30px); }
.card:nth-child(5n) { transform: translateZ(-20px); }
.card:nth-child(7n) { transform: translateZ(60px); }
```

**Why rotateX 8° / rotateY -4° is the golden ratio**:
- Greater than 10° → element distortion is too strong, looks like "falling over"
- Less than 5° → looks like a "skew" rather than "perspective"
- The 8° × -4° asymmetric ratio simulates the natural angle of "the camera looking down from the top-left of the desktop"

### 4.8 Oblique Pan · Move XY Together

Camera motion is not pure up/down or pure left/right; it **moves XY together** to simulate
oblique movement:

```js
const panX = Math.sin(flowT * 0.22) * 40;
const panY = Math.sin(flowT * 0.35) * 30;
stage.style.transform = `
  translate(-50%, -50%)
  rotateX(8deg) rotateY(-4deg)
  translate3d(${panX}px, ${panY}px, 0)
`;
```

**Key**: X and Y use different frequencies (0.22 vs 0.35) to avoid Lissajous-style cyclic
regularity.

---

## 5. Scene Recipes (Three Narrative Templates)

The three reference videos correspond to three product personalities. **Pick the one
that best fits your product**; don't mix them.

### Recipe A · Apple Keynote Cinematic (Claude Design class)

**Best for**: major version launches, hero animations, visual-wow priority
**Rhythm**: Slow-Fast-Boom-Stop with strong arc
**Easing**: `expoOut` throughout + a touch of `overshoot`
**SFX density**: high (~0.4/s); SFX pitch tuned to BGM scale
**BGM**: IDM / minimal tech electronic, calm + precise
**Close-out**: rapid camera pull-out → drop → Logo morph → ethereal single tone → hard cut

### Recipe B · One-Shot Tool Workflow (Claude Code class)

**Best for**: developer tools, productivity apps, flow-state scenarios
**Rhythm**: continuous steady flow, no obvious peak
**Easing**: `spring` physics + `expoOut`
**SFX density**: **0** (rhythm driven purely by BGM cut)
**BGM**: Lo-fi Hip-hop / Boom-bap, 85-90 BPM
**Core technique**: key UI actions land on BGM kick/snare transients — "**musical groove
is the interaction SFX**"

### Recipe C · Office Productivity Narrative (Claude for Word class)

**Best for**: enterprise software, document/spreadsheet/calendar tools, professional-feel priority
**Rhythm**: multi-scene hard cuts + Dolly In/Out
**Easing**: `overshoot` (toggle) + `expoOut` (panels)
**SFX density**: medium (~0.3/s), mostly UI clicks
**BGM**: Jazzy Instrumental, minor key, BPM 90-95
**Core highlight**: one scene must be the "whole-piece highlight" — 3D pop-out / lifting off the plane

---

## 6. Counter-Examples · This Is AI Slop

| Anti-pattern | Why it's wrong | Correct way |
|---|---|---|
| `transition: all 0.3s ease` | `ease` is a relative of linear; everything moves at the same speed | Use `expoOut` + per-element stagger |
| All entries are `opacity 0→1` | No sense of motion direction | Pair with `translateY 10→0` + Anticipation |
| Logo fade-in | No narrative close-out | Morph / Converge / collapse-expand |
| Mouse moves in straight lines | Subconscious machine feel | Bézier arc + Perlin Noise |
| Single-character typing (setInterval) | Like old movie subtitles | Chunk Reveal, randomized intervals |
| No hold before key result | Viewer has no reaction time | 0.5s hold before the result |
| Focus switch only changes opacity | Non-focus elements still sharp | opacity + brightness + **blur** |
| Pure black / pure white background | Cyber feel / glare fatigue | Color-tinted neutral (via brand spec) |
| All animation moves at the same speed | No rhythm | Slow-Fast-Boom-Stop |
| Fade-out ending | No decisiveness | Hard cut (hold the last frame) |

---

## 7. Self-Check (60 Seconds Before Animation Delivery)

- [ ] Narrative structure is Slow-Fast-Boom-Stop, not even rhythm?
- [ ] Default easing is `expoOut`, not `easeOut` or `linear`?
- [ ] Toggle / button pop uses `overshoot`?
- [ ] Card / list entry has 30ms stagger?
- [ ] 0.5s hold before key result?
- [ ] Typing uses Chunk Reveal, not setInterval per-char?
- [ ] Focus switch adds blur (not just opacity)?
- [ ] Logo is morph close-out, not fade-in?
- [ ] Background is not pure black / pure white (tinted neutral)?
- [ ] Type has a serif + sans-serif hierarchy?
- [ ] Ending is a hard cut, not a fade?
- [ ] (If a mouse is shown) mouse trajectory is an arc, not a straight line?
- [ ] SFX density matches product personality (see Recipes A/B/C)?
- [ ] BGM and SFX have a 6-8dB loudness gap? (See `audio-design-rules.md`)

---

## 8. Relationship to Other References

| Reference | Position | Relation |
|---|---|---|
| `animation-pitfalls.md` | Technical pitfalls (16 items) | "**Don't do this**" · the inverse of this file |
| `animations.md` | Stage/Sprite engine usage | The basis of **how to write** animation |
| `audio-design-rules.md` | Two-track audio rules | Rules for **adding audio** to animation |
| `sfx-library.md` | 37 SFX inventory | SFX **asset library** |
| `apple-gallery-showcase.md` | Apple gallery showcase style | Special topic on a specific motion style |
| **This file** | Positive motion design grammar | "**Do this**" |

**Calling order**:
1. First read SKILL.md workflow Step 3's positioning four-questions (decides narrative role and visual temperature)
2. Once direction is set, read this file to determine **motion language** (Recipes A/B/C)
3. When writing code, refer to `animations.md` and `animation-pitfalls.md`
4. When exporting video, follow `audio-design-rules.md` + `sfx-library.md`

---

## Appendix · Source Material for This File

- Anthropic official animation deconstruction: `reference-animations/BEST-PRACTICES.md` in Huashu's project directory
- Anthropic audio deconstruction: `AUDIO-BEST-PRACTICES.md` in the same directory
- 3 reference videos: `ref-{1,2,3}.mp4` + corresponding `gemini-ref-*.md` / `audio-ref-*.md`
- **Strict filtering**: this reference contains no specific brand color values, font names, or product names.
  Color/font decisions go through §1.a Core Asset Protocol or the 20 design philosophies.

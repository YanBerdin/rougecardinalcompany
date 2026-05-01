# Cinematic Patterns · Best Practices for Workflow Demos

> Five key patterns to upgrade from "PowerPoint animation" to "launch-event-grade cinematic."
> Distilled from the two cinematic demos in the 2026-04 "Let's Talk Skill" deck (Nuwa workflow + Darwin workflow); reproducible in production.

---

## 0 · What This Doc Solves

When you need to "make a demo animation showing a workflow" (typical scenarios: skill workflows, product onboarding, API call flows, agent task execution), there are two common approaches:

| Paradigm | What it looks like | Result |
|---|---|---|
| **PowerPoint animation** (bad) | step 1 fade in → step 2 fade in → step 3 fade in, 4 boxes laid out on the same screen | Viewer feels "this is just a PPT with fade effects added," no wow moment |
| **Cinematic** (good) | scene-based, focus on one thing at a time, scenes joined by dissolve / focus pull / morph | Viewer feels "this is a fragment from a product launch event," wants to screenshot and share |

The root of the difference is **not animation technique** — it's **narrative paradigm**. This doc explains how to upgrade from the former to the latter.

---

## 1 · Five Core Patterns

### Pattern A · Dashboard + Cinematic Overlay Two-Layer Structure

**Problem**: a pure cinematic defaults to a black screen + a ▶ button. If a user lands on this slide and doesn't click, they see nothing.

**Solution**:
```
DEFAULT state (always visible): full static workflow dashboard
  └── viewer immediately sees how this skill / workflow runs

POINT ▶ trigger (overlay floats up): 22-second cinematic
  └── plays through, then auto-fades back to DEFAULT

```

**Implementation points**:
- `.dash` is visible by default; `.cinema` defaults to `opacity: 0; pointer-events: none`
- `.play-cta` is a small gold button in the lower-right (not a centered large overlay)
- Click → `cinema.classList.add('show')` + `dash.classList.add('hide')`
- Run via `requestAnimationFrame` (one-shot, not loop); `endCinematic()` reverses state on completion

**Anti-pattern**: default = a large central ▶ overlay covering everything; before the click, the page is blank.

---

### Pattern B · Scene-Based, NOT Step-Based

**Problem**: breaking the animation into "step 1 shows → step 2 shows → ..." is PPT thinking.

**Solution**: break it into 5 scenes; each scene is an **independent shot** that focuses full-screen on one thing:

| Scene type | Job | Duration |
|---|---|---|
| 1 · Invoke | User input triggers (terminal typewriter) | 3-4s |
| 2 · Process | Visualization of the core workflow (unique visual language) | 5-6s |
| 3 · Result/Insight | The key insight extracted (visualization) | 4-5s |
| 4 · Output | The actual artifact (file / diff / numbers) | 3-4s |
| 5 · Hero Reveal | Closing hero moment (large type + value proposition) | 4-5s |

**Total ≈ 22 seconds** — this is the tested golden length:
- Shorter than 18s: PMs haven't entered the state before it ends
- Longer than 25s: lose patience
- 22s is just enough for "hook → expand → close → leave an impression"

**Implementation points**:
- `T = { DURATION: 22.0, s1_in: [0, 0.7], s2_in: [3.8, 4.6], ... }` global timeline
- A single `requestAnimationFrame(render)` runs all opacity / transform calculations across scenes
- Don't use setTimeout chains (easy to break, hard to debug)
- Easing must use `expoOut` / `easeOut` / cubic-bezier; **forbid linear**

---

### Pattern C · Each Demo's Visual Language Must Be Independent

**Problem**: after finishing the first cinematic, you take a shortcut on the second by reusing the same template (same orbit + pentagon + typewriter + hero large type), only swapping copy.

**Consequence**: viewers find the two skills "look identical" — equivalent to saying "these two skills are no different."

**Solution**: every workflow's core metaphor differs, so its visual language must differ.

**Comparison case**:

| Dimension | Nuwa (distill a person) | Darwin (optimize a skill) |
|---|---|---|
| Core metaphor | Collect → distill → write | Loop → evaluate → ratchet |
| Visual motion | Float / radiate / pentagon | Loop / rise / contrast |
| Scene 2 | 3D Orbit · 8 archive cards drifting in a perspective ellipse | Spin Loop · token runs 5 laps along a 6-node ring |
| Scene 3 | Pentagon · 5 tokens radiate from center | v1 vs v5 · side-by-side diff (red version vs gold version) |
| Scene 4 | SKILL.md typewriter | Hill-Climb · full-screen curve drawing |
| Scene 5 hero | "21 minutes" serif italic large type | Spinning gear ⚙ + "KEPT +1.1" gold tag |

**Judgment criterion**: cover the copy and look at visuals only — can you tell which demo this is? If you can't, you're cutting corners.

---

### Pattern D · Use AI-Generated Real Assets, Not Emoji or Hand-Drawn SVG

**Problem**: 3D orbit / gallery needs asset fragments to drift; emoji (📚🎤) are ugly and brand-less; hand-drawn SVG book spines never look like real books.

**Solution**: use `huashu-gpt-image` to generate one 4×2 grid image (8 theme-related items · white background · 60px breathing space · unified style); then use `extract_grid.py --mode bbox` to cut into 8 independent transparent PNGs.

**Prompt key points** (detailed prompt patterns in the `huashu-gpt-image` skill):
- IP anchor ("1960s Caltech archive aesthetic" / "Hearthstone-style consistent treatment")
- White background (easy to cut; gray gives mood but is hard to alpha-cut)
- 4×2 not 5×5 (avoids last-row compression bug)
- Persona finishing ("You are a Wired magazine curator preparing an exhibition photo")

**Anti-pattern**: using emoji as icons; using CSS silhouettes in place of product images.

---

### Pattern E · BGM + SFX Two-Track System

**Problem**: animation only, no sound — viewers subconsciously feel "this thing is a poor demo."

**Solution**: long BGM + 11 SFX cues.

**Universal SFX cue recipe** (for workflow demos):

| Time | SFX | Trigger scene |
|---|---|---|
| 0.10s | whoosh | Terminal rises from below |
| 3.0s | enter | Typewriter completes, press enter |
| 4.0s | slide-in | Scene 2 elements enter |
| 5-9s × 5 times | sparkle | Key process nodes (each generation / each token / each data point) |
| 14s | click | Switch to output scene |
| 17.8s | logo-reveal | Hero reveal moment |
| typewriter | type | Trigger every 2 chars (don't go too dense) |

**Frequency-band isolation**: BGM volume 0.32 (low-frequency bed), SFX volume 0.55 (mid-high punch), sparkle 0.7 (must stand out), logo-reveal 0.85 (the strongest hero moment).

**User control**:
- Must have a ▶ start overlay (browser autoplay restrictions)
- Small mute button in upper right (user can toggle anytime)
- Don't make it "force-blast when the slide loads"

---

## 2 · Static Dashboard Design Points

The dashboard is Layer 1 of the two-layer structure; the PM understands the skill without clicking ▶.

**Layout**: 3-column grid (or 1 large + 2 small); each panel solves one question:

| Panel type | What it solves | Example |
|---|---|---|
| **Pipeline / Flow Diagram** | "What's the workflow of this skill?" | Nuwa 4-stage pipeline · Darwin autoresearch loop |
| **Snapshot / State** | "What does the real data look like when run?" | Darwin 8-dimension rubric snapshot |
| **Trajectory / Evolution** | "How does it change across multiple runs?" | Darwin 5-generation hill-climb curve |
| **Examples / Gallery** | "What things have already been produced?" | Nuwa 21 personas gallery |
| **Strip · Example I/O** | "What goes in → what comes out" | Nuwa example strip: `› nuwa distill feynman → feynman.skill (21 min)` |

**Key constraints**:
- Information density must be sufficient (each panel must carry differentiated info)
- But don't stuff in data slop (every number must mean something)
- Color matches the cinematic (same color family for seamless switching)

---

## 3 · Debugging and Dev Tools

Any long animation needs three dev tools or debugging will explode.

### Tool 1 · `?seek=N` Freeze to Second N

```js
const seek = parseFloat(params.get('seek'));
if (!isNaN(seek)) {
  started = true; muted = true;
  frozenT = seek;  // render() uses this t instead of elapsed
  cinema.classList.add('show'); dash.classList.add('hide');
}

// In render():
let t = frozenT !== null ? frozenT : (elapsed % T.DURATION);
```

Usage: `http://.../slide.html?seek=12` jumps directly to second 12; no need to wait for playback.

### Tool 2 · `?autoplay=1` Skip the ▶ Overlay

Convenient for Playwright auto-screenshot tests; also forces start when embedded in iframes.

### Tool 3 · Manual REPLAY Button

Small button in upper right; users / debug can replay any number of times. CSS:

```css
.replay{position:absolute;top:18px;right:18px;background:rgba(212,165,116,0.1);
  border:1px solid rgba(212,165,116,0.3);color:#D4A574;
  font-family:monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;
  padding:6px 12px;border-radius:1px;cursor:pointer;backdrop-filter:blur(6px);z-index:6}
```

---

## 4 · iframe Embedding Pitfalls (When Cinematic Is Embedded in a Deck)

### Pitfall 1 · Parent Window Click Zone Intercepts iframe Buttons

If the deck index.html adds a "transparent left/right 22vw click zone for paging," it **covers the iframe's ▶ play button** — clicks get swallowed as "next page."

**Fix**: add `top: 12vh; bottom: 25vh` to the click zone, leaving 25% top and bottom uncovered, so the iframe's central ▶ and lower-right ▶ are clickable.

### Pitfall 2 · iframe Steals Focus, Keyboard Events Lost

After the user clicks the iframe, focus moves into it; the parent window's ←/→ keyboard events are lost.

**Fix**:
```js
iframe.addEventListener('load', () => {
  // Inject keyboard forwarder
  const doc = iframe.contentDocument;
  doc.addEventListener('keydown', (e) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, ... }));
  });
  // Pull focus back to parent after click
  doc.addEventListener('click', () => setTimeout(() => window.focus(), 0));
});
```

### Pitfall 3 · file:// vs https:// Behavior Differences

A cinematic that works on local file:// may break after deployment because:
- Under file://, iframe contentDocument is same-origin
- Under https://, it's also same-origin (if same host), but audio autoplay restrictions are stricter

**Fix**:
- Before deploying, run `python3 -m http.server` to test locally over HTTP
- BGM must `bgm.play()` only after the user clicks ▶; don't play immediately on page load

---

## 5 · Anti-Pattern Quick Reference

| ❌ Anti-pattern | ✅ Right pattern |
|---|---|
| Default = black screen ▶ overlay | Default = static dashboard, ▶ as accent |
| 4 steps lined up on screen with fade in | 5 scenes full-screen switching, each focuses on one thing |
| Reuse template, swap copy for different demos | Each demo has independent visual language (cover the copy and you can still tell them apart) |
| Emoji / hand-drawn SVG as assets | gpt-image-2 large image + extract_grid cut |
| No BGM, no SFX | BGM + 11 SFX cues, two-track |
| setTimeout chain scheduling | requestAnimationFrame + global timeline T object |
| Linear animation | Expo / cubic-bezier easing |
| No dev tools | `?seek=N` + `?autoplay=1` + REPLAY button |
| Buttons in iframe swallowed by parent click zone | Click zone has top/bottom margin to leave room for buttons |

---

## 6 · Time Budget

Following these patterns, one full cinematic demo (with dashboard):

| Task | Time |
|---|---|
| Design 5-scene narrative + visual language | 30 min (be careful — decides independence) |
| Dashboard static layout + content | 1 hour |
| Cinematic 5 scenes implementation | 1.5 hours |
| Audio cues timing + replay button | 30 min |
| Playwright screenshot validation of 5 key moments | 15 min |
| **Total per demo** | **3-4 hours** |

The second demo reuses the framework but **visual language must be independent** — about 2-3 hours.

# Animation Pitfalls: HTML Animation Bugs and Rules

The bugs we hit most often when making animations and how to avoid them. Every rule comes from a real failure case.

Read this before writing animation — saves you a round of iteration.

## 1. Stacking Layout — `position: relative` Is the Default Obligation

**The pitfall**: a sentence-wrap element wrapped 3 bracket-layer elements (`position: absolute`). Without setting `position: relative` on sentence-wrap, the absolute brackets used `.canvas` as their coordinate system and floated 200px below the bottom of the screen.

**Rules**:
- Any container with `position: absolute` children **must** explicitly have `position: relative`
- Even if no visual offset is needed, write `position: relative` as a coordinate-system anchor
- If you're writing `.parent { ... }` and its children include `.child { position: absolute }`, instinctively add relative to the parent

**Quick check**: for every `position: absolute`, count up the ancestors and make sure the nearest positioned ancestor is *the* coordinate system you intended.

## 2. Character Trap — Don't Rely on Rare Unicode

**The pitfall**: I wanted to use `␣` (U+2423 OPEN BOX) to visualize a "space token." Neither Noto Serif SC nor Cormorant Garamond has this glyph; it renders as blank/tofu, completely invisible to the viewer.

**Rules**:
- **Every character that appears in your animation must exist in your chosen font**
- Common rare-character blacklist: `␣ ␀ ␐ ␋ ␨ ↩ ⏎ ⌘ ⌥ ⌃ ⇧ ␦ ␖ ␛`
- To express meta-characters like "space / return / tab," use a **CSS-constructed semantic box**:
  ```html
  <span class="space-key">Space</span>
  ```
  ```css
  .space-key {
    display: inline-flex;
    padding: 4px 14px;
    border: 1.5px solid var(--accent);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.3em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  ```
- Validate emoji too: outside Noto Emoji, some emoji fall back to gray squares; prefer an `emoji` font-family or SVG

## 3. Data-Driven Grid/Flex Templates

**The pitfall**: code had `const N = 6` tokens, but CSS hard-coded `grid-template-columns: 80px repeat(5, 1fr)`. The 6th token had no column, and the entire matrix shifted.

**Rules**:
- When count comes from a JS array (`TOKENS.length`), the CSS template should be data-driven too
- Option A: use a CSS variable injected from JS
  ```js
  el.style.setProperty('--cols', N);
  ```
  ```css
  .grid { grid-template-columns: 80px repeat(var(--cols), 1fr); }
  ```
- Option B: use `grid-auto-flow: column` to let the browser auto-extend
- **Forbid the "fixed number + JS constant" combo** — change N and CSS won't sync

## 4. Transition Gap — Scene Switches Must Be Continuous

**The pitfall**: between zoom1 (13-19s) → zoom2 (19.2-23s), the main sentence was already hidden, zoom1 fade-out (0.6s) + zoom2 fade-in (0.6s) + stagger delay (0.2s+) ≈ 1 second of pure blank screen. The viewer assumed the animation had hung.

**Rules**:
- When switching scenes back-to-back, fade-out and fade-in must **cross-overlap**, not "previous fully gone before next begins"
  ```js
  // Bad:
  if (t >= 19) hideZoom('zoom1');      // 19.0s out
  if (t >= 19.4) showZoom('zoom2');    // 19.4s in → 0.4s blank in between

  // Good:
  if (t >= 18.6) hideZoom('zoom1');    // start fade-out 0.4s early
  if (t >= 18.6) showZoom('zoom2');    // simultaneous fade-in (cross-fade)
  ```
- Or use an "anchor element" (e.g. the main sentence) as a visual link between scenes; it briefly reappears during the zoom switch
- Calculate the CSS transition duration carefully to avoid triggering the next transition before the previous one finishes

## 5. Pure Render Principle — Animation State Must Be Seekable

**The pitfall**: I used `setTimeout` + `fireOnce(key, fn)` to chain-trigger animation states. Normal playback was fine, but during frame-by-frame recording / seeking to arbitrary times, setTimeouts that had already fired could not "go back in time."

**Rules**:
- The `render(t)` function should ideally be a **pure function**: given t, output a unique DOM state
- If side effects are unavoidable (e.g. class toggling), use a `fired` set with explicit reset:
  ```js
  const fired = new Set();
  function fireOnce(key, fn) { if (!fired.has(key)) { fired.add(key); fn(); } }
  function reset() { fired.clear(); /* clear all .show classes */ }
  ```
- Expose `window.__seek(t)` for Playwright / debugging:
  ```js
  window.__seek = (t) => { reset(); render(t); };
  ```
- Animation-related setTimeouts must not span >1 second, otherwise seeking back will misbehave

## 6. Measuring Before Fonts Load = Measuring Wrong

**The pitfall**: at `DOMContentLoaded`, I called `charRect(idx)` to measure bracket positions; the font hadn't loaded yet, every character's width was the fallback font's width, and positions were all wrong. After the font loaded (~500ms later), the bracket's `left: Xpx` still held the old value, permanently offset.

**Rules**:
- Any layout code that depends on DOM measurement (`getBoundingClientRect`, `offsetWidth`) **must** be wrapped in `document.fonts.ready.then()`
  ```js
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      buildBrackets(...);  // fonts ready by now, measurements accurate
      tick();              // animation begins
    });
  });
  ```
- The extra `requestAnimationFrame` gives the browser one frame to commit layout
- If using Google Fonts CDN, add `<link rel="preconnect">` to speed up first load

## 7. Recording Prep — Reserve Hooks for Video Export

**The pitfall**: Playwright's `recordVideo` defaults to 25fps and starts recording the moment context is created. The first 2 seconds of page load and font loading get recorded. The delivered video has 2 seconds of blank/flash at the start.

**Rules**:
- Provide a `render-video.js` tool that handles: warmup navigate → reload to restart animation → wait duration → ffmpeg trim head + transcode to H.264 MP4
- The **frame 0** of the animation must be the fully-laid-out final initial state (not blank or loading)
- Want 60fps? Use ffmpeg `minterpolate` post-processing; don't expect the browser source frame rate
- Want GIF? Two-stage palette (`palettegen` + `paletteuse`) can compress a 30s 1080p animation to 3MB

See `video-export.md` for the full script invocation.

## 8. Batch Export — Tmp Dir Must Include PID to Prevent Concurrency Collisions

**The pitfall**: I used `render-video.js` to record 3 HTMLs in parallel across 3 processes. Because TMP_DIR was named with only `Date.now()`, the 3 processes started in the same millisecond and shared one tmp dir. The first to finish cleaned tmp; the other two then hit `ENOENT` reading the directory and all crashed.

**Rules**:
- Any temp directory that may be shared by multiple processes must be named with a **PID or random suffix**:
  ```js
  const TMP_DIR = path.join(DIR, '.video-tmp-' + Date.now() + '-' + process.pid);
  ```
- If you really want multi-file parallelism, use shell `&` + `wait` rather than fork inside a single node script
- When batch-recording multiple HTMLs, the safe approach: **serial** (≤2 in parallel; ≥3, just queue them)

## 9. Progress Bar / Replay Button in the Recording — Chrome Elements Pollute the Video

**The pitfall**: the animation HTML had `.progress` progress bar, `.replay` replay button, `.counter` timestamp — convenient for human debug playback. When recorded as MP4 and delivered, these elements appeared at the bottom, as if dev tools had been screenshotted into the video.

**Rules**:
- Separate "chrome elements" meant for humans (progress bar / replay button / footer / masthead / counter / phase labels) from the video content body
- **Conventional class name** `.no-record`: any element with this class is auto-hidden by the recording script
- The recording script (`render-video.js`) by default injects CSS to hide common chrome class names:
  ```
  .progress .counter .phases .replay .masthead .footer .no-record [data-role="chrome"]
  ```
- Inject via Playwright's `addInitScript` (takes effect before each navigate; survives reloads)
- Add a `--keep-chrome` flag if you want to view the original HTML (with chrome)

## 10. Animation Repeats in the First Few Recording Seconds — Warmup Frame Leak

**The pitfall**: the old flow of `render-video.js` was `goto → wait fonts 1.5s → reload → wait duration`. Recording started when context was created, so during warmup the animation had already played for a while; after reload it restarted from 0. The result: the first few seconds of the video showed "mid-animation + switch + animation from 0," giving a strong sense of repetition.

**Rules**:
- **Warmup and Record must use independent contexts**:
  - Warmup context (no `recordVideo` option): only loads url, waits for fonts, then closes
  - Record context (with `recordVideo`): starts fresh; animation records from t=0
- ffmpeg `-ss trim` can only chop a tiny bit of Playwright startup latency (~0.3s); it **cannot** be used to mask warmup frames — the source must be clean
- Closing the recording context = webm flushed to disk, a Playwright constraint
- Related code pattern:
  ```js
  // Phase 1: warmup (throwaway)
  const warmupCtx = await browser.newContext({ viewport });
  const warmupPage = await warmupCtx.newPage();
  await warmupPage.goto(url, { waitUntil: 'networkidle' });
  await warmupPage.waitForTimeout(1200);
  await warmupCtx.close();

  // Phase 2: record (fresh)
  const recordCtx = await browser.newContext({ viewport, recordVideo });
  const page = await recordCtx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(DURATION * 1000);
  await page.close();
  await recordCtx.close();
  ```

## 11. Don't Draw "Pseudo Chrome" Inside the Frame — Decorative Player UI Collides with Real Chrome

**The pitfall**: the animation uses the `Stage` component, which already comes with scrubber + timecode + pause button (part of `.no-record` chrome, auto-hidden during export). I then drew a "magazine-style page-number progress bar" at the bottom: `00:60 ──── CLAUDE-DESIGN / ANATOMY`, feeling pleased with myself. **Result**: the user saw two progress bars — one Stage controller and one decorative one. Visually they collided completely; users called it a bug. "Why is there another progress bar inside the video?"

**Rules**:

- Stage already provides: scrubber + timecode + pause/replay button. **Don't draw inside the frame** progress indicators, current timecode, copyright bars, chapter counters — they either collide with chrome or are filler slop (violating "earn its place").
- "Page-number feel," "magazine feel," "bottom credits" — these **decorative urges** are high-frequency filler that AI auto-adds. Every appearance should trigger a check — does it really convey irreplaceable information, or is it just filling blank space?
- If you firmly believe a bottom strip must exist (e.g., the animation's subject *is* player UI), it must be **narratively necessary** and **visually distinct** from the Stage scrubber (different position, different form, different tone).

**Element-attribution test** (every element drawn into canvas must answer):

| What it belongs to | Treatment |
|------------|------|
| Narrative content of a specific scene | OK, keep |
| Global chrome (control / debug) | Add `.no-record` class, hide on export |
| **Belongs to no scene, and isn't chrome** | **Delete.** It's an orphan and is necessarily filler slop |

**Self-check (3 seconds before delivery)**: take a static snapshot and ask yourself —

- Is there anything in the frame that looks like "video player UI" (horizontal progress bar, timecode, control-button-like shapes)?
- If yes, would deleting it harm the narrative? If not, delete.
- Is the same kind of info (progress / time / credit) appearing twice? Consolidate it into a single chrome location.

**Counter-examples**: drawing `00:42 ──── PROJECT NAME` at the bottom, drawing "CH 03 / 06" chapter counter at the lower-right, drawing version number "v0.3.1" at the edge — all pseudo chrome filler.

## 12. Recording Leading Blank + Recording Origin Drift — `__ready` × tick × lastTick Triple Trap

**Pitfall A · leading blank**: a 60-second animation exported as MP4 has 2-3 seconds of blank page at the start. `ffmpeg --trim=0.3` can't chop it.

**Pitfall B · origin drift, real incident 2026-04-20**: a 24-second video was exported and the user perceived "the video doesn't actually start playing the first frame until 19 seconds in." In fact, the animation started recording at t=5, recorded to t=24 then looped back to t=0, and recorded another 5 seconds to end — so the last 5 seconds of the video are the actual beginning of the animation.

**Root cause** (both pitfalls share a single root cause):

Playwright `recordVideo` starts writing WebM the moment `newContext()` is called; meanwhile Babel/React/font loading takes L seconds (2-6s). The recording script waits for `window.__ready = true` as the anchor for "the animation begins here" — this must be strictly paired with animation `time = 0`. Two common errors:

| Error | Symptom |
|------|------|
| `__ready` set in `useEffect` or synchronous setup phase (before tick's first frame) | Recording script thinks the animation has begun, but WebM is still recording the blank page → **leading blank** |
| tick's `lastTick = performance.now()` initialized at **script top level** | The L-second font load gets folded into the first-frame `dt`; `time` jumps instantly to L → recording lags by L seconds throughout → **origin drift** |

**✅ Correct full starter tick template** (handwritten animations must use this skeleton):

```js
// ━━━━━━ state ━━━━━━
let time = 0;
let playing = false;   // ❗ default not playing — start only after fonts ready
let lastTick = null;   // ❗ sentinel — first tick frame forces dt=0 (don't use performance.now())
const fired = new Set();

// ━━━━━━ tick ━━━━━━
function tick(now) {
  if (lastTick === null) {
    lastTick = now;
    window.__ready = true;   // ✅ pair: "recording origin" with "animation t=0" on the same frame
    render(0);               // render once more to ensure DOM is ready (fonts already ready by now)
    requestAnimationFrame(tick);
    return;
  }
  const dt = (now - lastTick) / 1000;   // dt only advances after first frame
  lastTick = now;

  if (playing) {
    let t = time + dt;
    if (t >= DURATION) {
      t = window.__recording ? DURATION - 0.001 : 0;  // don't loop while recording, leave 0.001s to keep last frame
      if (!window.__recording) fired.clear();
    }
    time = t;
    render(time);
  }
  requestAnimationFrame(tick);
}

// ━━━━━━ boot ━━━━━━
// Don't fire rAF immediately at top level — wait for fonts
document.fonts.ready.then(() => {
  render(0);                 // paint initial frame (fonts ready)
  playing = true;
  requestAnimationFrame(tick);  // first tick will pair __ready + t=0
});

// ━━━━━━ seek interface (used by render-video for defensive correction) ━━━━━━
window.__seek = (t) => { fired.clear(); time = t; lastTick = null; render(t); };
```

**Why this template is correct**:

| Step | Why it must be this way |
|------|-------------|
| `lastTick = null` + first-frame `return` | Avoids folding the L seconds from "script load to first tick" into animation time |
| `playing = false` default | During font load, even if `tick` runs, time doesn't advance, avoiding render misalignment |
| `__ready` set on tick's first frame | Recording script begins counting at this moment; the corresponding frame is the animation's true t=0 |
| Starting tick only inside `document.fonts.ready.then(...)` | Avoids fallback-font width measurements; avoids first-frame font jumps |
| `window.__seek` exists | Lets `render-video.js` actively correct — second line of defense |

**Recording-script-side defenses**:
1. `addInitScript` injects `window.__recording = true` (before page goto)
2. `waitForFunction(() => window.__ready === true)` and record this offset for ffmpeg trim
3. **Additionally**: after `__ready`, actively `page.evaluate(() => window.__seek && window.__seek(0))` to forcibly zero any time drift the HTML may have — second line of defense, for HTMLs that don't strictly follow the starter template

**Validation**: after exporting MP4
```bash
ffmpeg -i video.mp4 -ss 0 -vframes 1 frame-0.png
ffmpeg -i video.mp4 -ss $DURATION-0.1 -vframes 1 frame-end.png
```
The first frame must be the animation's t=0 initial state (not mid-animation, not black), and the last frame must be the animation's final state (not some moment of a second loop).

**Reference implementation**: the Stage component in `assets/animations.jsx` and `scripts/render-video.js` already implement this protocol. Handwritten HTML must use the starter tick template — every line defends against a specific bug.

## 13. Forbid Loop During Recording — `window.__recording` Signal

**The pitfall**: animation Stage defaults to `loop=true` (convenient for browser viewing). `render-video.js` waits another 300ms buffer after the duration before stopping, which lets Stage enter the next loop cycle. When ffmpeg `-t DURATION` truncates, the last 0.5-1s falls into the next loop — the video ending suddenly returns to frame 1 (Scene 1), and viewers think the video is buggy.

**Root cause**: there's no "I am recording" handshake protocol between recording script and HTML. The HTML doesn't know it's being recorded and continues looping as in browser interaction.

**Rules**:

1. **Recording script**: in `addInitScript`, inject `window.__recording = true` (before page goto):
   ```js
   await recordCtx.addInitScript(() => { window.__recording = true; });
   ```

2. **Stage component**: detects this signal and forces loop=false:
   ```js
   const effectiveLoop = (typeof window !== 'undefined' && window.__recording) ? false : loop;
   // ...
   if (next >= duration) return effectiveLoop ? 0 : duration - 0.001;
   //                                                       ↑ leave 0.001 to prevent Sprite end=duration from being shut off
   ```

3. **fadeOut on the ending Sprite**: in recording scenarios, set `fadeOut={0}`, otherwise the video tail will fade to transparent/dark — users expect to see the final frame clearly, not a fade out. For handwritten HTML, recommend `fadeOut={0}` on the ending Sprite.

**Reference implementation**: Stage in `assets/animations.jsx` / `scripts/render-video.js` both have this handshake built in. Handwritten Stages must implement `__recording` detection — otherwise this pitfall is guaranteed during recording.

**Validation**: after exporting MP4, run `ffmpeg -ss 19.8 -i video.mp4 -frames:v 1 end.png` and check that the last 0.2 seconds is still the expected final frame, with no sudden cut to another scene.

## 14. 60fps Video Defaults to Frame Duplication — minterpolate Has Poor Compatibility

**The pitfall**: `convert-formats.sh` generated 60fps MP4 using `minterpolate=fps=60:mi_mode=mci...`. Some versions of macOS QuickTime / Safari can't open it (black frame or outright refusal). VLC / Chrome can.

**Root cause**: the H.264 elementary stream output by minterpolate contains certain SEI / SPS fields that some players have trouble parsing.

**Rules**:

- Default 60fps uses simple `fps=60` filter (frame duplication); broad compatibility (QuickTime/Safari/Chrome/VLC all open it)
- High-quality interpolation uses the `--minterpolate` flag explicitly — but **must be tested locally** in the target player before delivery
- The value of the 60fps tag is **upload-platform algorithmic recognition** (Bilibili / YouTube prioritize 60fps streams); the actual perceived smoothness improvement for CSS animation is marginal
- Add `-profile:v high -level 4.0` to improve H.264 universal compatibility

**`convert-formats.sh` already defaults to compatibility mode**. If you need high-quality interpolation, add the `--minterpolate` flag:
```bash
bash convert-formats.sh input.mp4 --minterpolate
```

## 15. `file://` + External `.jsx` CORS Trap — Single-File Delivery Must Inline the Engine

**The pitfall**: the animation HTML used `<script type="text/babel" src="animations.jsx"></script>` to load the engine externally. Double-clicking locally (`file://` scheme) → Babel Standalone's XHR fetch of `.jsx` → Chrome reports `Cross origin requests are only supported for protocol schemes: http, https, chrome, chrome-extension...` → entire page goes black; no `pageerror` is fired, only a console error, easily misdiagnosed as "animation didn't trigger."

Spinning up an HTTP server may not save you either — if the local machine has a global proxy, `localhost` may also go through the proxy and return 502 / connection failures.

**Rules**:

- **Single-file delivery (HTML you double-click to open)** → `animations.jsx` must be **inlined** into a `<script type="text/babel">...</script>` tag; don't use `src="animations.jsx"`
- **Multi-file project (run an HTTP server to demo)** → external loading is fine, but the delivery must clearly state the `python3 -m http.server 8000` command
- Decision criterion: is what you deliver to the user "an HTML file" or "a project directory with a server"? The former uses inlining
- The Stage component / animations.jsx is often 200+ lines — pasting them into an HTML `<script>` block is totally acceptable, don't worry about size

**Minimum validation**: double-click the HTML you generated; **don't** open it through any server. If the Stage shows the first frame normally, it passes.

## 16. Cross-Scene Inverted-Color Context — Don't Hardcode Colors on In-Frame Elements

**The pitfall**: in a multi-scene animation, `ChapterLabel` / `SceneNumber` / `Watermark` and other elements that **appear across scenes** had `color: '#1A1A1A'` (dark text) hardcoded in the components. The first 4 light-background scenes were OK; on the 5th, black-background scene, "05" and the watermark vanished — no error, no check triggered, key info silently invisible.

**Rules**:

- **In-frame elements reused across scenes** (chapter labels / scene numbers / timecodes / watermarks / copyright bars) **must not hardcode color values**
- Use one of three approaches:
  1. **`currentColor` inheritance**: the element only writes `color: currentColor`; the parent scene container sets `color: <computed>`
  2. **invert prop**: the component accepts `<ChapterLabel invert />` to manually toggle dark/light
  3. **Auto-compute from background**: `color: contrast-color(var(--scene-bg))` (CSS 4 new API, or JS judgment)
- Before delivery, use Playwright to grab a representative frame of **each scene** and visually verify "cross-scene elements" are visible across them all

The trickiness of this pitfall is — **no bug warning fires**. Only human eyes or OCR can catch it.

## Quick Self-Check (5 Seconds Before Starting)

- [ ] Every parent of a `position: absolute` has `position: relative`?
- [ ] All special characters used in the animation (`␣` `⌘` `emoji`) exist in the font?
- [ ] Grid/Flex template counts match JS data array lengths?
- [ ] Scene transitions cross-fade with no >0.3s pure blank?
- [ ] DOM measurement code wrapped in `document.fonts.ready.then()`?
- [ ] `render(t)` is pure, or has an explicit reset mechanism?
- [ ] Frame 0 is the full initial state, not blank?
- [ ] No "pseudo chrome" decoration (progress bar / timecode / bottom credit colliding with Stage scrubber) inside the frame?
- [ ] Animation tick's first frame synchronously sets `window.__ready = true`? (Built into animations.jsx; add it yourself in handwritten HTML)
- [ ] Stage detects `window.__recording` and forces loop=false? (Mandatory in handwritten HTML)
- [ ] Ending Sprite's `fadeOut` set to 0 (video tail holds a clear frame)?
- [ ] 60fps MP4 defaults to frame-duplication mode (compatibility); add `--minterpolate` only for high-quality interpolation?
- [ ] After export, sample frame 0 + frame end to verify they are the animation's initial / final state?
- [ ] Specific brand involved (Stripe/Anthropic/Lovart/...): "Brand Asset Protocol" (SKILL.md §1.a five steps) followed? Is `brand-spec.md` written?
- [ ] Single-file-delivery HTML: is `animations.jsx` inlined, not `src="..."`? (External .jsx hits CORS black-screen under file://)
- [ ] Cross-scene elements (chapter labels / watermark / scene numbers) free of hardcoded color? Visible against every scene's background?

# Animations: Timeline Animation Engine

Read this when making animation / motion-design HTML. Principles, usage, typical patterns.

## Core Pattern: Stage + Sprite

Our animation system (`assets/animations.jsx`) provides a timeline-driven engine:

- **`<Stage>`**: container for the entire animation, automatically provides auto-scale (fit viewport) + scrubber + play/pause/loop control
- **`<Sprite start end>`**: a time segment. A Sprite is only visible between `start` and `end`. Inside, you can read its local progress `t` (0→1) via the `useSprite()` hook
- **`useTime()`**: read the current global time (seconds)
- **`Easing.easeInOut` / `Easing.easeOut` / ...**: easing functions
- **`interpolate(t, from, to, easing?)`**: interpolate based on t

This pattern borrows ideas from Remotion / After Effects, but is lightweight and zero-dependency.

## Getting Started

```html
<script type="text/babel" src="animations.jsx"></script>
<script type="text/babel">
  const { Stage, Sprite, useTime, useSprite, Easing, interpolate } = window.Animations;

  function Title() {
    const { t } = useSprite();  // local progress 0→1
    const opacity = interpolate(t, [0, 1], [0, 1], Easing.easeOut);
    const y = interpolate(t, [0, 1], [40, 0], Easing.easeOut);
    return (
      <h1 style={{ 
        opacity, 
        transform: `translateY(${y}px)`,
        fontSize: 120,
        fontWeight: 900,
      }}>
        Hello.
      </h1>
    );
  }

  function Scene() {
    return (
      <Stage duration={10}>  {/* 10-second animation */}
        <Sprite start={0} end={3}>
          <Title />
        </Sprite>
        <Sprite start={2} end={5}>
          <SubTitle />
        </Sprite>
        {/* ... */}
      </Stage>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<Scene />);
</script>
```

## Common Animation Patterns

### 1. Fade In / Fade Out

```jsx
function FadeIn({ children }) {
  const { t } = useSprite();
  const opacity = interpolate(t, [0, 0.3], [0, 1], Easing.easeOut);
  return <div style={{ opacity }}>{children}</div>;
}
```

**Note about ranges**: `[0, 0.3]` means "complete fade-in within the first 30% of sprite time," then opacity stays at 1.

### 2. Slide In

```jsx
function SlideIn({ children, from = 'left' }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, 0.4], [0, 1], Easing.easeOut);
  const offset = (1 - progress) * 100;
  const directions = {
    left: `translateX(-${offset}px)`,
    right: `translateX(${offset}px)`,
    top: `translateY(-${offset}px)`,
    bottom: `translateY(${offset}px)`,
  };
  return (
    <div style={{
      transform: directions[from],
      opacity: progress,
    }}>
      {children}
    </div>
  );
}
```

### 3. Character-by-Character Typewriter

```jsx
function Typewriter({ text }) {
  const { t } = useSprite();
  const charCount = Math.floor(text.length * Math.min(t * 2, 1));
  return <span>{text.slice(0, charCount)}</span>;
}
```

### 4. Number Count-Up

```jsx
function CountUp({ from = 0, to = 100, duration = 0.6 }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, duration], [0, 1], Easing.easeOut);
  const value = Math.floor(from + (to - from) * progress);
  return <span>{value.toLocaleString()}</span>;
}
```

### 5. Phased Explanation (Typical Educational Animation)

```jsx
function Scene() {
  return (
    <Stage duration={20}>
      {/* Phase 1: present the problem */}
      <Sprite start={0} end={4}>
        <Problem />
      </Sprite>

      {/* Phase 2: present the approach */}
      <Sprite start={4} end={10}>
        <Approach />
      </Sprite>

      {/* Phase 3: present the result */}
      <Sprite start={10} end={16}>
        <Result />
      </Sprite>

      {/* Caption shown throughout */}
      <Sprite start={0} end={20}>
        <Caption />
      </Sprite>
    </Stage>
  );
}
```

## Easing Functions

Preset easing curves:

| Easing | Behavior | Use for |
|--------|------|------|
| `linear` | Constant speed | Scrolling captions, continuous animation |
| `easeIn` | Slow → fast | Exit / disappear |
| `easeOut` | Fast → slow | Entrance / appearance |
| `easeInOut` | Slow → fast → slow | Position changes |
| **`expoOut`** ⭐ | **Exponential ease-out** | **Anthropic-grade main easing** (sense of physical weight) |
| **`overshoot`** ⭐ | **Elastic bounce-back** | **Toggle / button pop / emphasized interaction** |
| `spring` | Spring | Interaction feedback, geometry settling |
| `anticipation` | Reverse first then forward | Emphasized action |

**The default main easing is `expoOut`** (not `easeOut`) — see `animation-best-practices.md` §2.
Entrances use `expoOut`, exits use `easeIn`, toggles use `overshoot` — the basis of Anthropic-grade animation.

## Rhythm and Duration Guide

### Micro-interaction (0.1-0.3s)
- Button hover
- Card expand
- Tooltip appear

### UI transition (0.3-0.8s)
- Page change
- Modal appearance
- List item insertion

### Narrative animation (2-10s per phase)
- A single phase of concept explanation
- Reveal of a data chart
- Scene transition

### Single narrative segment never exceeds 10 seconds
Human attention is limited. Tell one thing in 10 seconds, then move on to the next.

## Order of Operations When Designing Animation

### 1. Story First, Animation Second

**Wrong**: think of fancy animation first, then stuff content into it
**Right**: figure out exactly what info you want to convey, then use animation to serve that info

Animation is **signal**, not **decoration**. A fade-in says "this is important, look here" — if everything fades in, the signal disappears.

### 2. Write the Timeline by Scene

```
0:00 - 0:03   Problem appears (fade in)
0:03 - 0:06   Problem zooms / expands (zoom + pan)
0:06 - 0:09   Solution appears (slide in from right)
0:09 - 0:12   Solution explained (typewriter)
0:12 - 0:15   Result demo (counter up + chart reveal)
0:15 - 0:18   One-line summary (static, read for 3 seconds)
0:18 - 0:20   CTA or fade out
```

Write the timeline before writing components.

### 3. Assets First

Have the images / icons / fonts that the animation needs **prepared** in advance. Don't go hunting for assets mid-build — it breaks the rhythm.

## Common Issues

**Animation jank**
→ Mostly layout thrashing. Use `transform` and `opacity`; don't animate `top`/`left`/`width`/`height`/`margin`. Browsers GPU-accelerate `transform`.

**Animation too fast, can't read it**
→ A Chinese character takes 100-150ms to read; a word, 300-500ms. If you're telling a story with text, give each line at least 3 seconds.

**Animation too slow, viewer bored**
→ Interesting visual changes need density. Static frames over 5 seconds become boring.

**Multiple animations interfere with each other**
→ Use CSS `will-change: transform` to tell the browser this element will move, reducing reflow.

**Recording as video**
→ Use the toolchain bundled with this skill (one command, three formats): see `video-export.md`
- `scripts/render-video.js` — HTML → 25fps MP4 (Playwright + ffmpeg)
- `scripts/convert-formats.sh` — 25fps MP4 → 60fps MP4 + optimized GIF
- Need more precise per-frame rendering? Make `render(t)` a pure function — see `animation-pitfalls.md` item 5

## Working with Video Tools

This skill produces **HTML animation** (running in the browser). If the final output is to be used as video material:

- **Short animation / concept demo**: build with HTML animation here → screen-record
- **Long video / narrative**: this skill focuses on HTML animation; for long video, use an AI video-generation skill or professional video software
- **Motion graphics**: pro tools like After Effects / Motion Canvas are better fits

## About Popmotion and Other Libraries

If you really need physics-based animation (springs, decay, keyframes with precise timing) and our engine can't handle it, fall back to Popmotion:

```html
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

But **try our engine first**. It covers 90% of cases.

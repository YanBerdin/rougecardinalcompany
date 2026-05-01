# Tweaks: Real-Time Parameter Tuning for Design Variations

Tweaks is a core capability of this skill — it lets the user switch variations and adjust parameters live, without touching the code.

**Cross-agent compatibility**: some design-agent native environments (like Claude.ai Artifacts) rely on the host's postMessage to write tweak values back into the source for persistence. This skill uses a **pure-frontend localStorage approach** — same effect (state survives refresh), but persistence happens in browser localStorage rather than the source file. This works in any agent environment (Claude Code / Codex / Cursor / Trae / etc.).

## When to Add Tweaks

- The user explicitly asks to "tweak parameters" or "switch between versions"
- The design has multiple variations worth comparing
- The user didn't ask, but you judge **a few illustrative tweaks would help the user see the possibility space**

Default recommendation: **add 2-3 tweaks to every design** (color theme / font size / layout variant) even when the user didn't ask — showing the possibility space is part of the design service.

## Implementation (pure-frontend version)

### Basic structure

```jsx
const TWEAK_DEFAULTS = {
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
};

function useTweaks() {
  const [tweaks, setTweaks] = React.useState(() => {
    try {
      const stored = localStorage.getItem('design-tweaks');
      return stored ? { ...TWEAK_DEFAULTS, ...JSON.parse(stored) } : TWEAK_DEFAULTS;
    } catch {
      return TWEAK_DEFAULTS;
    }
  });

  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      localStorage.setItem('design-tweaks', JSON.stringify(next));
    } catch {}
  };

  const reset = () => {
    setTweaks(TWEAK_DEFAULTS);
    try {
      localStorage.removeItem('design-tweaks');
    } catch {}
  };

  return { tweaks, update, reset };
}
```

### Tweaks panel UI

Floating panel in the bottom-right corner. Collapsible:

```jsx
function TweaksPanel() {
  const { tweaks, update, reset } = useTweaks();
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
    }}>
      {open ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          width: 280,
          fontFamily: 'system-ui',
          fontSize: 13,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <strong>Tweaks</strong>
            <button onClick={() => setOpen(false)} style={{
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
            }}>×</button>
          </div>

          {/* Color */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>Primary color</div>
            <input 
              type="color" 
              value={tweaks.primaryColor} 
              onChange={e => update({ primaryColor: e.target.value })}
              style={{ width: '100%', height: 32 }}
            />
          </label>

          {/* Font-size slider */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>Font size ({tweaks.fontSize}px)</div>
            <input 
              type="range" 
              min={12} max={24} step={1}
              value={tweaks.fontSize}
              onChange={e => update({ fontSize: +e.target.value })}
              style={{ width: '100%' }}
            />
          </label>

          {/* Density options */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 4, color: '#666' }}>Density</div>
            <select 
              value={tweaks.density}
              onChange={e => update({ density: e.target.value })}
              style={{ width: '100%', padding: 6 }}
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>

          {/* Dark mode toggle */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <input 
              type="checkbox" 
              checked={tweaks.dark}
              onChange={e => update({ dark: e.target.checked })}
            />
            <span>Dark mode</span>
          </label>

          <button onClick={reset} style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
          }}>Reset</button>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >⚙ Tweaks</button>
      )}
    </div>
  );
}
```

### Applying Tweaks

Use Tweaks in the main component:

```jsx
function App() {
  const { tweaks } = useTweaks();

  return (
    <div style={{
      '--primary': tweaks.primaryColor,
      '--font-size': `${tweaks.fontSize}px`,
      background: tweaks.dark ? '#0A0A0A' : '#FAFAFA',
      color: tweaks.dark ? '#FAFAFA' : '#1A1A1A',
    }}>
      {/* your content */}
      <TweaksPanel />
    </div>
  );
}
```

Use the variables in CSS:

```css
button.cta {
  background: var(--primary);
  color: white;
  font-size: var(--font-size);
}
```

## Typical Tweak Options

What tweaks to add for different kinds of designs:

### Universal
- Primary color (color picker)
- Font size (slider 12-24px)
- Typeface (select: display font vs body font)
- Dark mode (toggle)

### Slide deck
- Theme (light / dark / brand)
- Background style (solid / gradient / image)
- Type contrast (more decorative vs more restrained)
- Information density (minimal / standard / dense)

### Product prototype
- Layout variant (layout A / B / C)
- Interaction speed (animation speed 0.5x-2x)
- Data volume (mock data count 5 / 20 / 100)
- State (empty / loading / success / error)

### Animation
- Speed (0.5x-2x)
- Loop (once / loop / ping-pong)
- Easing (linear / easeOut / spring)

### Landing page
- Hero style (image / gradient / pattern / solid)
- CTA copy (a few variants)
- Structure (single column / two column / sidebar)

## Tweaks Design Principles

### 1. Meaningful options, not gimmicks

Every tweak must surface a **real design choice**. Don't add tweaks no one would actually toggle (e.g. a 0-50px border-radius slider — every intermediate value is ugly).

A good tweak exposes **discrete, considered variations**:
- "Corner style": no rounding / slight rounding / heavy rounding (three options)
- Not: "Corner radius": 0-50px slider

### 2. Less is more

A design's Tweaks panel should have **at most 5-6** options. More than that and it becomes a "configuration page", losing the spirit of fast variation exploration.

### 3. The defaults are a finished design

Tweaks is **icing on the cake**. The defaults must already be a complete, shippable design. What the user sees with the Tweaks panel closed is the deliverable.

### 4. Group sensibly

When there are many options, group them:

```
---- Visual ----
Primary color | Font size | Dark mode

---- Layout ----
Density | Sidebar position

---- Content ----
Data volume | State
```

## Forward Compatibility with Source-Level Persistence Hosts

If you later want the design to also work in environments with source-level tweak persistence (like Claude.ai Artifacts), preserve the **EDITMODE marker block**:

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "density": "comfortable",
  "dark": false
}/*EDITMODE-END*/;
```

The marker block is **inert** in the localStorage approach (just a normal comment), but a host that supports source-level write-back will read it and persist at the source level. Adding this is harmless in the current environment and keeps you forward-compatible.

## FAQ

**The Tweaks panel covers the design content**
→ Make it closable. Default to closed, show a small button, expand only when the user clicks.

**The user has to redo their tweak settings each time**
→ Already using localStorage. If state doesn't persist across refresh, check whether localStorage is available (incognito mode fails — wrap with try/catch).

**I want multiple HTML pages to share tweaks**
→ Add a project name to the localStorage key: `design-tweaks-[projectName]`.

**I want tweaks to depend on each other**
→ Add logic inside `update`:

```jsx
const update = (patch) => {
  let next = { ...tweaks, ...patch };
  // dependency: when dark mode is selected, swap the text color automatically
  if (patch.dark === true && !patch.textColor) {
    next.textColor = '#F0EEE6';
  }
  setTweaks(next);
  localStorage.setItem(...);
};
```

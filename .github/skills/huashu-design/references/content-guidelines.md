# Content Guidelines: Anti-AI-Slop, Content Rules, Scale Specs

The traps AI design falls into most easily. This is a "what NOT to do" list — more important than "what to do," because AI slop is the default, and if you don't actively avoid it, it happens.

## Full AI Slop Blacklist

### Visual Traps

**❌ Aggressive gradient backgrounds**
- Purple → pink → blue full-screen gradient (the typical taste of AI-generated web pages)
- Rainbow gradients in any direction
- Mesh gradient covering the background
- ✅ If you must use a gradient: subtle, monochromatic, intentionally as accent (e.g. button hover)

**❌ Rounded card + left border accent color**
```css
/* Signature look of AI-flavored cards */
.card {
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  padding: 16px;
}
```
This kind of card is everywhere in AI-generated dashboards. Want emphasis? Use a more designerly approach: background contrast, weight/size contrast, plain dividers, or no card at all.

**❌ Emoji decoration**
Unless the brand itself uses emoji (e.g. Notion, Slack), don't put emoji in UI. **Especially don't**:
- 🚀 ⚡️ ✨ 🎯 💡 in front of titles
- ✅ on feature lists
- → in CTA buttons (a standalone arrow is OK; an emoji arrow is not)

If you have no icon, use a real icon library (Lucide / Heroicons / Phosphor), or a placeholder.

**❌ SVG-drawn imagery**
Don't try to draw with SVG: people, scenes, devices, objects, abstract art. AI-drawn SVG imagery screams AI on first glance — childish and cheap. **A gray rectangle with the label "illustration slot 1200×800" is 100× better than a clumsy SVG hero illustration**.

The only valid uses for SVG:
- Real icons (16×16 to 32×32 scale)
- Geometric shapes as decoration
- Data viz charts

**❌ Excessive iconography**
Not every title / feature / section needs an icon. Icon overuse makes the UI feel like a toy. Less is more.

**❌ "Data slop"**
Fabricated stats as decoration:
- "10,000+ happy customers" (you don't actually know)
- "99.9% uptime" (don't write it without real data)
- Decorative "metric cards" composed of icon + number + word
- Mock tables with fake fancy data dressing

If there's no real data, leave a placeholder or ask the user.

**❌ "Quote slop"**
Fabricated testimonials and famous-quote decorations. Leave a placeholder and ask the user for real quotes.

### Typography Traps

**❌ Avoid these overused fonts**:
- Inter (default of AI-generated web)
- Roboto
- Arial / Helvetica
- Pure system font stack
- Fraunces (AI discovered it and overused it)
- Space Grotesk (AI's recent favorite)

**✅ Use a distinctive display + body pair**. Direction ideas:
- Serif display + sans body (editorial feel)
- Mono display + sans body (technical feel)
- Heavy display + light body (contrast)
- Variable font for hero weight animation

Type resources:
- Underused good options on Google Fonts (Instrument Serif, Cormorant, Bricolage Grotesque, JetBrains Mono)
- Open-source font sites (Fraunces siblings, Adobe Fonts)
- Don't make up font names

### Color Traps

**❌ Inventing colors from scratch**
Don't design an entire unfamiliar palette from zero. It's usually disharmonious.

**✅ Strategy**:
1. Have a brand color → use it; missing color tokens are interpolated via oklch
2. No brand color but have a reference → eyedrop from reference product screenshots
3. Totally from scratch → pick a known color system (Radix Colors / Tailwind default palette / Anthropic brand); don't tune your own

**Defining colors with oklch** is the most modern approach:
```css
:root {
  --primary: oklch(0.65 0.18 25);      /* Warm terracotta */
  --primary-light: oklch(0.85 0.08 25); /* Same hue, lighter */
  --primary-dark: oklch(0.45 0.20 25);  /* Same hue, darker */
}
```
oklch keeps hue stable when you adjust lightness; better than hsl.

**❌ Casually inverting colors for dark mode**
It's not a simple invert. Good dark mode requires re-tuning saturation, contrast, and accent colors. If you don't want to do dark mode, don't.

### Layout Traps

**❌ Bento grid overuse**
Every AI-generated landing page wants a bento. Unless your information structure genuinely fits bento, use another layout.

**❌ Big hero + 3-column features + testimonials + CTA**
This landing page template has been done to death. If you want to innovate, actually innovate.

**❌ Every card in a card grid looks the same**
Asymmetric, varied sizes, some with images and some text-only, some spanning columns — that's what real design looks like.

## Content Guidelines

### 1. Don't add filler content

Every element must earn its place. Whitespace is a design problem, solved with **composition** (contrast, rhythm, breathing) — **not** by filling it with content.

**How to identify filler**:
- If you remove this content, does the design get worse? If "no," remove it.
- What real problem does this element solve? If it's "to make the page less empty," delete it.
- Is this stat / quote / feature backed by real data? If not, don't make it up.

"One thousand no's for every yes."

### 2. Ask before adding material

You think adding another paragraph / page / section would be better? Ask the user first; don't add unilaterally.

Reasons:
- The user knows their audience better than you do
- Adding content has cost; the user may not want it
- Adding unilaterally violates the "junior designer reporting to senior" relationship

### 3. Create a system up front

After exploring the design context, **state out loud the system you intend to use** and let the user confirm:

```markdown
My design system:
- Color: #1A1A1A primary + #F0EEE6 background + #D97757 accent (from your brand)
- Type: Instrument Serif as display + Geist Sans as body
- Rhythm: section titles use full-bleed colored background + white text; normal sections use white background
- Imagery: hero uses full-bleed photo; feature sections use placeholders pending your assets
- At most 2 background colors; avoid clutter

Confirm this direction and I'll start.
```

Wait for user confirmation before acting. This check-in avoids "halfway through, the direction was wrong."

## Scale Specs

### Slides (1920×1080)

- Body minimum **24px**, ideal 28-36px
- Title 60-120px
- Section title 80-160px
- Hero headline can use 180-240px
- Never use <24px text on a slide

### Print Documents

- Body minimum **10pt** (≈13.3px), ideal 11-12pt
- Headings 18-36pt
- Caption 8-9pt

### Web and Mobile

- Body minimum **14px** (16px for senior-friendly)
- Mobile body **16px** (avoids iOS auto-zoom)
- Hit target (clickable element) minimum **44×44px**
- Line height 1.5-1.7 (Chinese 1.7-1.8)

### Contrast

- Body vs background **at least 4.5:1** (WCAG AA)
- Large text vs background **at least 3:1**
- Use Chrome DevTools accessibility tools to check

## CSS Power Tools

**Modern CSS features** are a designer's best friend; use them boldly:

### Typography

```css
/* Make headings break naturally; no last line with one orphan word */
h1, h2, h3 { text-wrap: balance; }

/* Body breaks; avoid widows and orphans */
p { text-wrap: pretty; }

/* Chinese typography: punctuation crunch, line start/end control */
p { 
  text-spacing-trim: space-all;
  hanging-punctuation: first;
}
```

### Layout

```css
/* CSS Grid + named areas = readability for days */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid aligns card contents */
.card { display: grid; grid-template-rows: subgrid; }
```

### Visual Effects

```css
/* Designed scrollbar */
* { scrollbar-width: thin; scrollbar-color: #666 transparent; }

/* Glassmorphism (use sparingly) */
.glass {
  backdrop-filter: blur(20px) saturate(150%);
  background: color-mix(in oklch, white 70%, transparent);
}

/* View transitions API for smooth page changes */
@view-transition { navigation: auto; }
```

### Interaction

```css
/* :has() selector makes conditional styles easy */
.card:has(img) { padding-top: 0; } /* Cards with image have no top padding */

/* Container queries make components truly responsive */
@container (min-width: 500px) { ... }

/* The new color-mix function */
.button:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
```

## Decision Quick Reference: When You're Hesitating

- Want to add a gradient? → probably don't
- Want to add an emoji? → don't
- Want to give a card rounded corners + left-border accent? → don't, use another way
- Want to draw a hero illustration in SVG? → don't, use a placeholder
- Want to add a decorative quote? → first ask the user if they have a real quote
- Want to add a row of icon features? → first ask if icons are needed; probably not
- Use Inter? → swap for something more distinctive
- Use a purple gradient? → swap for a justified palette

**When you feel "adding this would look better" — that's usually the AI slop signal**. Make the simplest version first; add only when the user asks.

---
name: Rouge Cardinal Company
description: Identity-first theater website with warm editorial contrast and tactile UI states.
colors:
  background: "#f5f3f0"
  foreground: "#1c1c1c"
  card: "#efece7"
  card-foreground: "#1c1c1c"
  popover: "#efece7"
  popover-foreground: "#1c1c1c"
  primary: "#8e1111"
  primary-foreground: "#f5f3f0"
  secondary: "#d4d4d4"
  secondary-foreground: "#1c1c1c"
  muted: "#ebebeb"
  muted-foreground: "#5c5c5c"
  accent: "#d4d4d4"
  accent-foreground: "#1c1c1c"
  destructive: "#ff4037"
  border: "#d4d4d4"
  border-primary: "#e84133"
  ring: "#a31414"
  gold: "#ddab2c"
  gold-light: "#efca6c"
  gold-dark: "#a07c22"
  gold-text: "#765c19"
  sidebar: "#f5f3f0"
  sidebar-foreground: "#1c1c1c"
  sidebar-primary: "#8e1111"
  sidebar-primary-foreground: "#f7f7f7"
  sidebar-accent: "#d4d4d4"
  sidebar-accent-foreground: "#565656"
  dark-background: "#1c1c1c"
  dark-foreground: "#faf4e7"
  dark-card: "#2a2a2a"
  dark-secondary: "#424242"
  dark-muted: "#292929"
  dark-muted-foreground: "#a3a3a3"
typography:
  display:
    fontFamily: "var(--font-playfair), serif"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.025em"
  label:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  sm: "calc(var(--radius) - 4px)"
  md: "calc(var(--radius) - 2px)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) + 4px)"
spacing:
  base: "0.25rem"
  input-y: "0.25rem"
  input-x: "0.75rem"
  card-padding: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
---

# Design System: Rouge Cardinal Company

## Overview

Creative North Star: "Editorial theater warmth with controlled dramatic contrast."

The current UI system combines warm paper-like surfaces with cardinal red accents and near-black text, then mirrors that language in dark mode through charcoal surfaces and preserved red accents. The visual tone is cultural and premium, with restrained density in the base UI and more expressive treatment in hero/header utilities.

Heading typography in marketing pages defaults to Playfair while body and interface text use Geist, creating a clear editorial vs functional split. The system avoids pure black and pure white in core semantic tokens and uses warm-tinted neutrals as primary surface anchors.

Key Characteristics:

- Warm neutral base surfaces for readability and brand tone.
- Cardinal red as the functional accent for primary actions and focus.
- Shared tokenized shadows and blur values for depth and glass effects.
- Motion-aware behavior with reduced-motion fallbacks implemented.

Source files:

- app/globals.css
- tailwind.config.ts
- app/layout.tsx
- app/(marketing)/layout.tsx

## Colors

The palette is warm-neutral first, with cardinal red and gold accents as identity carriers.

### Primary

- Cardinal Red (`#8e1111`): Main action color (`--primary`), sidebar primary roles (`--sidebar-primary`, light).
- Ring Red (`#a31414`): Focus ring and chart-2 accent (`--ring`, `--chart-2`).

### Secondary

- Neutral Gray (`#d4d4d4`): Secondary and accent surface roles, border baseline (`--secondary`, `--accent`, `--border`).
- Soft Gray (`#ebebeb`): Muted surfaces and low-emphasis containers (`--muted`).

### Tertiary

- Gold (`#ddab2c`): Premium accent family (`--gold`, `--gold-light`, `--gold-dark`, `--gold-text`) used for highlight styles and gradient text utility.

### Neutral

- Warm Paper (`#f5f3f0`): Global background and primary foreground contrast pair.
- Ink (`#1c1c1c`): Main text and dark base.
- Card Light (`#efece7`): Card/popover surfaces in light mode.
- Dark Card (`#2a2a2a`), Dark Secondary (`#424242`), Dark Muted (`#292929`): dark mode depth ladder.
- Destructive (`#ff4037`): destructive actions and invalid/error signaling.

Named rules:

- The Warm Surface Rule. Base surfaces are warm-tinted neutrals, not pure white.
- The Cardinal Focus Rule. Interactive emphasis aligns with cardinal red for ring/primary behaviors.

Source files:

- app/globals.css
- tailwind.config.ts

## Typography

Display Font: Playfair (`var(--font-playfair), serif`)
Body Font: Geist Sans (`var(--font-geist-sans), sans-serif`)
Label/Mono Font: Geist Sans for labels, Geist Mono available globally via root font vars.

Character: Editorial hierarchy for marketing content, pragmatic sans-serif for interface controls and dense interaction points.

### Hierarchy

- Display: Marketing `h1/h2/h3/h4` default to Playfair inside `.marketing-content` unless explicitly opted out.
- Headline/Title: UI components typically use semibold weights (`font-semibold`) with compact leading (`leading-none`, `tracking-tight` in cards).
- Body: Geist Sans with default body rendering plus global letter spacing `var(--tracking-normal)`.
- Label: Button/input labels rely on compact UI sizing (`text-sm`, `font-medium` to `font-semibold`) for control clarity.

Named rules:

- The Marketing Serif Rule. Marketing headings inherit Playfair by default; explicit utility classes opt out.
- The UI Sans Rule. Inputs, buttons, and operational text remain in Geist Sans.

Source files:

- app/layout.tsx
- app/(marketing)/layout.tsx
- app/globals.css
- components/ui/button.tsx
- components/ui/card.tsx

## Elevation

Depth is handled through tokenized shadow tiers combined with selective blur/glass layers in header and hero-oriented components.

### Shadow Vocabulary

- `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`: full scale in light and dark with stronger opacity in dark mode.
- Cards use `shadow-md` at rest and `hover:shadow-lg` for interactive lift.
- Buttons commonly use `shadow-md` with hover softening (`hover:shadow-sm`) across variants.
- Header glass states (`.header-scrolled`, `.header-solid`) combine backdrop blur (`--blur-3xl`, `--blur-lg`) and elevated shadows.

Named rules:

- The Tokenized Depth Rule. Elevation values come from shared shadow tokens, with per-state swaps rather than ad hoc shadows.
- The Glass Is Scoped Rule. Blur-heavy glass effects are limited to header/navigation and dedicated utility classes.

Source files:

- app/globals.css
- components/ui/card.tsx
- components/ui/button.tsx

## Components

### Buttons

- File: components/ui/button.tsx
- Variants: `default`, `destructive`, `outline`, `outline-primary`, `outline-destructive`, `secondary`, `ghost`, `ghost-destructive`, `link`.
- Sizes: `default`, `sm`, `lg`, `xl`, `icon`, `icon-sm`, `icon-lg`.
- Role: High-contrast action system with semibold text, shadowed tactile states, and explicit focus ring behavior.

### Cards

- File: components/ui/card.tsx
- Role: Rounded-xl surface container with border + shadow and hover-lift (`hover:shadow-lg`).
- Sub-parts: Header/Title/Description/Content/Footer preserve consistent internal padding rhythm (`p-6`).

### Inputs and Textareas

- Files: components/ui/input.tsx, components/ui/textarea.tsx
- Role: Soft-surface fields (`bg-card`) with border token, strong focus ring, and invalid states via destructive ring/border patterns.

### Sidebar

- File: components/ui/sidebar.tsx
- Variants: `sidebar`, `floating`, `inset`; collapsible modes `offcanvas`, `icon`, `none`.
- Role: Tokenized navigation shell with desktop and mobile behaviors, cookie-persisted open state, and keyboard shortcut toggle (`Cmd/Ctrl + b`).

### Design utilities (global)

- File: app/globals.css
- Utility families: `liquid-glass*`, `nav-link-glass`, `ripple-effect`, `hero-gradient`, `card-hover`, logo marquee tracks.
- Role: Brand-layer visual polish for header, hero, navigation, and logo strips.

## Do's and Don'ts

Do:

- Use semantic tokens via Tailwind mappings (`hsl(var(--token))`) instead of raw colors in component code.
- Keep marketing headings in Playfair unless an explicit font utility changes the family.
- Reuse shared shadows/blur tokens for depth and glass effects.
- Respect reduced motion: animation classes are disabled under `prefers-reduced-motion`.

Don't:

- Introduce pure black/white base semantic tokens that bypass the warm-neutral palette.
- Add one-off shadow/blur constants when equivalent token tiers already exist.
- Bypass button/input focus styles with custom outlines that break ring consistency.
- Apply glass overlays indiscriminately outside the existing scoped utility classes.

Source files:

- app/globals.css
- tailwind.config.ts
- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/input.tsx
- components/ui/textarea.tsx
- components/ui/sidebar.tsx

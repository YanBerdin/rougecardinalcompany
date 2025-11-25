---
name: rouge-cardinal-frontend
description: Create distinctive, production-grade frontend interfaces for Rouge Cardinal Company with high design quality and theatrical sophistication. Use this skill when building web components, pages, or applications for the theater company.
---

This skill guides creation of distinctive, production-grade frontend interfaces that reflect Rouge Cardinal's theatrical identity while avoiding generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Project Context

Rouge Cardinal Company is a professional theater company website built with:
- **Frontend**: Next.js 15.4.5 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel

**Target Audience**:
- General public (theater enthusiasts)
- Press professionals
- Internal administrators
- Cultural organizers

## Design Philosophy

**Core Aesthetic**: Elegant, theatrical, refined yet expressive

**Tone**: Pick from these theatrical-inspired directions:
- **Dramatic Minimalism**: Generous negative space with powerful red accents
- **Editorial Sophistication**: Magazine-like layouts with serif headlines
- **Dark Stage**: Deep blacks with spotlight-like highlights
- **Theatrical Contrast**: Bold asymmetry with dramatic shadows
- **Refined Brutalism**: Raw geometry softened with warm tones

**Brand Identity**:
- Cardinal red (`#ad0000`) as the signature color
- Warm beige (`#faf4e7`) for contrast and readability
- Deep blacks (`#1C1C1C`) for theatrical depth
- Sophisticated serif displays paired with clean sans-serif UI

## Visual Design Principles

### Typography Hierarchy

```css
/* Display Typography (Theatrical Headlines) */
H1/H2 Large: Playfair Display, Cormorant Garamond, or Cinzel
  - Use sparingly for hero sections and major announcements
  - Pair with dramatic letter-spacing and generous line-height
  - Size: 3.5rem–6rem on desktop

/* Body & UI Typography */
Body/UI: Geist Sans (already configured)
  - Clean, readable, modern
  - Letter-spacing: var(--tracking-normal) = 0.025em
  - Use for navigation, body text, buttons, forms

/* Implementation Rules */
- Reserve display serifs for H1/H2 only
- Use Geist Sans for H3–H6 with weight variations
- Maintain consistent vertical rhythm (--space-* variables)
```

### Color Palette & Usage

**Primary Palette** (from globals.css):
```css
--primary: #ad0000          /* Cardinal Red - CTAs, accents */
--background: #faf4e7       /* Warm Beige - light mode */
--foreground: #1C1C1C       /* Deep Black - text */
--border-primary: #e84133   /* Accent borders */

/* Dark Mode */
--background (dark): #1C1C1C
--foreground (dark): #faf4e7
```

**Color Application Rules**:
- **Cardinal Red**: Primary CTAs, hover states, active links, dramatic accents
- **Deep Black**: Backgrounds for hero sections, cards in light mode
- **Warm Beige**: Alternate sections, press areas, light backgrounds
- **Use Sparingly**: Red should be impactful, not overwhelming (10-15% of screen)

### Spatial Composition

**Layout Principles**:
- **Generous Negative Space**: Use at least `--space-2xl` (4rem+) between sections
- **Asymmetric Grids**: Break traditional center alignment for visual interest
- **Diagonal Flow**: Guide eye movement with angled elements or overlays
- **Overlap Technique**: Images slightly overflow card edges for dynamism
- **Dark-First Approach**: Hero and upstream sections in dark, info/press in beige

**Spacing Scale** (use CSS variables):
```css
--space-sm: 0.5rem
--space-md: 1rem
--space-lg: 1.5rem
--space-xl: 2rem
--space-2xl: 4rem
--space-3xl: 6rem
```

### Visual Effects & Atmosphere

**Shadows** (theatrical depth):
```css
/* Soft base for cards */
--shadow-soft: 0 10px 30px rgba(10,10,10,0.25)

/* Dramatic hover */
--shadow-hover: 0 18px 45px rgba(10,10,10,0.32)

/* Use from globals.css */
--shadow-lg, --shadow-xl, --shadow-2xl
```

**Image Treatment**:
- Increase contrast (+10-15%)
- Add subtle grain texture overlay
- Apply vignette for edge darkening
- Use `object-cover` with gradient masks for text legibility
- Consistent aspect ratios per content type

**Backgrounds & Textures**:
- Gradient meshes with cardinal-to-black transitions
- Noise textures (subtle, < 5% opacity)
- Layered transparencies for glass effects
- Custom `.liquid-glass` utilities (already in globals.css)

## Component Design Guidelines

### Buttons & CTAs

**Primary CTA** (Cardinal Red):
```tsx
<button className="liquid-glass-black">
  Réserver des places
</button>
```
- Filled cardinal red background
- White text with text-shadow
- Medium rounded corners (--radius: 0.5rem)
- Box-shadow for depth
- **Use for**: Booking, donations, press kit downloads

**Secondary CTA** (Outlined):
```tsx
<button className="nav-link-glass">
  En savoir plus
</button>
```
- Subtle border with hover fill
- Glassmorphism effect on hover
- **Use for**: Alternative actions, navigation

**Rules**:
- Only ONE primary CTA per screen region
- Secondary for supporting actions
- Minimum 44×44px touch targets (accessibility)

### Cards & Content Blocks

**Standard Card Pattern**:
```tsx
<div className="liquid-glass card-hover">
  {/* Content with generous padding */}
</div>
```

**Hover Behaviors**:
- `translateY(-2px)` lift effect
- Shadow increase (--shadow-lg → --shadow-xl)
- Scale subtle elements (0.98 → 1)
- Duration: 300ms with ease-out

**Card Variants**:
- `.liquid-glass`: Standard glassmorphism
- `.liquid-glass-header`: Navigation bars
- `.liquid-glass-mobile`: Mobile menu overlays

### Navigation & Headers

**Header Behavior** (already implemented):
- Transparent on page load
- Glass blur on scroll (`.header-scrolled`)
- Smooth backdrop-filter transition
- Maintains logo stability (no floating animations)

**Navigation Links**:
```tsx
<Link className="nav-link-glass">
  Spectacles
</Link>
```
- Subtle hover states with contrast adaptation
- Active state indication (`.active`)
- Accessible focus rings (cardinal red)

## Animation & Motion Strategy

### Page Load Animation

**Hero Reveal** (implement once per page):
```tsx
// Stagger appearance: H1 → subheading → CTAs
animation: fade-in-up 420ms cubic-bezier(.22,.9,.32,1)
animation-delay: 0ms, 120ms, 240ms
```

**Timing**:
- H1: 0ms delay, 420ms duration
- Subheading: 120ms delay, 380ms duration
- CTAs: 240ms delay, 320ms duration
- Use `translate-y: 20px → 0` + opacity transition

### Micro-Interactions

**Buttons**:
```css
hover: scale(0.98 → 1) + background darken
active: scale(0.96) + shadow reduce
transition: 180ms ease-out
```

**Cards**:
```css
hover: translateY(-2px) + shadow increase
transition: 300ms cubic-bezier(.4,0,.2,1)
```

**Images/Media**:
```css
hover: scale(1.05) + filter adjust
transition: 500ms ease-out
overflow: hidden (on parent)
```

### Accessibility Considerations

- **Reduced Motion**: Respect `prefers-reduced-motion`
- **No Autoplay**: Avoid long autoplay animations (>500ms)
- **Keyboard Focus**: Visible rings with `--ring: #ad0000`
- **Carousel Controls**: Arrow keys + `aria-live` regions

## Content-Specific Guidelines

### Hero Sections

**Layout**:
- Full viewport height (min-h-screen)
- Dark background with dramatic image
- Large serif headline (4-6rem)
- Generous padding (space-3xl)
- Single primary CTA, centered or left-aligned

**Image Treatment**:
- Dark overlay (40-60% opacity)
- Vignette effect for text legibility
- High contrast image with grain texture

### Show/Production Cards

**Structure**:
```tsx
<div className="liquid-glass card-hover">
  <img /> {/* 16:9 or 4:3 aspect ratio */}
  <div className="p-6 space-y-4">
    <h3 className="text-2xl font-bold">Titre</h3>
    <p className="text-muted-foreground">Description</p>
    <div className="flex gap-3">
      <PrimaryCTA />
      <SecondaryCTA />
    </div>
  </div>
</div>
```

**Visual Hierarchy**:
- Image dominance (60% of card height)
- Clear title hierarchy
- Metadata in muted colors
- Action buttons at bottom

### Press/Professional Sections

**Aesthetic Shift**:
- Switch to warm beige background (`--background`)
- Increase contrast for readability
- Use structured layouts (grids, lists)
- Professional typography (no decorative serifs here)

**Components**:
- Download buttons with file icons
- Contact forms with clear labels
- Media gallery with thumbnails

## Implementation Best Practices

### shadcn/ui Integration

**Base Components** (use as building blocks):
- Button, Input, Card, Dialog, Select
- Override with design tokens via Tailwind config
- Create wrappers for consistency:

```tsx
// components/ui/primary-button.tsx
export function PrimaryButton({ children, ...props }) {
  return (
    <Button className="liquid-glass-black" {...props}>
      {children}
    </Button>
  )
}
```

### CSS Variables Usage

**Always prefer** CSS variables from globals.css:
```tsx
// Good
className="bg-primary text-primary-foreground"

// Avoid
className="bg-[#ad0000] text-white"
```

**Custom Utilities**:
- `.liquid-glass` for glassmorphism
- `.hero-gradient` for hero backgrounds
- `.card-hover` for interactive cards
- `.nav-link-glass` for navigation links

### Performance Optimization

**Images**:
- Use Next.js `<Image>` component
- Lazy loading for below-fold content
- WebP with fallbacks
- Responsive sizes via srcset

**Animations**:
- CSS transforms over position/width changes
- `will-change` for frequently animated elements
- Limit simultaneous animations (max 3-4)

**Bundle Size**:
- Import only needed shadcn components
- Tree-shake unused CSS utilities
- Code-split heavy components

## Quality Checklist

Before delivering any frontend component, verify:

- [ ] Uses project color palette (cardinal red, warm beige, deep black)
- [ ] Typography hierarchy follows rules (serif for H1/H2 large only)
- [ ] Spacing uses design tokens (--space-* variables)
- [ ] Shadows applied correctly (--shadow-* utilities)
- [ ] Animations respect reduced-motion preference
- [ ] Touch targets minimum 44×44px
- [ ] Keyboard navigation functional
- [ ] Focus states visible (cardinal red rings)
- [ ] Contrast ratios meet WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Dark mode tested and functional
- [ ] Mobile responsive (breakpoints: 640px, 768px, 1024px, 1280px)
- [ ] No generic AI aesthetics (Inter, purple gradients, predictable layouts)
- [ ] Theatrical sophistication maintained throughout

## Anti-Patterns to Avoid

**Never Use**:
- Generic font families (Inter, Roboto, Arial except as fallbacks)
- Purple gradients on white (cliché AI design)
- Predictable center-aligned hero sections
- Overused Space Grotesk or similar trendy fonts
- Floating/bouncing logo animations
- Auto-playing carousels without pause controls
- Low-contrast text on cardinal red without treatment
- Excessive glass effects (use sparingly for impact)

## Collaboration Notes

**For Developers**:
- All color values in globals.css as CSS variables
- Tailwind config extends with project tokens
- shadcn components in `components/ui/`
- Custom utilities in `@layer components`

**For Designers**:
- Design tokens documented in globals.css
- Component library: shadcn/ui base + custom wrappers
- Spacing scale: 0.5rem increments up to 6rem
- Always design with dark mode variant

**For Content Creators**:
- Image specs: 1920×1080 for hero, 800×600 for cards
- Video: 16:9 aspect ratio, max 2min autoplay
- Copy: Short headlines (< 60 chars), concise descriptions (< 160 chars)

## Resources & References

**Inspiration Sources**:
- [Théâtre National de Bretagne](https://www.t-n-b.fr/)
- [La Comédie-Française](https://www.comedie-francaise.fr/)
- [Royal Court Theatre](https://royalcourttheatre.com/)

**Technical Documentation**:
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## Version History

- v1.0 (2025-01): Initial skill definition
- Project aligns with Phase 1 roadmap (Site Vitrine)
- Design system based on existing globals.css tokens

# Design Context: Start From What Already Exists

**This is the most important one thing about this skill.**

Good hi-fi design always grows out of existing design context. **Doing hi-fi from scratch is a last resort and will inevitably produce something generic.** So whenever a design task starts, ask first: is there anything to reference?

## What Is Design Context

In priority order from highest to lowest:

### 1. The User's Design System / UI Kit
The user's existing component library, color tokens, typography spec, icon system. **The perfect case.**

### 2. The User's Codebase
If the user provides a codebase, it contains living component implementations. Read those component files:
- `theme.ts` / `colors.ts` / `tokens.css` / `_variables.scss`
- Specific components (Button.tsx, Card.tsx)
- Layout scaffolds (App.tsx, MainLayout.tsx)
- Global stylesheets

**Read code, copy exact values**: hex codes, spacing scale, font stack, border radius. Don't redraw from memory.

### 3. The User's Shipped Product
If the user has a live product but didn't provide code, use Playwright or have the user share screenshots.

```bash
# Screenshot a public URL with Playwright
npx playwright screenshot https://example.com screenshot.png --viewport-size=1920,1080
```

Lets you see the real visual vocabulary.

### 4. Brand Guidelines / Logo / Existing Assets
The user may have: logo files, brand color spec, marketing collateral, slide templates. All of these are context.

### 5. Competitive References
The user says "like XX website" — have them provide a URL or screenshots. **Don't** rely on the fuzzy impressions in your training data.

### 6. Known Design Systems (Fallback)
If none of the above exists, use a recognized design system as the base:
- Apple HIG
- Material Design 3
- Radix Colors (color)
- shadcn/ui (components)
- Tailwind default palette

Tell the user explicitly what you're using so they know it's a starting point, not the final answer.

## Process for Acquiring Context

### Step 1: Ask the User

Mandatory checklist at task start (from `workflow.md`):

```markdown
1. Do you have an existing design system / UI kit / component library? Where?
2. Do you have brand guidelines, color / type specs?
3. Can you share screenshots or URLs of your existing product?
4. Is there a codebase I can read?
```

### Step 2: When the User Says "No," Help Them Find Some

Don't give up immediately. Try:

```markdown
Let me look for clues:
- Do your previous projects have related designs?
- What color / type does your company marketing site use?
- What style is your product's logo? Could you share one?
- Any product you admire that we could use as reference?
```

### Step 3: Read All Available Context

If the user provides a codebase path, you read:
1. **List the file structure first**: find files related to style / theme / components
2. **Read theme / token files**: lift specific hex / px values
3. **Read 2-3 representative components**: study the visual vocabulary (hover state, shadow, border, padding patterns)
4. **Read the global stylesheet**: base resets, font loading
5. **If there's a Figma link / screenshots**: look at the image, but **trust code more**

**Important**: **don't** glance once and improvise from memory. You've truly lifted only when you have 30+ specific values written down.

### Step 4: Vocalize the System You'll Use

After reading context, tell the user the system you intend to use:

```markdown
Based on your codebase and product screenshots, the design system I distilled:

**Color**
- Primary: #C27558 (from tokens.css)
- Background: #FDF9F0
- Text: #1A1A1A
- Muted: #6B6B6B

**Typography**
- Display: Instrument Serif (from global.css's @font-face)
- Body: Geist Sans
- Mono: JetBrains Mono

**Spacing** (from your scale system)
- 4, 8, 12, 16, 24, 32, 48, 64

**Shadow patterns**
- `0 1px 2px rgba(0,0,0,0.04)` (subtle card)
- `0 10px 40px rgba(0,0,0,0.1)` (elevated modal)

**Border-radius**
- Small components 4px, cards 12px, buttons 8px

**Component vocabulary**
- Button: filled primary, outlined secondary, ghost tertiary, all 8px radius
- Card: white background, subtle shadow, no border

I'll start with this system. Confirm OK?
```

Wait for user confirmation before acting.

## Designing From Scratch (Fallback When There's No Context)

**Strong warning**: in this case, output quality drops noticeably. Tell the user clearly.

```markdown
You don't have design context, so I can only work from generic intuition.
The output will be "looks OK but lacks distinctiveness."
Want me to continue, or supplement with reference materials first?
```

If the user insists you proceed, decide in this order:

### 1. Pick an Aesthetic Direction
Don't deliver generic results. Pick a clear direction:
- brutally minimal
- editorial / magazine
- brutalist / raw
- organic / natural
- luxury / refined
- playful / toy
- retro-futuristic
- soft / pastel

Tell the user which one you chose.

### 2. Pick a Known Design System as Skeleton
- Use Radix Colors for color (https://www.radix-ui.com/colors)
- Use shadcn/ui for component vocabulary (https://ui.shadcn.com)
- Use Tailwind spacing scale (multiples of 4)

### 3. Pick a Distinctive Type Pairing

Don't use Inter / Roboto. Suggested pairings (free from Google Fonts):
- Instrument Serif + Geist Sans
- Cormorant Garamond + Inter Tight
- Bricolage Grotesque + Söhne (paid)
- Fraunces + Work Sans (note: Fraunces is overused by AI)
- JetBrains Mono + Geist Sans (technical feel)

### 4. Every Key Decision Has Reasoning

Don't choose silently. Write reasoning in the HTML's comment:

```html
<!--
Design decisions:
- Primary color: warm terracotta (oklch 0.65 0.18 25) — fits the "editorial" direction  
- Display: Instrument Serif for humanist, literary feel
- Body: Geist Sans for cleanness contrast
- No gradients — committed to minimal, no AI slop
- Spacing: 8px base, golden ratio friendly (8/13/21/34)
-->
```

## Import Strategy (User-Provided Codebase)

If the user says "import this codebase as reference":

### Small (<50 files)
Read it all; internalize the context.

### Medium (50-500 files)
Focus on:
- `src/components/` or `components/`
- All styles / tokens / theme-related files
- 2-3 representative whole-page components (Home.tsx, Dashboard.tsx)

### Large (>500 files)
Have the user specify the focus:
- "I want to do the settings page" → read existing settings-related files
- "I want a new feature" → read the overall shell + the closest reference
- Don't try to be exhaustive; aim for accuracy

## Working with Figma / Design Files

If the user provides a Figma link:

- **Don't** expect to "convert Figma to HTML" directly — that needs separate tooling
- Figma links are usually not publicly accessible
- Have the user: export to **screenshots** + tell you specific color / spacing values

If you only have Figma screenshots, tell the user:
- I can see the visuals but can't read precise values
- Please tell me key numbers (hex, px), or export as code (Figma supports this)

## Final Reminder

**The ceiling for a project's design quality is set by the quality of the context you obtain.**

Spending 10 minutes gathering context is more valuable than 1 hour of hi-fi from scratch.

**When you have no context, prioritize asking the user — don't try to power through.**

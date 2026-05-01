# Design Philosophy Style Library: 20 Systems

> A style library for visual design (web / PPT / PDF / infographic / illustration / app, etc.).
> Each style provides: philosophical core + key traits + prompt DNA (used in combination with scene templates).

## Style × Scenario × Execution Path Quick Reference

| Style | Web | PPT | PDF | Infographic | Cover | AI generation | Best path |
|------|:---:|:---:|:---:|:-----:|:---:|:-----:|---------|
| 01 Pentagram | ★★★ | ★★★ | ★★☆ | ★★☆ | ★★★ | ★☆☆ | HTML |
| 02 Stamen Design | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★☆ | ★★☆ | Hybrid |
| 03 Information Architects | ★★★ | ★☆☆ | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | HTML |
| 04 Fathom | ★★☆ | ★★★ | ★★★ | ★★★ | ★★☆ | ★☆☆ | HTML |
| 05 Locomotive | ★★★ | ★★☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★☆ | Hybrid |
| 06 Active Theory | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★★ | AI generation |
| 07 Field.io | ★★☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI generation |
| 08 Resn | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★☆ | AI generation |
| 09 Experimental Jetset | ★★☆ | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★☆ | Hybrid |
| 10 Müller-Brockmann | ★★☆ | ★★★ | ★★★ | ★★★ | ★★☆ | ★☆☆ | HTML |
| 11 Build | ★★★ | ★★★ | ★★☆ | ★☆☆ | ★★★ | ★☆☆ | HTML |
| 12 Sagmeister & Walsh | ★★☆ | ★★★ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI generation |
| 13 Zach Lieberman | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI generation |
| 14 Raven Kwok | ★☆☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI generation |
| 15 Ash Thorp | ★★☆ | ★★☆ | ★☆☆ | ★☆☆ | ★★★ | ★★★ | AI generation |
| 16 Territory Studio | ★★☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI generation |
| 17 Takram | ★★★ | ★★★ | ★★★ | ★★☆ | ★★☆ | ★☆☆ | HTML |
| 18 Kenya Hara | ★★☆ | ★★★ | ★★★ | ★☆☆ | ★★★ | ★☆☆ | HTML |
| 19 Irma Boom | ★☆☆ | ★★☆ | ★★★ | ★★☆ | ★★★ | ★★☆ | Hybrid |
| 20 Neo Shen | ★★☆ | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★★ | AI generation |

> Scenario fit: ★★★ = strongly recommended / ★★☆ = suitable / ★☆☆ = needs adaptation
> AI generation: ★★★ = direct output is good / ★★☆ = needs tuning / ★☆☆ = recommend HTML execution
> Best path: AI generation (image direct) / HTML (code render, precise data) / Hybrid (HTML layout + AI imagery)

**Core rule**: styles with explicit visual elements (illustration / particles / generative art) work well via AI direct output; styles dependent on precise typography and data (grids / information architecture / whitespace) are more controllable via HTML rendering.

---

## I. Information Architecture School (01-04)
> Philosophy: "Data isn't decoration; it's building material"

### 01. Pentagram - Michael Bierut Style
**Philosophy**: type is the language; the grid is the thought
**Key traits**:
- Extreme color restraint (black/white + 1 brand color)
- Modern interpretation of the Swiss grid
- Typography as the primary visual language
- Strategic use of negative space (60%+ whitespace)

**Prompt DNA**:
```
Pentagram/Michael Bierut style:
- Extreme typographic hierarchy, Helvetica/Univers family
- Swiss grid with precise mathematical spacing
- Black/white + one accent color (#HEX)
- Information architecture as visual structure
- 60%+ whitespace ratio
- Data visualization as primary decoration
```

**Representative work**: Hillary Clinton 2016 campaign identity
**Search keywords**: pentagram hillary logo system

---

### 02. Stamen Design - Data Poetics
**Philosophy**: let data become a tactile landscape
**Key traits**:
- Cartographic thinking applied to information design
- Algorithm-generated organic graphics
- Warm data-viz palette (terracotta, sage, deep blue)
- Interactive layered system

**Prompt DNA**:
```
Stamen Design aesthetic:
- Cartographic approach to data visualization
- Organic, algorithm-generated patterns
- Warm palette (terracotta, sage green, deep blues)
- Layered information like topographic maps
- Hand-crafted feel despite digital precision
- Soft shadows and depth
```

**Representative work**: COVID-19 surge map
**Search keywords**: stamen covid map visualization

---

### 03. Information Architects - Content First
**Philosophy**: design isn't decoration; it's the architecture of content
**Key traits**:
- Extreme content hierarchy clarity
- System fonts only (reading-optimized)
- Loyalty to the blue-hyperlink tradition
- Performance as aesthetic

**Prompt DNA**:
```
Information Architects philosophy:
- Content-first hierarchy, zero decorative elements
- System fonts only (SF Pro/Roboto/Inter)
- Classic blue hyperlinks (#0000EE)
- Reading-optimized line length (66 characters)
- Progressive disclosure of depth
- Text-heavy, fast-loading design
```

**Representative work**: iA Writer app
**Search keywords**: information architects ia writer

---

### 04. Fathom Information Design - Scientific Narrative
**Philosophy**: every pixel must carry information
**Key traits**:
- Scientific-journal rigor + design elegance
- Precise visualization of quantitative data
- Calm professional palette (gray, navy)
- Footnote / citation system as design

**Prompt DNA**:
```
Fathom Information Design style:
- Scientific journal aesthetic meets modern design
- Precise data visualization (charts, timelines, scatter plots)
- Neutral scheme (grays, navy, one highlight color)
- Footnote/citation design integrated into layout
- Clean sans-serif (GT America/Graphik)
- Information density without clutter
```

**Representative work**: Bill & Melinda Gates Foundation annual report
**Search keywords**: fathom information design gates foundation

---

## II. Motion Poetics School (05-08)
> Philosophy: "Technology itself is a kind of flowing poem"

### 05. Locomotive - Master of Scroll Narrative
**Philosophy**: scrolling isn't browsing; it's a journey
**Key traits**:
- Silky parallax scrolling
- Cinematic shot-by-shot narrative
- Bold spatial whitespace
- Precise choreography of dynamic elements

**Prompt DNA**:
```
Locomotive scroll narrative style:
- Film-like scene composition with parallax depth
- Generous vertical spacing between sections
- Bold typography emerging from darkness
- Smooth motion blur effects
- Dark mode (near-black backgrounds)
- Strategic glowing accents
- Hero sections 100vh tall
```

**Representative work**: Lusion.co website
**Search keywords**: locomotive scroll lusion

---

### 06. Active Theory - WebGL Poets
**Philosophy**: making technology visible makes it understandable
**Key traits**:
- 3D particle systems as core element
- Real-time rendered data visualization
- Mouse-interaction-driven world building
- Neon and deep-space palette

**Prompt DNA**:
```
Active Theory WebGL aesthetic:
- Particle systems representing data flow
- 3D visualization in depth space
- Neon gradients (cyan/magenta/electric blue) on dark
- Mouse-reactive environment
- Depth of field and bokeh effects
- Floating UI with glassmorphism
```

**Representative work**: NASA Prospect
**Search keywords**: active theory nasa webgl

---

### 07. Field.io - Algorithmic Aesthetic
**Philosophy**: code is the designer
**Key traits**:
- Generative-art system
- Different graphics on every visit
- Intelligent choreography of abstract geometry
- Balance of technical and artistic

**Prompt DNA**:
```
Field.io generative design style:
- Abstract geometric patterns, algorithmically generated
- Dynamic composition that feels computational
- Monochromatic base with vibrant accent
- Mathematical precision in spacing
- Voronoi diagrams or Delaunay triangulation
- Clean code aesthetic
```

**Representative work**: British Council digital installations
**Search keywords**: field.io generative design

---

### 08. Resn - Narrative-Driven Interaction
**Philosophy**: every click advances the story
**Key traits**:
- Gamified user journeys
- Strong emotional design
- Deep fusion of illustration and code
- Non-linear exploration experience

**Prompt DNA**:
```
Resn interactive storytelling approach:
- Illustrative style mixed with UI elements
- Gamified exploration (progress indicators)
- Warm color palette despite tech subject
- Character-driven design
- Scroll-triggered animations
- Editorial illustration meets product design
```

**Representative work**: Resn.co.nz portfolio
**Search keywords**: resn interactive storytelling

---

## III. Minimalism School (09-12)
> Philosophy: "Cut until you can cut no more"

### 09. Experimental Jetset - Conceptual Minimalism
**Philosophy**: one idea = one form
**Key traits**:
- A single visual metaphor running through the whole design
- Mondrian palette of blue / red / yellow + black / white
- Type as graphic
- Anti-commercial, honest design

**Prompt DNA**:
```
Experimental Jetset conceptual minimalism:
- Single visual metaphor for entire design
- Primary colors only (red/blue/yellow) + black/white
- Typography as main graphic element
- Grid-based with deliberate rule-breaking
- No photography, only type and geometry
- Anti-commercial, honest aesthetic
```

**Representative work**: Whitney Museum identity
**Search keywords**: experimental jetset whitney responsive w

---

### 10. Müller-Brockmann Lineage - Swiss Grid Purism
**Philosophy**: objectivity is beauty
**Key traits**:
- Mathematically precise grid system (8pt baseline)
- Absolute left-align or center
- Mono- or duo-color schemes
- Functionalism above all

**Prompt DNA**:
```
Josef Müller-Brockmann Swiss modernism:
- Mathematical grid system (8pt baseline)
- Strict alignment (flush left or centered)
- Two-color maximum (black + one accent)
- Akzidenz-Grotesk or similar rationalist typeface
- No decorative elements
- Timeless, objective aesthetic
```

**Representative work**: *Grid Systems in Graphic Design*
**Search keywords**: muller brockmann grid systems poster

---

### 11. Build - Contemporary Minimal Branding
**Philosophy**: refined simplicity is harder than complexity
**Key traits**:
- Luxury-grade whitespace (70%+)
- Subtle weight contrast (200-600)
- Strategic use of a single accent
- Breathing rhythm

**Prompt DNA**:
```
Build studio luxury minimalism:
- Generous whitespace (70%+ of area)
- Subtle typography weight shifts (200 to 600)
- Single accent color used sparingly
- High-end product photography aesthetic
- Soft shadows and subtle gradients
- Golden ratio proportions
```

**Representative work**: Build studio portfolio
**Search keywords**: build studio london branding

---

### 12. Sagmeister & Walsh - Joyful Minimalism
**Philosophy**: beauty is the emotional dimension of function
**Key traits**:
- Unexpected color bursts
- Fusion of handmade and digital
- Positive visual language
- Experimental but legible

**Prompt DNA**:
```
Sagmeister & Walsh joyful philosophy:
- Unexpected color bursts on minimal base
- Handmade elements (physical objects in digital)
- Optimistic visual language
- Experimental typography that remains legible
- Human warmth through imperfection
- Mix of analog and digital aesthetics
```

**Representative work**: The Happy Show
**Search keywords**: sagmeister walsh happy show

---

## IV. Experimental Avant-Garde School (13-16)
> Philosophy: "Breaking rules is making rules"

### 13. Zach Lieberman - Code Poetics
**Philosophy**: programming is painting
**Key traits**:
- Hand-drawn-feeling algorithmic graphics
- Real-time generative art
- Pure black-and-white expression
- Visibility of the tool itself

**Prompt DNA**:
```
Zach Lieberman code-as-art style:
- Hand-drawn aesthetic generated by code
- Black and white only, no color
- Real-time generative patterns
- Sketch-like line quality
- Visible process/grid/construction lines
- Poetic interpretation of algorithms
```

**Representative work**: openFrameworks creative coding
**Search keywords**: zach lieberman openframeworks generative

---

### 14. Raven Kwok - Parametric Aesthetic
**Philosophy**: the beauty of the system over the beauty of the individual
**Key traits**:
- Fractal and recursive graphics
- High-contrast black and white
- Architectural information structure
- Algorithmic interpretation of Eastern gardens

**Prompt DNA**:
```
Raven Kwok parametric aesthetic:
- Fractal patterns and recursive structures
- High-contrast black and white
- Architectural visualization of data
- Chinese garden principles in algorithm form
- Intricate detail that rewards zooming
- Processing/Creative coding aesthetic
```

**Representative work**: Raven Kwok generative art exhibitions
**Search keywords**: raven kwok processing generative art

---

### 15. Ash Thorp - Cyber Poetry
**Philosophy**: the future isn't cold; it's a lonely poem
**Key traits**:
- Cinema-grade lighting
- Warm-version cyberpunk (orange / teal, not cold blue)
- Narrative concept design
- Refined industrial aesthetics

**Prompt DNA**:
```
Ash Thorp cinematic concept art:
- Film-grade lighting and atmospheric effects
- Warm cyberpunk (orange/teal, NOT cold blue)
- Industrial design meets luxury
- Narrative concept art feel
- Volumetric lighting and god rays
- Blade Runner warmth over Tron coldness
```

**Representative work**: Ghost in the Shell concept art
**Search keywords**: ash thorp ghost shell concept art

---

### 16. Territory Studio - Screen-Interface Fiction
**Philosophy**: today's imagination of tomorrow's UI
**Key traits**:
- Screen design from sci-fi films (FUI)
- Holographic projection feel
- Multi-layer overlapping data viz
- Believable futurism

**Prompt DNA**:
```
Territory Studio FUI (Fantasy User Interface):
- Fantasy User Interface design
- Holographic projection aesthetics
- Orange/amber monochrome or cyan accents
- Multiple overlapping data layers
- Believable future technology
- Technical readouts and data streams
```

**Representative work**: Blade Runner 2049 screen graphics
**Search keywords**: territory studio blade runner interface

---

## V. Eastern Philosophy School (17-20)
> Philosophy: "Negative space is content"

### 17. Takram - Japanese Speculative Design
**Philosophy**: technology is a medium for thought
**Key traits**:
- Elegant concept prototypes
- Soft tech feel (rounded corners, soft shadows)
- Charts as art
- Modest sophistication

**Prompt DNA**:
```
Takram Japanese speculative design:
- Elegant concept prototypes and diagrams
- Soft tech aesthetic (rounded corners, gentle shadows)
- Charts and diagrams as art pieces
- Modest sophistication
- Neutral natural colors (beige, soft gray, muted green)
- Design as philosophical inquiry
```

**Representative work**: NHK Fabricated City
**Search keywords**: takram nhk data visualization

---

### 18. Kenya Hara - Design of Emptiness
**Philosophy**: design isn't filling; it's emptying
**Key traits**:
- Extreme whitespace (80%+)
- Digitally translated paper texture
- Layers of white (warm white, cool white, off-white)
- Visualization of touch

**Prompt DNA**:
```
Kenya Hara "emptiness" design:
- Extreme whitespace (80%+)
- Paper texture and tactility in digital form
- Layers of white (warm white, cool white, off-white)
- Minimal color (if any, very desaturated)
- Design by subtraction not addition
- Zen simplicity
```

**Representative work**: Muji art direction, *Designing Design*
**Search keywords**: kenya hara designing design muji

---

### 19. Irma Boom - Book Architect
**Philosophy**: physical poetics of information
**Key traits**:
- Non-linear information architecture
- Play with edges and boundaries
- Unexpected color combos (pink + red, orange + brown)
- Digital translation of craft

**Prompt DNA**:
```
Irma Boom book architecture style:
- Non-linear information structure
- Play with edges, margins, boundaries
- Unexpected color combos (pink+red, orange+brown)
- Handcraft translated to digital
- Dense information inviting exploration
- Editorial design, unconventional grid
```

**Representative work**: SHV Think Book (2136 pages)
**Search keywords**: irma boom shv think book

---

### 20. Neo Shen - Eastern Light-and-Shadow Poetry
**Philosophy**: technology needs the warmth of the human
**Key traits**:
- Digital translation of ink-wash diffusion
- Soft glow effects
- Poetic negative space
- Emotional palette (deep blue, warm gray, soft gold)

**Prompt DNA**:
```
Neo Shen poetic Chinese aesthetic:
- Digital interpretation of ink wash painting
- Soft glow and light diffusion effects
- Poetic negative space
- Emotional palette (deep blues, warm grays, soft gold)
- Calligraphic influences in typography
- Atmospheric depth
```

**Representative work**: Neo Shen digital art series
**Search keywords**: neo shen digital ink wash art

---

## How to Use the Prompts

**Combination formula**: `[Style prompt DNA] + [Scene template (see scene-templates.md)] + [Specific content]`

### Core Principle: Mood, Not Layout

The key to AI image generation: short prompts > long prompts. Three sentences of mood and content beat 30 lines of layout detail.

| Diversity-killing writing | Creativity-sparking writing |
|----------------|----------------|
| Specifying color ratios (60% / 25% / 15%) | Describing mood ("warm like Sunday morning") |
| Prescribing layout positions ("title centered top, image right") | Citing specific aesthetics ("Pentagram editorial feel") |
| Restricting character poses and expressions | Letting AI naturally interpret the style |
| Listing all visual elements to include | Describing what the audience should feel |

### Good / Bad Examples

**Bad — over-constrained (AI output is empty and flat):**
```
Professional presentation slide. Dark background, light text.
Title centered at top. Two columns below. Left column: bullet points.
Right column: bar chart. Colors: navy 60%, white 30%, gold 10%.
Font size: title 36pt, body 18pt. Margins: 40px all sides.
```

**Good — mood-driven (varied, textured generation):**
```
A data visualization that feels like a Bloomberg Businessweek
editorial spread. The key number "28.5%" should dominate the
composition like a headline. Warm cream tones with sharp black
typography. The data tells a story of dramatic channel shift.
```

### Choosing the Execution Path

Pick from the "Best path" column in the quick-reference table:
- **AI generation**: styles with explicit visual elements (06/07/12/13/14/15/16/20); use Gemini / Midjourney for direct output
- **HTML render**: styles dependent on precise typography (01/03/04/10/11/17/18); code controls data and layout
- **Hybrid**: HTML for skeleton layout + AI for imagery / backgrounds (02/05/08/09/19)

### Quality Control

1. ❌ Don't just write "in the style of Pentagram" → ✅ describe specific design traits
2. Text often errors in AI generation → replace text after generating
3. Proportions easily distort → specify aspect ratio explicitly
4. Generate 3-5 variants first; refine the best one

**Default aesthetic forbidden zone** (user can override per their brand):
- ❌ Cyber neon / deep blue background (#0D1117)
- ❌ Personal signature / watermark on cover

---

**Version**: v2.1
**Updated**: 2026-02-13
**Applicable scenarios**: web / PPT / PDF / infographic / cover / illustration / app — all visual design
**Linkage with image-to-slides**: PPT scenarios can directly reference the styles here, executed via the image-to-slides skill

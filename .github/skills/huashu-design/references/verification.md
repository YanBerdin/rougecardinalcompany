# Verification: Output Verification Workflow

Some design-agent native environments (like Claude.ai Artifacts) have a built-in `fork_verifier_agent` that spins up a subagent to inspect via iframe screenshots. Most agent environments (Claude Code / Codex / Cursor / Trae / etc.) lack this built-in capability — Playwright covers the same verification scenarios manually.

## Verification Checklist

After producing every HTML, run through this checklist:

### 1. Browser render check (required)

Most basic: **does the HTML actually open?** On macOS:

```bash
open -a "Google Chrome" "/path/to/your/design.html"
```

Or screenshot it via Playwright (next section).

### 2. Console error check

The most common HTML problem is a JS error producing a white screen. Run a Playwright pass:

```bash
python ~/.claude/skills/claude-design/scripts/verify.py path/to/design.html
```

This script will:
1. Open the HTML in headless chromium
2. Save a screenshot to the project directory
3. Capture console errors
4. Report status

See `scripts/verify.py` for details.

### 3. Multi-viewport check

For responsive designs, capture multiple viewports:

```bash
python verify.py design.html --viewports 1920x1080,1440x900,768x1024,375x667
```

### 4. Interaction check

Tweaks, animation, button toggles — a default static screenshot can't see those. **Better: have the user click through it themselves**, or record video via Playwright:

```python
page.video.record('interaction.mp4')
```

### 5. Slide-by-slide check

For deck-style HTML, capture one slide at a time:

```bash
python verify.py deck.html --slides 10  # capture first 10 slides
```

Produces `deck-slide-01.png`, `deck-slide-02.png`... for quick browsing.

## Playwright Setup

First-time use requires:

```bash
# if not yet installed
npm install -g playwright
npx playwright install chromium

# or the Python version
pip install playwright
playwright install chromium
```

If the user already has Playwright globally installed, just use it.

## Screenshot Best Practices

### Full-page screenshot

```python
page.screenshot(path='full.png', full_page=True)
```

### Viewport screenshot

```python
page.screenshot(path='viewport.png')  # by default only the visible area
```

### Specific-element screenshot

```python
element = page.query_selector('.hero-section')
element.screenshot(path='hero.png')
```

### High-DPI screenshot

```python
page = browser.new_page(device_scale_factor=2)  # retina
```

### Wait for animation to finish

```python
page.wait_for_timeout(2000)  # wait 2s for animations to settle
page.screenshot(...)
```

## Sending Screenshots to the User

### Open the local screenshot directly

```bash
open screenshot.png
```

The user views it in their Preview / Figma / VSCode / browser.

### Upload to image host for a shareable link

For remote collaborators (Slack / Feishu / WeChat), have the user upload via their own image-host tool or MCP:

```bash
python ~/Documents/writing/tools/upload_image.py screenshot.png
```

Returns a permanent ImgBB link that can be pasted anywhere.

## When Verification Fails

### White-screen page

There must be a console error. Check first:

1. Whether the React+Babel script tag integrity hash is correct (see `react-setup.md`)
2. Whether `const styles = {...}` has a naming collision
3. Whether cross-file components were exported to `window`
4. JSX syntax errors (babel.min.js silences them — switch to non-minified babel.js)

### Janky animation

- Record a session with the Chrome DevTools Performance tab
- Look for layout thrashing (frequent reflow)
- Prefer `transform` and `opacity` (GPU-accelerated)

### Wrong font

- Check that the `@font-face` URL is reachable
- Check fallback fonts
- Chinese fonts load slowly: show fallback first, swap once loaded

### Layout misalignment

- Check that `box-sizing: border-box` is applied globally
- Check the `*  margin: 0; padding: 0` reset
- Toggle gridlines in Chrome DevTools to inspect actual layout

## Verification = the Designer's Second Pair of Eyes

**Always walk through it yourself.** When AI writes code, you often see:

- Looks right but interaction has a bug
- Static screenshot is fine but scrolling breaks
- Wide-screen looks good but narrow-screen collapses
- Dark mode was forgotten
- Some components don't react after Tweaks toggle

**One minute of last-mile verification saves an hour of rework.**

## Common Verification Script Commands

```bash
# basic: open + screenshot + capture errors
python verify.py design.html

# multi-viewport
python verify.py design.html --viewports 1920x1080,375x667

# multi-slide
python verify.py deck.html --slides 10

# write output to a specific directory
python verify.py design.html --output ./screenshots/

# headless=false — open a real browser for you to watch
python verify.py design.html --show
```

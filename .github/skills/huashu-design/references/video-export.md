# Video Export: Exporting an HTML Animation as MP4 / GIF

Once an HTML animation is finished, the user often asks "can you export this as a video?" This guide covers the full pipeline.

## When to Export

**Right time to export**:
- The animation runs end-to-end and has been visually verified (Playwright screenshots confirm the state at each timestamp is correct)
- The user has watched it in the browser at least once and signed off
- **Do not** export while animation bugs are still unfixed — fixing it after the export costs more

**Likely user trigger phrases**:
- "Can you export this to video?"
- "Convert to MP4"
- "Make a GIF"
- "60fps"

## Output Specs

By default deliver three formats so the user can pick:

| Format | Spec | Use case | Typical size (30s) |
|---|---|---|---|
| MP4 25fps | 1920×1080 · H.264 · CRF 18 | WeChat article embed, video accounts, YouTube | 1-2 MB |
| MP4 60fps | 1920×1080 · minterpolate frame interpolation · H.264 · CRF 18 | High-frame-rate showcase, Bilibili, portfolios | 1.5-3 MB |
| GIF | 960×540 · 15fps · palette optimized | Twitter/X, README, Slack preview | 2-4 MB |

## Toolchain

Two scripts in `scripts/`:

### 1. `render-video.js` — HTML → MP4

Records a 25fps MP4 base version. Depends on a global Playwright install.

```bash
NODE_PATH=$(npm root -g) node /path/to/claude-design/scripts/render-video.js <html-file>
```

Optional flags:
- `--duration=30` animation length (seconds)
- `--width=1920 --height=1080` resolution
- `--trim=2.2` seconds to trim from the start of the video (drops reload + font-load time)
- `--fontwait=1.5` font-loading wait (seconds); raise it when there are many fonts

Output: same directory as the HTML, same name with `.mp4`.

### 2. `add-music.sh` — MP4 + BGM → MP4

Mixes a background music track into a silent MP4. Picks from the bundled BGM library by mood, or accepts your own audio. Auto-matches duration and adds fade in/out.

```bash
bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]
```

**Built-in BGM library** (in `assets/bgm-<mood>.mp3`):

| `--mood=` | Style | Best for |
|-----------|------|---------|
| `tech` (default) | Apple Silicon / Apple-keynote vibe, minimal synths + piano | Product launches, AI tools, Skill announcements |
| `ad` | Upbeat modern electronic with build + drop | Social-media ads, product teasers, promo cuts |
| `educational` | Warm, bright, light guitar / e-piano, inviting | Explainers, tutorial intros, course teasers |
| `educational-alt` | Same category, alternate track | As above |
| `tutorial` | Lo-fi ambient, near-invisible | Software demos, programming tutorials, long demos |
| `tutorial-alt` | Same category, alternate track | As above |

**Behavior**:
- Music is trimmed to video length
- 0.3s fade-in + 1s fade-out (avoids hard cuts)
- Video stream uses `-c:v copy` (no re-encode); audio is AAC 192k
- `--music=<path>` overrides `--mood`; lets you point at any external audio
- A wrong mood name lists all available options instead of failing silently

**Typical pipeline** (animation export trio + soundtrack):
```bash
node render-video.js animation.html                        # screen record
bash convert-formats.sh animation.mp4                      # derive 60fps + GIF
bash add-music.sh animation-60fps.mp4                      # add default tech BGM
# or per scene:
bash add-music.sh tutorial-demo.mp4 --mood=tutorial
bash add-music.sh product-promo.mp4 --mood=ad --out=promo-final.mp4
```

### 3. `convert-formats.sh` — MP4 → 60fps MP4 + GIF

Generates a 60fps version and a GIF from an existing MP4.

```bash
bash /path/to/claude-design/scripts/convert-formats.sh <input.mp4> [gif_width] [--minterpolate]
```

Output (same directory as input):
- `<name>-60fps.mp4` — defaults to `fps=60` frame duplication (broad compatibility); add `--minterpolate` for high-quality interpolation
- `<name>.gif` — palette-optimized GIF (default 960 wide; configurable)

**60fps mode selection**:

| Mode | Command | Compatibility | Use case |
|---|---|---|---|
| Frame duplication (default) | `convert-formats.sh in.mp4` | QuickTime / Safari / Chrome / VLC all play | General delivery, upload platforms, social media |
| minterpolate interpolation | `convert-formats.sh in.mp4 --minterpolate` | macOS QuickTime / Safari may refuse to open | Bilibili and other showcase contexts that need real interpolation. **Always test the target player locally before delivery** |

Why is the default frame duplication now? The minterpolate output's H.264 elementary stream has a known compat bug — when minterpolate was the default we hit "macOS QuickTime can't open it" repeatedly. See `animation-pitfalls.md` §14.

`gif_width` parameter:
- 960 (default) — universal social
- 1280 — sharper but larger file
- 600 — Twitter/X load priority

## Standard Recommended Flow

After the user says "export the video":

```bash
cd <project-directory>

# Assume $SKILL points at this skill's root (substitute your install path)

# 1. Record the 25fps base MP4
NODE_PATH=$(npm root -g) node "$SKILL/scripts/render-video.js" my-animation.html

# 2. Derive the 60fps MP4 and the GIF
bash "$SKILL/scripts/convert-formats.sh" my-animation.mp4

# Output:
# my-animation.mp4         (25fps · 1-2 MB)
# my-animation-60fps.mp4   (60fps · 1.5-3 MB)
# my-animation.gif         (15fps · 2-4 MB)
```

## Technical Details (for Debugging)

### Playwright recordVideo gotchas

- Frame rate is fixed at 25fps; you can't record 60fps directly (Chromium headless compositor cap)
- Recording starts the moment the context is created, so you must `trim` the load-time prefix
- Default format is webm; needs ffmpeg to convert to H.264 MP4 for universal playback

`render-video.js` already handles the above.

### ffmpeg minterpolate parameters

Current settings: `minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`

- `mi_mode=mci` — motion compensation interpolation
- `mc_mode=aobmc` — adaptive overlapped block motion compensation
- `me_mode=bidir` — bidirectional motion estimation
- `vsbmc=1` — variable-size block motion compensation

Works well on CSS **transform animations** (translate / scale / rotate).
On **pure fades** it can introduce slight ghosting — if the user dislikes it, fall back to simple frame duplication:

```bash
ffmpeg -i input.mp4 -r 60 -c:v libx264 ... output.mp4
```

### Why GIF palette needs two passes

GIF is limited to 256 colors. A single-pass GIF crushes the entire animation into one generic 256-color palette, which smears delicate palettes like beige + orange.

Two passes:
1. `palettegen=stats_mode=diff` — scan the whole clip and generate the **optimal palette for this animation**
2. `paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle` — encode using that palette; rectangle diff only updates changed regions, drastically shrinking the file

For fade transitions, `dither=bayer` is smoother than `none` but the file is a bit bigger.

## Pre-flight Check (Before Export)

30-second self-check before export:

- [ ] HTML ran end-to-end in the browser with no console errors
- [ ] Frame 0 is the complete initial state (not a blank loading state)
- [ ] The final frame is a stable resting state (not mid-animation)
- [ ] Fonts / images / emoji all render correctly (see `animation-pitfalls.md`)
- [ ] The `duration` arg matches the actual animation length in the HTML
- [ ] Stage in the HTML detects `window.__recording` and forces `loop=false` (must check for hand-rolled Stages; built into `assets/animations.jsx`)
- [ ] The closing Sprite has `fadeOut={0}` (the video's last frame should not fade out)
- [ ] Includes the "Created by Huashu-Design" watermark (mandatory for animation deliverables; third-party-brand work uses a "Unofficial · " prefix. See SKILL.md §"Skill Promotion Watermark")

## Notes to Include with the Delivery

Standard wording to send the user once export is done:

```
**Full Delivery**

| File | Format | Spec | Size |
|---|---|---|---|
| foo.mp4 | MP4 | 1920×1080 · 25fps · H.264 | X MB |
| foo-60fps.mp4 | MP4 | 1920×1080 · 60fps (motion interpolated) · H.264 | X MB |
| foo.gif | GIF | 960×540 · 15fps · palette optimized | X MB |

**Notes**
- 60fps uses minterpolate motion-estimation interpolation; works well for transform animations
- GIF uses palette optimization; 30s animations compress to about 3MB

Ping me if you want different dimensions or frame rate.
```

## Common Follow-up User Requests

| User says | Response |
|---|---|
| "Too big" | MP4: raise CRF to 23-28; GIF: drop resolution to 600 or fps to 10 |
| "GIF looks blurry" | Raise `gif_width` to 1280; or suggest MP4 instead (works in WeChat Moments too) |
| "Need vertical 9:16" | Update HTML source `--width=1080 --height=1920`, re-record |
| "Add a watermark" | ffmpeg with `-vf "drawtext=..."` or `overlay=` a PNG |
| "Need transparent background" | MP4 doesn't support alpha; use WebM VP9 + alpha or APNG |
| "Lossless" | CRF 0 + preset veryslow (file becomes 10× larger) |

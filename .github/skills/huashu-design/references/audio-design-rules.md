# Audio Design Rules · huashu-design

> The audio recipe for all animation demos. Used together with `sfx-library.md` (asset inventory).
> Forged in production: huashu-design release hero v1-v9 iterations · deep deconstruction of Anthropic's three official pieces via Gemini · 8000+ A/B comparisons

---

## Core Principle · Two-Track Audio (Iron Rule)

Animation audio **must be designed in two independent layers**; you cannot do only one:

| Layer | Function | Time scale | Relation to visuals | Frequency band |
|---|---|---|---|---|
| **SFX (beat layer)** | Marks each visual beat | Short, 0.2-2s | **Strong sync** (frame-accurate) | **High freq 800Hz+** |
| **BGM (atmosphere bed)** | Mood, sound stage | Continuous 20-60s | Weak sync (segment-level) | **Mid-low freq <4kHz** |

**An animation with only BGM is crippled** — the viewer subconsciously senses "the picture moves but there's no sonic response," and that's the root of the cheap feel.

---

## Gold Standard · Golden Ratios

These numbers are **engineering hard-parameters** derived from comparing Anthropic's three official pieces with our own v9 final cut. Apply directly:

### Volume
- **BGM volume**: `0.40-0.50` (relative to full scale 1.0)
- **SFX volume**: `1.00`
- **Loudness gap**: BGM peak is **-6 to -8 dB** below SFX peak (don't make SFX stand out by absolute loudness; do it by loudness gap)
- **amix parameter**: `normalize=0` (never use normalize=1, it crushes dynamic range)

### Frequency-Band Isolation (P1 Hard Optimization)
Anthropic's secret isn't "loud SFX"; it's **frequency-band layering**:

```bash
[bgm_raw]lowpass=f=4000[bgm]      # BGM limited to <4kHz mid-low band
[sfx_raw]highpass=f=800[sfx]      # SFX pushed to 800Hz+ mid-high band
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]
```

Why: the human ear is most sensitive in the 2-5kHz range (the "presence band"). If SFX live in this range and BGM covers the full band, **SFX get masked by BGM's high-frequency content**. Highpass on SFX + lowpass on BGM separates them spectrally — SFX clarity goes up a tier instantly.

### Fade
- BGM in: `afade=in:st=0:d=0.3` (0.3s, avoids hard cut)
- BGM out: `afade=out:st=N-1.5:d=1.5` (1.5s long tail, sense of close)
- SFX comes with envelope; no extra fade needed

---

## SFX Cue Design Rules

### Density (How Many SFX per 10s)
Measured SFX density of Anthropic's three pieces falls into three tiers:

| Piece | SFX per 10s | Product personality | Scene |
|---|---|---|---|
| Artifacts (ref-1) | **~9 / 10s** | Feature-dense, info-heavy | Complex tool demo |
| Code Desktop (ref-2) | **0** | Pure ambient, meditative | Dev tool flow state |
| Word (ref-3) | **~4 / 10s** | Balanced, office tempo | Productivity tool |

**Heuristic**:
- Calm / focused product personality → low SFX density (0-3 / 10s), BGM-led
- Lively / info-heavy product personality → high SFX density (6-9 / 10s), SFX-driven rhythm
- **Don't fill every visual beat** — restraint outclasses density. **Cutting 30-50% of cues makes the rest more dramatic.**

### Cue Selection Priority
Not every visual beat needs an SFX. Pick by this priority:

**P0 must-have** (omitting feels wrong):
- Typing (terminal / input)
- Click / select (user decision moment)
- Focus switch (visual lead transfer)
- Logo reveal (brand close-out)

**P1 recommended**:
- Element entrance / exit (modal / card)
- Completion / success feedback
- AI generation start / end
- Major transition (scene change)

**P2 optional** (more = mess):
- Hover / focus-in
- Progress tick
- Decorative ambient

### Timestamp Alignment Precision
- **Same-frame alignment** (0ms error): click / focus switch / logo settle
- **Lead by 1-2 frames** (-33ms): rapid whoosh (gives the viewer mental anticipation)
- **Trail by 1-2 frames** (+33ms): object landing / impact (matches real physics)

---

## BGM Selection Decision Tree

The huashu-design skill ships with 6 BGM tracks (`assets/bgm-*.mp3`):

```
What's the animation's personality?
├─ Product launch / tech demo → bgm-tech.mp3 (minimal synth + piano)
├─ Tutorial / tool walkthrough → bgm-tutorial.mp3 (warm, instructional)
├─ Educational / principle explanation → bgm-educational.mp3 (curious, thoughtful)
├─ Marketing / brand promotion → bgm-ad.mp3 (upbeat, promotional)
└─ Same style needs a variant → bgm-*-alt.mp3 (alternates of each)
```

### When Going Without BGM Is Right
Reference Anthropic Code Desktop (ref-2): **0 SFX + pure Lo-fi BGM** can also be very high-end.

**When to choose no BGM**:
- Animation duration <10s (BGM can't establish itself)
- Product personality is "focus / meditative"
- Scene already has ambient sound / voiceover
- Very high SFX density (avoid auditory overload)

---

## Scene Recipes (Out-of-the-Box)

### Recipe A · Product Launch Hero (huashu-design v9 same)
```
Duration: 25s
BGM: bgm-tech.mp3 · 45% · band <4kHz
SFX density: ~6 / 10s

Cues:
  Terminal typing → type × 4 (0.6s intervals)
  Enter            → enter
  Card convergence → card × 4 (staggered 0.2s)
  Selection        → click
  Ripple           → whoosh
  4× focus         → focus × 4
  Logo             → thud (1.5s)

Volume: BGM 0.45 / SFX 1.0 · amix normalize=0
```

### Recipe B · Tool Feature Demo (Reference Anthropic Code Desktop)
```
Duration: 30-45s
BGM: bgm-tutorial.mp3 · 50%
SFX density: 0-2 / 10s (very few)

Strategy: let BGM + voiceover drive; SFX only at **decisive moments** (file save / command done)
```

### Recipe C · AI Generation Demo
```
Duration: 15-20s
BGM: bgm-tech.mp3 or no BGM
SFX density: ~8 / 10s (high)

Cues:
  User input        → type + enter
  AI starts processing → magic/ai-process (1.2s loop)
  Generation done   → feedback/complete-done
  Result reveal     → magic/sparkle
  
Highlight: ai-process can loop 2-3 times across the whole generation phase
```

### Recipe D · Pure Ambient Long Shot (Reference Artifacts)
```
Duration: 10-15s
BGM: none
SFX: 3-5 carefully designed cues used solo

Strategy: every SFX is the lead, no BGM "muddying" everything together.
Suitable for: single-product slow-mo, close-up displays
```

---

## ffmpeg Compositing Templates

### Template 1 · Single SFX Layered onto Video
```bash
ffmpeg -y -i video.mp4 -itsoffset 2.5 -i sfx.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0[a]" \
  -map 0:v -map "[a]" output.mp4
```

### Template 2 · Multi-SFX Timeline Composite (Aligned by Cue Time)
```bash
ffmpeg -y \
  -i sfx-type.mp3 -i sfx-enter.mp3 -i sfx-click.mp3 -i sfx-thud.mp3 \
  -filter_complex "\
[0:a]adelay=1100|1100[a0];\
[1:a]adelay=3200|3200[a1];\
[2:a]adelay=7000|7000[a2];\
[3:a]adelay=21800|21800[a3];\
[a0][a1][a2][a3]amix=inputs=4:duration=longest:normalize=0[mixed]" \
  -map "[mixed]" -t 25 sfx-track.mp3
```
**Key parameters**:
- `adelay=N|N`: first is left-channel delay (ms), second is right; write both to keep stereo aligned
- `normalize=0`: preserve dynamic range — critical!
- `-t 25`: truncate to specified duration

### Template 3 · Video + SFX Track + BGM (with Frequency-Band Isolation)
```bash
ffmpeg -y -i video.mp4 -i sfx-track.mp3 -i bgm.mp3 \
  -filter_complex "\
[2:a]atrim=0:25,afade=in:st=0:d=0.3,afade=out:st=23.5:d=1.5,\
     lowpass=f=4000,volume=0.45[bgm];\
[1:a]highpass=f=800,volume=1.0[sfx];\
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k final.mp4
```

---

## Failure Mode Quick Reference

| Symptom | Root cause | Fix |
|---|---|---|
| SFX inaudible | BGM high-frequency content masking | Add `lowpass=f=4000` to BGM + `highpass=f=800` to SFX |
| SFX too loud / harsh | SFX absolute volume too high | Drop SFX to 0.7, drop BGM to 0.3, keep the gap |
| BGM and SFX rhythm clash | Wrong BGM choice (used music with strong beat) | Switch to ambient / minimal-synth BGM |
| BGM cuts off abruptly at end | No fade-out done | `afade=out:st=N-1.5:d=1.5` |
| SFX overlap into mush | Cues too dense + each SFX too long | Keep SFX under 0.5s, cue interval ≥ 0.2s |
| WeChat MP4 has no sound | WeChat sometimes mutes auto-play | Don't worry — sound plays when user opens; GIFs are silent anyway |

---

## Coupling with Visuals (Advanced)

### SFX Timbre Should Match Visual Style
- Warm / paper feel visuals → SFX use **wood / soft** timbres (Morse, paper snap, soft click)
- Cool / black-tech visuals → SFX use **metal / digital** timbres (beep, pulse, glitch)
- Hand-drawn / playful visuals → SFX use **cartoon / exaggerated** timbres (boing, pop, zap)

Our current `apple-gallery-showcase.md` warm cream palette → pair with `keyboard/type.mp3` (mechanical) + `container/card-snap.mp3` (soft) + `impact/logo-reveal-v2.mp3` (cinematic bass)

### SFX Can Drive Visual Rhythm
Advanced trick: **design the SFX timeline first, then adjust the visual animation to align with the SFX** (not the other way around).
Because each SFX cue is a "clock tick," visual animation conforming to SFX cadence is rock solid — whereas SFX chasing visuals often misaligns by ±1 frame and feels off.

---

## Quality Checklist (Pre-Release Self-Check)

- [ ] Loudness gap: SFX peak − BGM peak = -6 to -8 dB?
- [ ] Bands: BGM lowpass 4kHz + SFX highpass 800Hz?
- [ ] amix normalize=0 (preserve dynamic range)?
- [ ] BGM fade-in 0.3s + fade-out 1.5s?
- [ ] SFX count appropriate (density chosen for scene personality)?
- [ ] Each SFX aligned with its visual beat at the same frame (within ±1 frame)?
- [ ] Logo-reveal SFX long enough (suggested 1.5s)?
- [ ] Mute BGM and listen: do SFX alone carry rhythm?
- [ ] Mute SFX and listen: does BGM alone have emotional arc?

Each of the two layers should be self-coherent in isolation. If only the layered mix sounds good, you haven't done the job.

---

## References

- SFX asset inventory: `sfx-library.md`
- Visual style reference: `apple-gallery-showcase.md`
- Anthropic three pieces deep audio analysis: `/Users/alchain/Documents/writing/01-public-account-writing/projects/2026.04-huashu-design-release/reference-animations/AUDIO-BEST-PRACTICES.md`
- huashu-design v9 production case: `/Users/alchain/Documents/writing/01-public-account-writing/projects/2026.04-huashu-design-release/visuals/hero-animation-v9-final.mp4`

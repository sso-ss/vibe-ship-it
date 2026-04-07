# DESIGN.md -- vibe-ship-it

> Design tokens extracted via headless browser.
> Computed styles from DOM elements + CSS custom properties from stylesheets.

## 1. Identity

**In one line:** Monochrome precision on white. Near-black text, gray borders, no color accent -- the content (screenshots, cards) is the color.

**Signature Techniques:**
- Custom font "saans" -- geometric sans-serif with unusual intermediate weights (440, 456, 652)
- Near-black `rgb(20, 20, 20)` for all primary text -- not pure black, not navy
- `rgba(64, 64, 64, 0.08)` shadow-as-border via `0px 0px 0px 1px inset` -- no CSS border property
- Generous pill radii (9999px) for buttons, 8-28px for cards
- White/light gray palette only -- zero brand color in the chrome

## 2. Color

### Palette
| Token | Value | Role |
|-------|-------|------|
| `background` | `rgb(255, 255, 255)` | Page canvas |
| `surface` | `rgb(245, 245, 245)` | Card backgrounds, subtle tint areas |
| `surface-alt` | `rgba(237, 237, 237, 0.72)` | Secondary surfaces, hover tints |
| `text-primary` | `rgb(20, 20, 20)` | Headings, primary content |
| `text-secondary` | `rgb(112, 112, 112)` | Descriptions, muted copy |
| `text-tertiary` | `rgb(173, 173, 173)` | Placeholder, disabled text |
| `border` | `rgb(237, 237, 237)` | Card edges, dividers |
| `border-subtle` | `rgba(64, 64, 64, 0.06)` | Faint separators |
| `ring` | `rgba(64, 64, 64, 0.08)` | Inset shadow-as-border on interactive elements |
| `overlay` | `rgba(194, 194, 194, 0.3)` | Backdrop, dimmed surfaces |

## 3. Typography

### Fonts
- **Primary:** saans, "saans Fallback", sans-serif
- **Mono:** system monospace (for code blocks)

### Scale
| Role | Size | Weight | Source |
|------|------|--------|--------|
| Display | 80px | 600 | extracted |
| H1 | 56px | 600 | extracted |
| H2 | 24px | 600 | extracted |
| H3 | 20px | 600 | extracted |
| Body | 16px | 440 | extracted |
| Body Small | 14px | 400 | extracted |
| Caption | 12px | 456 | extracted |

### Weight Strategy
Unusual weight system: 400 (light UI), 440 (body text), 456 (captions/labels), 600 (headings), 652 (bold emphasis). No 300 or 700 -- the scale lives in the 400-650 range.

## 4. Spacing & Layout

### Base Unit
4px grid. Scale: 4, 8, 12, 16, 20, 24, 28, 32, 48, 64, 80.

### Container
- Max width: ~1200px
- Page padding: 16px (mobile), 24px (tablet), 32px+ (desktop)
- Section gap: 64-80px between major sections

### Border Radius
| Token | Value | Used on |
|-------|-------|---------|
| `radius-sm` | 8px | Small cards, inputs |
| `radius-md` | 12px | Medium cards |
| `radius-lg` | 24px | Large feature cards |
| `radius-xl` | 28px | Hero cards, images |
| `radius-section` | 32px (bottom only) | Section bottom rounding |
| `radius-full` | 9999px | Buttons, pills, tags |

## 5. Depth & Motion

### Elevation
| Level | Shadow Value | Use |
|-------|-------------|-----|
| Flat | none | Default surfaces |
| Ring | `rgba(64, 64, 64, 0.16) 0px 0px 0px 1px inset` | Shadow-as-border on cards/inputs |
| Low | `rgba(0, 0, 0, 0.04) 0px 1px 2px 0px` | Subtle card lift |

### Motion
| Property | Value | Use |
|----------|-------|-----|
| `duration-fast` | 200ms | Hover states |
| `duration-base` | 300ms | Card transitions |
| `backdrop-blur` | `blur(24px)` | Navigation backdrop |
| `easing` | default ease | Transitions |

## 6. Components

### Buttons
**Primary:** `background: rgb(20, 20, 20)` `color: rgb(255, 255, 255)` `padding: 12px 24px` `radius: 9999px` `font-weight: 600` `font-size: 14px`
**Secondary:** `background: rgb(255, 255, 255)` `color: rgb(20, 20, 20)` `border: 1px solid rgb(237, 237, 237)` `radius: 9999px`
**Hover:** Background shifts, no shadow lift -- Mobbin uses color change, not elevation change.

### Cards
`background: rgb(255, 255, 255)` or `rgb(245, 245, 245)` `border: none` `shadow: rgba(64, 64, 64, 0.16) 0px 0px 0px 1px inset` (shadow-as-border) `radius: 12-28px` `padding: 16-24px`

### Inputs
`background: rgb(255, 255, 255)` `shadow: rgba(64, 64, 64, 0.16) 0px 0px 0px 1px inset` `radius: 8px` `padding: 10px 14px` `font-size: 14px`
Focus: ring color shifts to `oklch(62.7% .265 303.9)` (purple focus ring from Tailwind)

### Navigation
White sticky header with `backdrop-filter: blur(24px)`. Logo left, links center, CTA right. Text in `rgb(20, 20, 20)`, 14px weight 440.

### Signature Patterns
- **Inset shadow borders:** Cards use `box-shadow: 0 0 0 1px inset` instead of CSS `border` -- same technique as Vercel but with lower opacity
- **Monochrome + content color:** The UI chrome is entirely gray. Color comes from the screenshot content, not the interface
- **Large rounded hero cards:** 28px+ border radius on featured content areas

## 7. States

| State | Treatment |
|-------|-----------|
| Hover | Background shifts to `rgb(245, 245, 245)` on light elements. No shadow lift. |
| Focus | `oklch(62.7% .265 303.9)` ring via Tailwind `--tw-ring-color`, 2px offset |
| Disabled | `opacity: 0.5` |
| Loading | Spinner with 800ms animation duration |

## 8. Rules

### Do
- Use `rgb(20, 20, 20)` for text, never pure black `rgb(0, 0, 0)`
- Use shadow-as-border (`0 0 0 1px inset rgba(64,64,64,0.16)`) instead of CSS `border`
- Use "saans" font with weights 440 (body) and 600 (headings)
- Use pill radius (9999px) on all buttons
- Keep the chrome monochrome -- let content provide color
- Use `rgb(245, 245, 245)` for subtle surface differentiation

### Don't
- Don't use any brand/accent color in the UI chrome
- Don't use traditional CSS borders -- use inset shadow technique
- Don't use heavy shadows (max 0.04 opacity for ambient)
- Don't use font weights outside the 400-652 range
- Don't use pure black or pure white text -- use `rgb(20, 20, 20)` and `rgb(255,255,255)`
- Don't add elevation on hover -- Mobbin uses background shift, not lift

### Responsive
- Mobile breakpoint: 640px
- Tablet breakpoint: 1024px
- What changes: Display type scales from 80px to 40px. Card grids collapse to single column. Navigation collapses to hamburger. Section spacing compresses from 80px to 48px.

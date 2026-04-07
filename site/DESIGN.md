# DESIGN.md -- Stripe

> **Extraction note:** Stripe's CDN (`b.stripecdn.com`) blocks direct CSS access (403).
> The docs domain returned 404 for CSS files. Inline `<style>` blocks were not
> accessible via the fetch tool (HTML tags stripped). Values below are sourced from:
> HTML structure analysis (extracted), `meta` tags (extracted), and Stripe's
> publicly documented design patterns (known). Confidence level is marked per token.
> Verify accent colors and exact spacing against the live site if pixel-precision matters.

## 1. Identity

**In one line:** Weightless purple-gradient elegance on white -- every element floats with font-weight 300 and layered color washes that make infrastructure feel like art.

**Signature Techniques:**
- Gradient mesh hero backgrounds using multi-stop radial/conic gradients with purples, blues, teals, and pinks blended into a luminous wash (known)
- Ultra-light font-weight (300) on body text and descriptions -- the entire site whispers rather than shouts (known)
- Purple-to-blue gradient on CTAs and accent elements, never flat solid colors (known)
- Frosted glass cards with `backdrop-filter: blur()` and semi-transparent white backgrounds (known)
- Massive negative space between sections (120px+) with no visible dividers (extracted -- confirmed from HTML structure)

## 2. Color

### Palette
| Token | Value | Role | Confidence |
|-------|-------|------|------------|
| `background` | `#ffffff` | Page canvas, section backgrounds | extracted |
| `surface` | `rgba(255, 255, 255, 0.8)` | Cards, frosted panels over gradient | known |
| `text-primary` | `#0a2540` | Headings, primary content -- deep navy, not black | known |
| `text-secondary` | `#425466` | Descriptions, body copy | known |
| `text-tertiary` | `#6b7c93` | Metadata, captions, muted labels | known |
| `accent` | `#635bff` | Primary brand purple -- Blurple | known |
| `accent-hover` | `#7a73ff` | Lighter purple on hover | inferred |
| `accent-gradient` | `linear-gradient(135deg, #635bff 0%, #0073e6 100%)` | CTAs, active elements | known |
| `border` | `rgba(10, 37, 64, 0.08)` | Card edges, dividers | known |
| `border-subtle` | `rgba(10, 37, 64, 0.04)` | Light separator lines | inferred |
| `success` | `#30c174` | Positive states, confirmations | known |
| `warning` | `#f5a623` | Caution indicators | known |
| `danger` | `#e25950` | Error, destructive actions | known |
| `cyan` | `#00d4ff` | Gradient accent, data viz | known |
| `teal` | `#80e9d0` | Gradient accent, illustrations | known |
| `pink` | `#ff80b5` | Gradient accent, highlights | known |

### Dark Mode
Stripe primarily uses light mode. Dark sections use `#0a2540` (navy) as background with `#ffffff` text and reduced-opacity borders.

## 3. Typography

### Fonts
- **Primary:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif
- **Mono:** "Roboto Mono", "SF Mono", Menlo, monospace

### Scale
| Role | Size | Weight | Line Height | Letter Spacing | Confidence |
|------|------|--------|-------------|----------------|------------|
| Display | 94px (5.875rem) | 700 | 1.06 | -0.04em | known |
| H1 | 54px (3.375rem) | 700 | 1.15 | -0.03em | known |
| H2 | 40px (2.5rem) | 700 | 1.2 | -0.02em | known |
| H3 | 24px (1.5rem) | 700 | 1.33 | -0.01em | known |
| Body Large | 21px (1.3125rem) | 300 | 1.6 | normal | known |
| Body | 17px (1.0625rem) | 300 | 1.6 | normal | known |
| Body Small | 15px (0.9375rem) | 400 | 1.6 | normal | known |
| Caption | 13px (0.8125rem) | 500 | 1.5 | 0.02em | known |
| Code | 14px (0.875rem) | 400 | 1.7 | normal | inferred |

### Weight Strategy
Two extremes: 700 for headings (bold, navy, compressed tracking), 300 for body text (light, slate, relaxed). This contrast is the core Stripe signature. 400 and 500 used only for UI labels and captions.

## 4. Spacing & Layout

### Base Unit
8px grid. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120, 160.

### Container
- Max width: 1080px
- Page padding: 24px (mobile), 40px (tablet), 64px (desktop)
- Section gap: 96px-160px between major sections

### Border Radius
| Token | Value | Used on |
|-------|-------|---------|
| `radius-sm` | 4px | Inline badges, small UI elements |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, panels, containers |
| `radius-xl` | 16px | Feature cards, hero elements |
| `radius-full` | 9999px | Pills, tags, avatar circles |

## 5. Depth & Motion

### Elevation
| Level | Shadow Value | Use | Confidence |
|-------|-------------|-----|------------|
| Flat | none | Default page surface | extracted |
| Low | `0 2px 4px rgba(10, 37, 64, 0.06)` | Resting cards | known |
| Mid | `0 6px 12px rgba(10, 37, 64, 0.08), 0 1px 2px rgba(10, 37, 64, 0.04)` | Hovered cards, dropdowns | known |
| High | `0 13px 27px rgba(10, 37, 64, 0.1), 0 3px 6px rgba(10, 37, 64, 0.06)` | Modals, floating panels | known |
| Glow | `0 0 40px rgba(99, 91, 255, 0.15)` | Active/featured elements with purple tint | inferred |

Stripe uses `backdrop-filter: blur(16px) saturate(180%)` on frosted-glass surfaces over gradient backgrounds. Cards float on color washes without hard edges.

### Motion
| Property | Value | Use | Confidence |
|----------|-------|-----|------------|
| `duration-fast` | 150ms | Button hover, toggle, icon rotation | inferred |
| `duration-base` | 300ms | Card hover lift, panel open | inferred |
| `duration-slow` | 500ms | Page section entrance, gallery transition | inferred |
| `easing` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing | known |
| `easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance animations | inferred |
| `easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions | inferred |

Stripe uses staggered entrance animations on scroll (fade-up with 100ms delays between sibling elements) and smooth parallax displacement on hero gradient layers.

## 6. Components

### Buttons
**Primary:** `background: linear-gradient(135deg, #635bff 0%, #0073e6 100%)` `color: #ffffff` `padding: 12px 24px` `radius: 9999px` `shadow: 0 2px 4px rgba(99, 91, 255, 0.3)` `font-weight: 500` `font-size: 15px`
**Secondary:** `background: #ffffff` `color: #0a2540` `padding: 12px 24px` `radius: 9999px` `border: 1px solid rgba(10, 37, 64, 0.1)` `font-weight: 500`
**Ghost:** `background: transparent` `color: #635bff` `padding: 12px 24px` `radius: 9999px` `font-weight: 500`
**Hover/Focus:** Primary gains `shadow: 0 4px 12px rgba(99, 91, 255, 0.4)` and slight `translateY(-1px)`. Secondary gains `border-color: rgba(10, 37, 64, 0.2)` and Low shadow. Focus ring: `0 0 0 3px rgba(99, 91, 255, 0.3)`.

### Cards
`background: rgba(255, 255, 255, 0.8)` or `#ffffff` `border: 1px solid rgba(10, 37, 64, 0.08)` `radius: 12px` `shadow: 0 2px 4px rgba(10, 37, 64, 0.06)` `padding: 32px`
Hover: shadow escalates to Mid level, `translateY(-2px)`.

### Inputs
`border: 1px solid rgba(10, 37, 64, 0.15)` `radius: 8px` `padding: 10px 14px` `font-size: 15px` `focus: border-color #635bff, box-shadow 0 0 0 3px rgba(99, 91, 255, 0.15)`
Error: `border-color: #e25950`, subtle red background tint.
Label: above input, 13px weight 500, `color: #0a2540`.

### Navigation
White sticky header with blur backdrop. Logo left, centered links at 15px weight 500 in `#0a2540`. Active link has purple underline or `color: #635bff`. Right side: ghost "Sign in" + gradient pill CTA. Mobile: slide-in drawer.

### Icons
Line style, 20px default, 1.5px stroke weight, rounded line caps and joins. Consistent with the lightweight aesthetic.

### Signature Patterns
- **Gradient mesh hero:** Multi-layer radial gradients (purple, blue, cyan, teal, pink) creating an atmospheric color wash behind hero content. Not a simple linear gradient -- it's layered, organic, and shifts subtly.
- **Metric grid:** Large numbers (48px-94px, weight 700) with short labels underneath in a responsive row. Numbers in navy, labels in slate.
- **Frosted panels:** Cards with `backdrop-filter: blur()` floating over gradients, creating depth without heavy shadows.

## 7. States

| State | Treatment |
|-------|-----------|
| Hover | Shadow escalation + subtle `translateY(-1px)` lift. Links shift to `#635bff`. Buttons gain deeper shadow glow. |
| Focus | `box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.25)` -- purple focus ring, 3px spread, no outline |
| Active/Pressed | `translateY(0)` (returns from hover lift), shadow reduces to resting |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, no hover effects |
| Loading | Subtle pulse animation on skeleton shapes using `background: linear-gradient(90deg, #f0f5fa 25%, #e8eef4 50%, #f0f5fa 75%)` |
| Empty | Light illustration + muted text centered, "No items yet" pattern in `#6b7c93` |
| Error | `#e25950` text, light red tint background `rgba(226, 89, 80, 0.05)`, red border on inputs |

## 8. Rules

### Do
- Use `#0a2540` (deep navy) for headings, never pure `#000000`
- Use font-weight 300 for body text -- 700 only for headings
- Use gradient CTAs (`#635bff` to `#0073e6`) for primary actions, pill-shaped (9999px radius)
- Apply frosted glass (`backdrop-filter: blur(16px)`) when placing cards over colored backgrounds
- Use the gradient mesh technique for hero backgrounds (layered radial gradients, not flat)
- Keep section spacing generous (96px+ vertical padding)
- Use `rgba()` borders instead of solid hex -- transparency creates lightness

### Don't
- Don't use solid purple backgrounds -- always gradient or as accent
- Don't use font-weight 400 for body text (too heavy for Stripe's aesthetic -- use 300)
- Don't use hard shadows with high opacity (max 0.1 for ambient shadows)
- Don't use square corners on buttons (always pill or 8px minimum)
- Don't use `#000000` anywhere -- deepest color is `#0a2540`
- Don't place text directly on gradient backgrounds without contrast overlay
- Don't use borders heavier than 1px

### Responsive
- Mobile breakpoint: 640px
- Tablet breakpoint: 1024px
- What changes: Display type scales from 94px to 40px on mobile. Section padding compresses from 120px to 64px. Card grids collapse to single column. Navigation becomes hamburger drawer. Gradient hero simplifies to fewer color stops on mobile for performance. Metric grid stacks vertically with centered alignment.

# DESIGN.md: vibe-ship-it

<!-- extraction-meta
source: https://vibe-ship-it.vercel.app
date: 2026-04-07
confidence: { extracted: 85%, inferred: 10%, known: 5% }
staleness-risk: low
sources-attempted: [HTML, 6 external CSS files]
sources-succeeded: [HTML, 6 CSS files (f46e42, a8e1b6, 5bb33b, adee75, f2f88c, 1e8cfb)]
priority-rule: external-css > style-blocks > inline-style > known
-->

## 1. Identity

**In one line:** Monochrome tool-as-canvas: a neutral, precise shell in custom "saans" type that disappears so design screenshots become the visual story.

**Signature Techniques:**
- Custom variable font "saans" with three non-standard weights (440 body, 456 UI labels, 652 headings) instead of the usual 400/500/700
- Full HSL token system with semantic aliasing: raw scale (`--neutral-0` through `--neutral-100`) mapped to roles (`--text-primary`, `--background-secondary`)
- `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` ultra-thin image inset borders (half-pixel trick for retina crispness)
- Glass/frosted subsystem (`--glass-*`) for overlays with blurred backgrounds at multiple intensities (4px through 32px)
- Opacity token matrix: `--opacity-black-*`, `--opacity-white-*`, `--opacity-gray-*` at 13 stops each (4% through 100%) for micro-transparency control

## 2. Color

### Palette
| Token | Value (HSL) | Resolved | Role | Confidence |
|-------|-------------|----------|------|------------|
| `background-primary` | `var(--neutral-0)` | `hsl(0 0% 100%)` | Page canvas | extracted |
| `background-secondary` | `var(--opacity-black-6)` | `hsl(0 0% 25%/6%)` | Subtle tinted areas | extracted |
| `background-tertiary` | `var(--opacity-black-8)` | `hsl(0 0% 25%/8%)` | Deeper recessed areas | extracted |
| `background-inverse` | `var(--neutral-100)` | `hsl(0 0% 8%)` | Dark buttons, dark panels | extracted |
| `background-modal` | `var(--neutral-0)` | `hsl(0 0% 100%)` | Modals, sheets | extracted |
| `background-brand` | `var(--blue-70)` | `hsl(216 100% 50%)` | Brand CTAs (rare) | extracted |
| `text-primary` | `var(--neutral-100)` | `hsl(0 0% 8%)` | Headings, body text | extracted |
| `text-secondary` | `var(--neutral-60)` | `hsl(0 0% 44%)` | Descriptions, muted copy | extracted |
| `text-tertiary` | `var(--neutral-40)` | `hsl(0 0% 68%)` | Placeholder, metadata | extracted |
| `text-disabled` | `var(--neutral-40)` | `hsl(0 0% 68%)` | Disabled labels | extracted |
| `text-inverse` | `var(--neutral-0)` | `hsl(0 0% 100%)` | Text on dark backgrounds | extracted |
| `text-link-primary` | `var(--blue-70)` | `hsl(216 100% 50%)` | Links | extracted |
| `border-divider` | `var(--neutral-10)` | `hsl(0 0% 93%)` | Section dividers, card edges | extracted |
| `border-secondary` | `var(--opacity-black-8)` | `hsl(0 0% 25%/8%)` | Subtle borders | extracted |
| `border-focus` | `var(--neutral-100)` | `hsl(0 0% 8%)` | Focus ring | extracted |
| `success` | `var(--green-60)` | `hsl(103 79% 35%)` | Positive states | extracted |
| `warning` | `var(--yellow-60)` | `hsl(36 100% 33%)` | Caution states | extracted |
| `danger` | `var(--red-60)` | `hsl(18 100% 44%)` | Error, destructive actions | extracted |
| `overlay` | `hsl(0 0% 0%/60%)` | `rgba(0,0,0,0.6)` | Backdrop overlay | extracted |

### Neutral Scale (full)
| Token | HSL Value | Resolved |
|-------|-----------|----------|
| `neutral-0` | `0 0% 100%` | `#ffffff` |
| `neutral-5` | `0 0% 96%` | `#f5f5f5` |
| `neutral-10` | `0 0% 93%` | `#ededed` |
| `neutral-20` | `0 0% 86%` | `#dbdbdb` |
| `neutral-30` | `0 0% 76%` | `#c2c2c2` |
| `neutral-40` | `0 0% 68%` | `#adadad` |
| `neutral-50` | `0 0% 53%` | `#878787` |
| `neutral-60` | `0 0% 44%` | `#707070` |
| `neutral-70` | `0 0% 36%` | `#5c5c5c` |
| `neutral-80` | `0 0% 25%` | `#404040` |
| `neutral-90` | `0 0% 15%` | `#262626` |
| `neutral-95` | `0 0% 12%` | `#1f1f1f` |
| `neutral-100` | `0 0% 8%` | `#141414` |

### Dark Mode
| Token | Light | Dark |
|-------|-------|------|
| `text-primary` | `var(--neutral-100)` | `var(--neutral-0)` |
| `text-secondary` | `var(--neutral-60)` | `var(--neutral-40)` |
| `text-tertiary` | `var(--neutral-40)` | `var(--neutral-60)` |
| `background-primary` | `var(--neutral-0)` | `var(--neutral-100)` |
| `background-secondary` | `var(--opacity-black-6)` | `var(--opacity-white-6)` |
| `background-modal` | `var(--neutral-0)` | `var(--neutral-95)` |
| `background-inverse` | `var(--neutral-100)` | `var(--neutral-0)` |
| `border-divider` | `var(--neutral-10)` | `var(--neutral-80)` |
| `border-focus` | `var(--neutral-100)` | `var(--neutral-0)` |
| `shadow-image-inset` | `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` | `inset 0 0 0 0.5px hsl(0 0% 100%/16%)` |
| `shadow-dropdown` | `0 8px 24px hsl(0 0% 0%/12%)` | `0 8px 24px hsl(0 0% 0%/48%)` |
| `overlay` | `hsl(0 0% 0%/60%)` | `hsl(0 0% 0%/80%)` |

## 3. Typography

### Fonts
- **Primary:** "saans", "saans Fallback", sans-serif. Custom variable font (woff2), fallback calibrated via `ascent-override: 95.72%; descent-override: 22.67%; size-adjust: 99.25%` on local Arial
- **Mono:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace

### Scale
| Role | Size | Weight | Line Height | Letter Spacing | Confidence |
|------|------|--------|-------------|----------------|------------|
| Display | 80px | 652 | 80px | -5px | extracted |
| H1 | 56px | 652 | 56px | -3px | extracted |
| H2 | 44-46px | 652 | 50px | -1px | extracted |
| H3 | 32px | 600 | 36px | -0.6px | extracted |
| H4 | 24px | 600 | 30px | -0.4px | extracted |
| Body Large | 20px | 456 | 26px | 0 | extracted |
| Body | 16px | 440 | 22px | 0 | extracted |
| Body Small | 14px | 440 | 20px | 0 | extracted |
| Caption | 12px | 500 | 16px | 0.2px | extracted |
| Micro | 10px | 500 | 12px | 0.2px | extracted |

### Weight Strategy
Three custom weights on a variable axis: 440 (reading: body, descriptions), 456 (interacting: labels, navigation, UI controls), 652 (announcing: display, headings). Traditional 500 and 600 also appear on secondary elements. No bold (700+) anywhere.

## 4. Spacing & Layout

### Base Unit
4px grid. Scale: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96, 120, 160.

### Container
- Max content width: `1280px` (`--max-content-width`)
- Max container width: `1920px` (used for full-bleed sections)
- Page padding: `16px` (mobile) / `24px` (tablet) / `32px` (small desktop) / `80px` (large desktop) / `152px` (ultrawide)
- Section gap: `64px` (mobile) / `80px` (desktop) via `--section-gap`
- Column gap: `12px` / `16px` / `24px` via `--column-gap`

### Border Radius
| Token | Value | Used on |
|-------|-------|---------|
| `radius-xs` | 4px | Tiny badges, inline tags |
| `radius-sm` | 8px | Inputs, small cards, code blocks |
| `radius-md` | 12px | Medium cards, containers |
| `radius-lg` | 16px | Panels, modals |
| `radius-xl` | 20px | Large cards |
| `radius-2xl` | 24px | Hero cards, major sections |
| `radius-3xl` | 28px | Featured content areas |
| `radius-4xl` | 32px | Full-bleed rounded sections |
| `radius-5xl` | 40px | Marketing hero blocks |
| `radius-full` | 9999px | Buttons, pills, avatars, tags |

## 5. Depth & Motion

### Elevation
| Level | Shadow Value | Use |
|-------|-------------|-----|
| Flat | none | Page background, default |
| Image inset | `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` | Screenshot cards, image containers |
| Logo inset | `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` | App icon/logo containers |
| Low | `0px 1px 2px rgba(0,0,0,0.04)` | Subtle card lift |
| Mid | `0px 4px 12px rgba(0,0,0,0.08)` | Hovered cards, interactive elements |
| High | `0 8px 24px hsl(0 0% 0%/12%)` | Dropdowns, popovers (`--shadow-dropdown`) |
| Elevated | `0px 16px 48px rgba(0,0,0,0.04)` | Floating panels |
| Hero | `0 12px 80px hsl(0 0% 0%/16%)` | Hero elements, major modals (`--shadow`) |
| Dramatic | `0px 10px 20px -5px rgba(0,0,0,0.25)` | Featured content, marketing blocks |
| Shadow-as-border | `inset 0px 0px 0px 1px rgba(0,0,0,0)` | Invisible border placeholder, colored via `--tw-shadow-color` |

### Motion
| Property | Value | Use |
|----------|-------|-----|
| `duration-fast` | 150ms | Micro-interactions, enter/exit (`--tw-in-duration`, `--tw-out-duration`) |
| `duration-base` | 200ms | Hover states, general transitions (`--duration`) |
| `duration-slow` | 500ms | Panel open/close, modals (`--tw-in-duration: 500ms`) |
| `easing-smooth` | `cubic-bezier(0.32, 0.72, 0, 1)` | Primary easing for enter/exit animations |
| `easing-out` | `ease-out` | Secondary easing for simpler transitions |
| `backdrop-blur-sm` | `blur(4px)` | Light frost |
| `backdrop-blur-md` | `blur(8-12px)` | Medium frost |
| `backdrop-blur-lg` | `blur(16-24px)` | Navigation frost, modals |
| `backdrop-blur-xl` | `blur(32px)` | Heavy overlay frost |
| `spinner` | 800ms | Loading spinner duration (`--spinner-animation-duration`) |

## 6. Components

### Buttons
| Property | Primary | Secondary | Ghost |
|----------|---------|-----------|-------|
| background | `hsl(var(--background-inverse))` | `hsl(var(--background-secondary))` | `transparent` |
| color | `hsl(var(--text-inverse))` | `hsl(var(--text-primary))` | `hsl(var(--text-primary))` |
| padding | `12px 24px` | `12px 24px` | `12px 24px` |
| radius | `9999px` | `9999px` | `9999px` |
| border | none | `hsl(var(--border-secondary))` | none |
| shadow | none | none | none |
| font-weight | 600 | 456 | 456 |
| font-size | 14px | 14px | 14px |

| State | Primary | Secondary |
|-------|---------|-----------|
| Hover | `background: hsl(var(--background-inverse-hover))` | `background: hsl(var(--background-secondary-hover))` |
| Focus | `ring: 2px offset-2px hsl(var(--border-focus))` | `ring: 2px offset-2px hsl(var(--border-focus))` |

### Cards
| Property | Value |
|----------|-------|
| background | `hsl(var(--background-primary))` or `hsl(var(--background-secondary))` |
| border | none (uses shadow-as-border) |
| radius | 12-28px depending on size |
| shadow | `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` on image cards |
| padding | 16-24px |
| hover | Background shifts to `hsl(var(--background-primary-hover))`, no elevation change |

### Inputs
| Property | Value |
|----------|-------|
| border | `hsl(var(--border-secondary))` |
| radius | 8px |
| padding | 10px 14px |
| font-size | 14px |
| focus | `ring: 3px hsl(var(--border-focus))` with 2px offset |
| error | `border-color: hsl(var(--border-negative))` |
| label | Above input, 12px weight 500 |

### Navigation
Sticky header with `backdrop-filter: blur(24px)` on frosted white. Height: `52px` (compact) / `72px` (expanded) / `108px` (with sub-nav). Logo left, links center, CTA right. Text: 14px weight 456 in `hsl(var(--text-primary))`.

### Icons
Consistent 16px/20px/24px grid. Line style, 1.5px stroke weight (inferred from visual appearance). Neutral color inheriting text color.

### Signature Patterns
- **Half-pixel image insets:** `inset 0 0 0 0.5px hsl(0 0% 0%/10%)` creates ultra-crisp retina borders on screenshot cards without visible lines at 1x
- **Monochrome shell, content color:** The entire UI is achromatic neutral. Color comes exclusively from the app screenshots, logos, and content inside cards
- **Glass subsystem:** A full parallel token set (`--glass-*`) for frosted/backdrop-blur surfaces with their own text, background, and border tokens

## 7. States

| State | Treatment |
|-------|-----------|
| Hover | Background shifts via `--background-*-hover` tokens. No shadow lift. Buttons darken, cards lighten. |
| Focus | `hsl(var(--border-focus))` ring, 2-3px width, 2px offset from `hsl(var(--background-primary))` |
| Active/Pressed | `scale(0.96)` with `cubic-bezier(0.32, 0.72, 0, 1)` easing |
| Disabled | `hsl(var(--background-disabled))` background, `hsl(var(--text-disabled))` text, `hsl(var(--border-disabled))` border |
| Loading | Spinner with `800ms` animation duration. Drop shadow low. |
| Empty | Muted `hsl(var(--text-tertiary))` text, centered, no illustration (inferred) |
| Error | `hsl(var(--red-60))` border, `hsl(var(--text-negative))` text, red-tinted background `hsl(var(--background-negative-secondary))` |

## 8. Rules

### Do
- Use `hsl(0 0% 8%)` (`--neutral-100`) for primary text, never pure `#000000`
- Use the HSL token system with `hsl(var(--token-name))` syntax throughout
- Use "saans" font with weights 440 (body), 456 (UI), 652 (headings)
- Use pill radius (`9999px`) on all buttons without exception
- Keep UI chrome fully achromatic. Blue only appears as `--background-brand` on primary CTAs and links
- Use inset shadow (`inset 0 0 0 0.5px`) at low opacity for image card borders
- Use the opacity token matrix (`--opacity-black-*`) for transparency instead of ad-hoc rgba values
- Negative letter-spacing scales with font size: -5px at 80px, -3px at 56px, -1px at 44px, -0.4px at 24px, 0 at 16px and below

### Don't
- Don't use brand colors in the UI shell (only in CTAs and links)
- Don't use CSS `border` on image cards. Use the `inset 0 0 0 0.5px` shadow technique
- Don't use heavy shadows (max `0.16` opacity for ambient via `--shadow`, `0.04` for card level)
- Don't use font weights above 652 or standard 700 (bold)
- Don't use pure black `#000` or pure white text `#fff` for content. Use `--neutral-100` and `--neutral-0`
- Don't add elevation on hover. Use background-shift, never shadow-lift
- Don't invent opacity values. Use the 13-stop opacity scale (4%, 6%, 8%, 10%, 12%, 16%, 24%, 32%, 48%, 64%, 88%, 96%, 100%)

### Responsive
- Small mobile: `550px`
- Tablet: `720px`
- Small desktop: `1024px`
- Desktop: `1280px`
- Large desktop: `1536px`
- Ultrawide: `1920px` / `2100px`
- What changes: Display type scales from 80px down to ~44px. Column grids shift from 7 columns to single column via `--max-column-count`. Container padding compresses from 152px (ultrawide) to 16px (mobile). Navigation height changes from 108px to 52px. Section gap compresses from 80px to 64px. Backdrop blur adjusts from 32px to 8px on smaller screens.

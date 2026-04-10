---
name: generate-design-md
description: "Generates a DESIGN.md file from any website URL. Captures colors, typography, spacing, components, and visual atmosphere into a reusable design system document that AI agents can read. Triggers: 'generate design md', 'capture the design', 'grab the design from', 'make it look like this site', 'extract design from', 'design md from', 'copy the style of', 'steal the look', 'I like how this site looks', 'use this site as reference', 'design reference from URL'."
---

# Generate DESIGN.md

Takes a website URL and produces a complete DESIGN.md file -- a plain-text design system document that any AI coding agent can read to build UI that matches that site's look and feel.

## How It Works

1. Designer gives a URL
2. Fetch the page HTML and all linked CSS
3. Extract every visual token: colors, fonts, spacing, shadows, radii, component patterns
4. Analyze the visual atmosphere and design philosophy
5. Detect the page structure (sections, grids, layout patterns)
6. Generate three files:
   - `DESIGN.md` -- the complete design system (9 sections)
   - Tailwind config extension -- tokens mapped to utility classes
   - CSS variables -- tokens as custom properties in globals.css
7. Drop them in the project

One command. No questions. The designer just sees the result.

## When To Use

- "I like how linear.app looks -- capture that"
- "Generate a design md from stripe.com"
- "Make my app look like this site"
- "Use vercel.com as a design reference"
- "Grab the design from notion.so"
- "Copy the style of airbnb.com"

## Extraction Process

### Step 1: Fetch (multi-pass)

Do multiple fetches to maximize what you capture:

**Pass 1: HTML**
Fetch the target URL. From the HTML, extract:
- All `<link rel="stylesheet" href="...">` URLs
- All `<style>` blocks (including `<style data-*>` for CSS-in-JS SSR output)
- All `style="..."` inline attributes on elements
- `<meta name="theme-color" content="...">` for brand color
- Google Fonts / Typekit `<link>` URLs (reveals exact font families and weights)
- `<link rel="icon">` and `<link rel="apple-touch-icon">` (brand color clues)

**Pass 2: CSS files**
Fetch each discovered stylesheet URL. If a URL returns 403/404:
- Try removing query strings
- Try the base domain + `/styles.css`, `/main.css`, `/globals.css`
- Try common CDN patterns: `cdn.example.com/css/...`
- Move on if blocked -- note which sources were inaccessible

**Pass 3: Critical CSS extraction**
Many modern sites inline critical CSS in `<style>` tags in the `<head>`. This often contains:
- CSS custom properties (`:root { --color-primary: ... }`)
- Font-face declarations
- Key component styles
- Media queries with breakpoints

This is often the richest source -- don't skip it.

### Step 2: Extract Raw Tokens

Pull these from ALL collected sources (external CSS + inline styles + style blocks):

| What | Where to look |
|---|---|
| Colors | CSS custom properties, `color`, `background-color`, `border-color`, `fill`, `box-shadow` color values, `style="color:..."` inline, `meta[theme-color]` |
| Fonts | `font-family`, `@font-face`, Google Fonts URL params (`?family=Inter:wght@300;400;700`), Typekit kit IDs |
| Type scale | `font-size`, `font-weight`, `line-height`, `letter-spacing` -- collect ALL unique values and sort |
| Spacing | `padding`, `margin`, `gap` -- collect unique values, find the base unit (most common divisor) |
| Radii | `border-radius` -- collect per-component (see Radius Precision below) |
| Shadows | `box-shadow` -- capture full declarations including multi-layer stacks |
| Borders | `border` shorthand and individual properties |
| Transitions | `transition`, `animation`, `@keyframes` declarations |
| Breakpoints | `@media` queries -- extract all width breakpoints |

#### Radius Precision

Border-radius is the token most often wrong because CSS text alone is ambiguous: variable references (`var(--radius)`), utility classes (`rounded-xl`), and shorthand (`8px 8px 0 0`) all hide the actual computed value. Use these techniques in order of reliability:

**1. Resolve CSS variables.** If you see `border-radius: var(--radius-md)`, find the variable definition in `:root` or the CSS variable block and substitute the literal value. Chain through aliases: `--radius-md: var(--radius-base)` means you need `--radius-base` too.

**2. Map utility classes.** If the HTML uses Tailwind or a utility-first framework, map class names to known values:
| Class | Value |
|-------|-------|
| `rounded-none` | 0px |
| `rounded-sm` | 2px (0.125rem) |
| `rounded` | 4px (0.25rem) |
| `rounded-md` | 6px (0.375rem) |
| `rounded-lg` | 8px (0.5rem) |
| `rounded-xl` | 12px (0.75rem) |
| `rounded-2xl` | 16px (1rem) |
| `rounded-3xl` | 24px (1.5rem) |
| `rounded-full` | 9999px |

If the site uses a custom Tailwind config the values may differ. Check CSS custom properties for overrides like `--radius: 0.625rem` (Shadcn/ui pattern).

**3. Group by component.** Different components use different radii. Always record WHICH component a radius belongs to:
- Buttons: typically `radius-sm` or `radius-md`
- Cards / panels: typically `radius-md` or `radius-lg`
- Inputs: typically matches button radius
- Modals / sheets: typically `radius-lg` or `radius-xl`
- Badges / pills: often `radius-full` (9999px)
- Avatars: `radius-full` for circles, `radius-md` for rounded squares
- Dropdowns / menus: typically `radius-md`
- Tooltips: typically `radius-sm`

When two components use the same numeric value, that's an intentional design system choice. Note it. When they differ by component, that IS the radius scale.

**4. DevTools precision pass (optional).** If the fetched CSS is heavily variable-based, JS-rendered, or the radius values look ambiguous, ask the designer to run the DevTools extractor script in their browser:
1. Open the target site in Chrome/Safari/Firefox
2. Open DevTools console (right-click > Inspect > Console)
3. Paste the extractor script (available at the project's `public/extract.js`)
4. The script reads `getComputedStyle()` on every visible element and groups radii by component type (button, card, input, modal, badge, etc.)
5. Result is copied to clipboard as JSON

The `radiusByComponent` object in the script output gives the exact computed radius for each component type, with occurrence counts. This is ground truth, since it reads the browser's final rendered values after all CSS variable resolution, utility class application, and specificity battles.

When the designer pastes this JSON, use `radiusByComponent` as the authoritative source for the Border Radius table in DESIGN.md. It overrides any values inferred from CSS text.

### Step 3: Verify, don't guess

**Extracted** = you found the exact value in HTML, CSS, or inline styles. Mark these with confidence.

**Inferred** = you deduced the value from patterns (e.g., "body text is probably 16px based on the type scale"). Note these in the output with `(inferred)` so the designer knows.

**Known** = you recognize the site and fill from general knowledge. This is valid but must be flagged: add a note at the top of the DESIGN.md if significant portions came from recognition rather than extraction. Known values come from training data that may be months or years old. If a site has redesigned since then, known values will be confidently wrong. If more than 30% of tokens are "known" with zero extracted confirmation, add a warning that values may reflect an older version of the site.

**Source priority when values conflict:** External stylesheet > inline `<style>` blocks > `style=""` attributes > known. This inverts normal CSS specificity on purpose: inline `style` attributes are often one-off overrides, not canonical design tokens. The stylesheet is where the real system lives. When two sources disagree on the same property, use the higher-priority source and drop the other silently.

If the output is mostly inferred/known (CSS was blocked, JS-rendered, etc.), add this note at the top:
```
> Note: CSS files were not fully accessible. Some values are based on 
> visual analysis of the site's publicly visible HTML and known design patterns.
> Verify accent colors and exact spacing values against the live site.
```

### Step 4: Analyze Patterns

From the raw tokens, identify:
- **Color roles**: Which color is background? Primary text? Accent? Secondary text? Border?
- **Type hierarchy**: What's the display size? Heading? Body? Caption? What weights are used?
- **Spacing rhythm**: Is it 4px-based? 8px-based? What's the scale?
- **Component signatures**: How do buttons look? Cards? Inputs? Navigation?
- **Shadow philosophy**: Flat? Subtle elevation? Heavy depth? Shadow-as-border?
- **Shape language**: Map each component type to its specific radius. Are buttons and inputs the same? Are cards larger? Any use of asymmetric radii (e.g. `8px 8px 0 0`)? Does the radius scale follow a pattern (e.g. 4/8/12/16)?

#### Font Classification

Separate extracted fonts into three buckets:
- **Body font**: the font used on most text. Look for names containing "Text", "Body", or "Sans" (without "Display").
- **Heading font**: used for titles. Look for names containing "Display", "Headline", "Title".
- **Mono font**: for code/data. Names containing "Mono", "Code", "Consol", "Courier".

**Filter out icon fonts** before assigning roles. Skip any font with "Awesome", "Material", "Icon", "Symbol", "Glyph", "Icomoon", "Feather", "Ionicons", "Remixicon", "Lucide", or "Bootstrap Icon" in the name. These are icon fonts, not text fonts.

If the site uses only one text font for everything, note it as both body and heading. If there are two distinct non-icon fonts, the more common one is body, the other is heading.

#### Accent Color Detection

The accent color must be intentional, not a stray focus ring or outline:
- **Saturation > 40%** required. Low-saturation colors are grays, not brand colors.
- **Source must be text or background**, not border. Border colors often inherit browser defaults (blue focus rings, outline colors).
- **Monochrome sites** (Uber, Nike) have no accent. The primary button is dark/black, not colored. Don't force an accent when there isn't one.
- **Check CSS variables**: `--accent`, `--brand`, `--color-primary`, `--color-button-primary` often hold the brand color.

#### Button Detection

Sites use different button styles. Detect in this priority:
1. **Chromatic buttons**: colored background (saturation > 40%). This is the accent/CTA.
2. **Dark/black buttons**: common on monochrome sites (Nike, Puma, Uber, Vercel). Brightness < 60.
3. **Any visible button**: non-transparent, non-white background.

**Skip utility buttons** when looking for the primary CTA: "Skip to content", "Search", "Close", "Menu", "My account", "next/prev".

#### Card Style Detection

Cards come in distinct patterns. Detect which one the site uses:
- **Shadow cards**: no border, `box-shadow` at rest. Common on SaaS sites (Stripe, Linear).
- **Bordered cards**: `border` visible, no shadow at rest. Shadow appears on hover. Common on e-commerce (Airbnb).
- **No-container cards**: just a rounded image with text below, no wrapping element. No border, no shadow, no background. Common on media/marketplace sites (Airbnb listings, Mobbin).
- **Inset cards**: `box-shadow: inset` as border technique (Vercel).

Card radius cap: anything over 32px is likely a search bar or hero element, not a card. Default to 12px.

#### Dropdown Detection

Nav dropdown menus are the best source for dropdown styling because every site has one and they're styled consistently. Detection priority:
1. **Nav menu panels**: look for `[role="menu"]`, `[role="listbox"]`, or class patterns (`dropdown`, `menu-panel`, `submenu`, `popover`, `flyout`, `mega-menu`) inside `<nav>` or `<header>`.
2. **Hidden panels**: most dropdowns are `display:none` until hover. Their styles are still readable via `getComputedStyle()`.
3. **Page-wide fallback**: search the whole page for the same selectors.

Dropdown radius cap: max 24px. Dropdowns are tight UI, never pill-shaped.

#### Pill Detection

Only values >= 999px count as pills, NOT percentage values like `50%` or `100%`. The value `50%` creates circles (avatars, icons), not pills. The value `border-radius: 9999px` or `border-radius: 1600px` creates pills.

When a site uses pills AND no explicit button radius is detected, assume buttons are pills too.

#### Bot Protection

If the headless browser lands on a challenge page instead of the real site, detect it by checking the page title or first heading for phrases like: "just a moment", "checking your browser", "security check", "access denied", "attention required", "what happened", "please verify", "captcha". Return a clear error telling the user to use the DevTools paste method instead.

### Step 5: Interpret the Atmosphere

Read the design decisions as a whole. What does this site feel like?
- Dense or spacious?
- Technical or friendly?
- Dark or light?
- Minimal or rich?
- Corporate or playful?

Write this as a short, opinionated paragraph -- not a list of CSS values.

## Output Format

The DESIGN.md follows a 9-section structure optimized for AI agents. Every section earns its place -- no redundancy, no prose padding.

```markdown
# DESIGN.md -- [Site Name]

<!-- extraction-meta
source: [URL]
date: [YYYY-MM-DD]
confidence: { extracted: [%], inferred: [%], known: [%] }
staleness-risk: [low/medium/high]
sources-attempted: [list of what you tried to fetch]
sources-succeeded: [list of what returned usable data]
priority-rule: external-css > style-blocks > inline-style > known
-->

[If staleness-risk is medium or high, add a blockquote warning here.]

## 1. Identity

**In one line:** [Single sentence capturing the visual personality -- what a designer would say after 5 seconds on the site.]

**Signature Techniques:**
- [3-5 bullets. Only the things that make THIS site look different from others. Not generic traits like "uses whitespace." Specific moves: "shadow-as-border via `box-shadow: 0 0 0 1px`", "negative letter-spacing at display sizes (-2.4px)", "gradient mesh hero backgrounds".]

## 2. Color

### Palette
| Token | Value | Role | Confidence |
|-------|-------|------|------------|
| `background` | `#hex` | Page canvas | [extracted/inferred/known] |
| `surface` | `#hex` | Cards, panels, elevated containers | |
| `text-primary` | `#hex` | Headings, body text | |
| `text-secondary` | `#hex` | Descriptions, muted copy | |
| `text-tertiary` | `#hex` | Placeholder, disabled, metadata | |
| `accent` | `#hex` | Primary brand action, links | |
| `accent-hover` | `#hex` | Accent hover state | |
| `border` | `#hex` or `rgba()` | Dividers, card edges, input borders | |
| `border-subtle` | `#hex` or `rgba()` | Lighter separator lines | |
| `success` | `#hex` | Confirmation, positive states | |
| `warning` | `#hex` | Caution states | |
| `danger` | `#hex` | Error, destructive actions | |
[Add any brand-specific named colors: "Ship Red", "Console Blue", etc.]

### Dark Mode (if present)
| Token | Light | Dark |
|-------|-------|------|
[Same token names, mapped values for both themes. If no dark mode detected, omit this subsection.]

## 3. Typography

### Fonts
- **Primary:** [font name] -- [fallback stack]
- **Mono:** [font name] -- [fallback stack] (omit if site doesn't use mono)

### Scale
| Role | Size | Weight | Line Height | Letter Spacing | Confidence |
|------|------|--------|-------------|----------------|------------|
| Display | [px/rem] | [number] | [value] | [value] | |
| H1 | [px/rem] | [number] | [value] | [value] | |
| H2 | [px/rem] | [number] | [value] | [value] | |
| H3 | [px/rem] | [number] | [value] | [value] | |
| Body | [px/rem] | [number] | [value] | [value] | |
| Body Small | [px/rem] | [number] | [value] | [value] | |
| Caption | [px/rem] | [number] | [value] | [value] | |
| Code | [px/rem] | [number] | [value] | [value] | |
[Add rows as needed -- these are minimums, not limits.]

### Weight Strategy
[1-2 lines. How many weights are used and what each one means. e.g. "Three weights only: 400 (read), 500 (interact), 600 (announce). No bold."]

## 4. Spacing & Layout

### Base Unit
[e.g. "8px grid. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96."]

### Container
- Max width: [value]
- Page padding: [value]
- Section gap: [value]

### Border Radius
| Token | Value | Used on | Source |
|-------|-------|---------|--------|
| `radius-sm` | [px] | [inputs, inline code, tooltips] | [extracted/variable-resolved/class-mapped/devtools] |
| `radius-md` | [px] | [buttons, cards, dropdowns] | |
| `radius-lg` | [px] | [modals, hero cards, large panels] | |
| `radius-full` | [px/9999px] | [badges, pills, avatars] | |

[Map every component to its radius token. If buttons use `radius-md` and cards also use `radius-md`, say so. If they differ, that IS the scale]

## 5. Depth & Motion

### Elevation
| Level | Shadow Value | Use |
|-------|-------------|-----|
| Flat | none | Page background |
| Low | `[full CSS]` | Cards, containers |
| Mid | `[full CSS]` | Dropdowns, popovers |
| High | `[full CSS]` | Modals, dialogs |
[Add rows for distinctive techniques: backdrop-blur, glassmorphism, glow, inner shadow, shadow-as-border. Keep them in the table, not as prose.]

### Motion
| Property | Value | Use |
|----------|-------|-----|
| `duration-fast` | [ms] | Hover, toggle, micro-interactions |
| `duration-base` | [ms] | Page transitions, panel open/close |
| `duration-slow` | [ms] | Entrance animations, loading transitions |
| `easing` | [curve] | Default easing function |
[Note any distinctive motion patterns: staggered entrance, parallax, spring physics, scroll-triggered]

## 6. Page Structure

### Header
```
[ element placement diagram ]
height: [value] | position: [sticky/fixed/absolute/static] | bg: [value] | [backdrop-blur if present]
```

### Page Flow

The page has [N] sections in this order:

**1. [Section Name]** [note if section has a tinted/dark background]
- Heading: [word count, size from type scale, alignment]
- Subheading/label: [position relative to heading (above/below), style (uppercase, small, etc.)]
- Body: [sentence count, approximate word count, alignment]
- CTA: [button count, button labels pattern, style variants used]
- Media: [image/video/illustration placement relative to text]
- Layout: [stacked/split/grid], [alignment], max-width: [value if constrained]
- Card pattern: [describe what's inside vs outside the card -- e.g. "image inside, text below"]
- Item count: [how many cards/items in this section]

**2. [Section Name]**
[Same structure. Include every section on the page.]

[Continue for ALL sections...]

### Footer
```
[bg color/style]
[ element placement diagram ]
[column count, link count, content summary]
```

### Layout Patterns
- Content alignment: [centered / left-aligned / mixed -- note which sections differ]
- Content max-width: [value for text-heavy sections like hero, CTA]
- Grid columns: [list each grid and its column count, e.g. "features: 3-col, pricing: 3-col, testimonials: 2-col"]
- Grid responsive behavior: [what column count becomes on mobile]
- Card gaps: [value]
- Section vertical padding: [value or range]
- Section backgrounds: [which sections break from the default bg, and what they use]
- Heading hierarchy: [which type scale role each section heading uses -- e.g. "all section headings use H1 (56px) except component preview which uses H2 (32px)"]

[Detect from DOM tree -- semantic elements (`<nav>`, `<header>`, `<section>`, `<footer>`), grid/flex containers, column counts, heading hierarchy, `text-align`, `max-width` on content wrappers.]

## 7. Components

### Buttons
| Property | Primary | Secondary | Ghost |
|----------|---------|-----------|-------|
| background | `[val]` | `[val]` | `[val]` |
| color | `[val]` | `[val]` | `[val]` |
| padding | `[val]` | `[val]` | `[val]` |
| radius | `[val]` | `[val]` | `[val]` |
| border | `[val]` | `[val]` | `[val]` |
| shadow | `[val]` | `[val]` | `[val]` |

| State | Primary | Secondary |
|-------|---------|----------|
| Hover | [specific CSS changes] | [specific CSS changes] |
| Focus | [focus ring value] | [focus ring value] |

### Inputs
| Property | Value |
|----------|-------|
| border | `[val]` |
| radius | `[val]` |
| padding | `[val]` |
| focus | `[val]` |
| error | [styling] |
| label | [placement and style] |

### Dropdowns
| Property | Value |
|----------|-------|
| background | `[val]` |
| border | `[val]` |
| radius | `[val]` |
| shadow | `[val]` |
| max-height | `[val]` |
| item-padding | `[val]` |
| item-hover | `[val]` |
| item-radius | `[val]` |
| separator | `[val]` |
| animation | [enter/exit behavior] |

### Cards
| Property | Value |
|----------|-------|
| background | `[val]` |
| border | `[val]` |
| radius | `[val]` |
| shadow | `[val]` |
| padding | `[val]` |
| hover | [behavior] |

### Navigation
[Structure, font treatment, active indicator, sticky behavior]

### Links
| Property | Value |
|----------|-------|
| color | `[val]` |
| underline | [always / hover-only / none] |
| hover | [color change, underline, opacity] |
| visited | `[val]` (omit if same as default) |

### Badges / Tags
| Property | Value |
|----------|-------|
| background | `[val]` |
| color | `[val]` |
| padding | `[val]` |
| radius | `[val]` |
| font-size | `[val]` |
| font-weight | `[val]` |
| variants | [list color variants if present: success, warning, danger, neutral] |

### Tabs
| Property | Value |
|----------|-------|
| active-indicator | [underline / background / border -- describe style] |
| active-color | `[val]` |
| inactive-color | `[val]` |
| padding | `[val]` |
| gap | `[val]` |

### Modals / Dialogs
| Property | Value |
|----------|-------|
| backdrop | `[val]` (e.g. rgba overlay, blur) |
| background | `[val]` |
| radius | `[val]` |
| shadow | `[val]` |
| padding | `[val]` |
| max-width | `[val]` |
| animation | [enter/exit behavior] |

### Icons (if identifiable)
[Style: line/filled/duo-tone, stroke weight, size grid, corner style]

### Signature Patterns
[1-3 components unique to this site. The things someone would point at and say "that looks like [site name]." e.g. Vercel's workflow pipeline, Stripe's gradient cards, Linear's command palette.]

## 8. States

| State | Treatment |
|-------|-----------|
| Hover | [What changes: background shift, shadow, scale, underline, etc.] |
| Focus | [Focus ring style: color, offset, width] |
| Active/Pressed | [Scale, color shift] |
| Disabled | [Opacity, color, cursor] |
| Loading | [Skeleton, spinner, shimmer -- what does the site use?] |
| Empty | [How empty states are styled -- illustration, muted text, CTA] |
| Error | [Color, border, icon, message placement] |

## 9. Rules

### Do
- [6-8 specific, actionable rules WITH values]
- [e.g. "Use `#171717` not `#000000` for primary text"]
- [e.g. "Letter-spacing scales with font size: -2.4px at 48px, -0.96px at 24px, normal at 14px"]

### Don't
- [6-8 anti-patterns WITH specifics]
- [e.g. "Don't use weight 700 on body text -- 600 max, headings only"]
- [e.g. "Don't use CSS border on cards -- use shadow-as-border technique"]

### Responsive
- Mobile breakpoint: [value]
- Tablet breakpoint: [value]
- What changes: [2-3 bullets on how the design adapts. Not just "becomes single column" -- does spacing compress? Does type scale shrink? Do components simplify?]
```

## Quality Standards

### Be Specific, Not Generic
Bad: "Uses a clean color palette"
Good: "Near-black (`#171717`) instead of pure black creates micro-contrast softness against the `#ffffff` canvas"

### Include Actual Values
Every color must have a hex code. Every font size must have a pixel/rem value. Every shadow must have the full CSS declaration. Vague descriptions are useless to an AI agent.

### Name Colors Semantically
Don't just list hex codes. Name them by role: "Ship Red", "Console Blue", "Gray 600". The names should communicate function.

### Capture Signature Techniques
Every site has 1-3 things that make it visually distinctive. Shadow-as-border (Vercel). Aggressive negative letter-spacing (Vercel). Gradient mesh backgrounds (Stripe). Find and emphasize these.

### The Do's and Don'ts Must Be Specific
Bad: "Don't use ugly colors"
Good: "Don't use weight 700 (bold) on body text -- 600 is the maximum, used only for headings"

## Handling Edge Cases

### CSS blocked (403/404)
Many CDNs (Stripe, Vercel) block direct stylesheet access. When this happens:
1. Lean heavily on `<style>` blocks in the HTML -- SSR'd sites often inline critical CSS
2. Parse every `style="..."` attribute from the HTML elements
3. Check Google Fonts / Typekit links for exact font info
4. Use `meta[theme-color]` for the brand color
5. Flag in the output that CSS was partially inaccessible

### JS-rendered sites (SPA)
If the initial HTML fetch is sparse (SPA), note this and work with whatever CSS is available. The stylesheets usually contain the full token set even if the HTML is dynamic.

### Sites with multiple themes
If the site has light/dark modes, fill both columns of the Dark Mode table in Section 2. If only one theme is detected, omit the Dark Mode subsection.

### Sites with very complex design systems
Focus on the marketing/landing page, not the product UI. The landing page is what the designer saw and wants to replicate.

### Minimal information available
If CSS extraction is limited, use the HTML structure and inline styles to infer as much as possible. Add the accuracy note at the top of the file. Never silently fill gaps with guesses -- be transparent.

## After Generation

Place the file at the project root as `DESIGN.md`. Then generate two companion files automatically:

### 1. Tailwind Config Extension

Create or update `tailwind.config.ts` (or the equivalent) with the extracted tokens mapped to Tailwind's theme:

```ts
// Auto-generated from DESIGN.md
theme: {
  extend: {
    colors: {
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(245, 245, 245)',
      'text-primary': 'rgb(20, 20, 20)',
      'text-secondary': 'rgb(112, 112, 112)',
      'text-tertiary': 'rgb(173, 173, 173)',
      accent: '#635bff',
      border: 'rgb(237, 237, 237)',
      // ... all extracted color tokens
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '24px',
      xl: '28px',
      full: '9999px',
    },
    boxShadow: {
      ring: 'inset 0 0 0 1px rgba(64, 64, 64, 0.16)',
      low: '0 1px 2px rgba(0, 0, 0, 0.04)',
      // ... all extracted shadows
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
  },
}
```

This lets the agent write `bg-background`, `text-text-primary`, `rounded-md`, `shadow-ring` instead of hardcoding values everywhere. If a Tailwind config already exists, merge into it without overwriting existing values.

### 2. CSS Variables

Add to `globals.css` (or the project's main CSS file):

```css
:root {
  --background: rgb(255, 255, 255);
  --surface: rgb(245, 245, 245);
  --text-primary: rgb(20, 20, 20);
  --text-secondary: rgb(112, 112, 112);
  --border: rgb(237, 237, 237);
  --accent: #635bff;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 24px;
  --shadow-ring: inset 0 0 0 1px rgba(64, 64, 64, 0.16);
  /* ... all extracted tokens */
}
```

If the file already has `:root` variables, merge without overwriting.

### After creating all files, say:
- "Your design reference is ready. Tailwind config and CSS variables are set up. Any page you build now follows [site name]'s style."

Do not explain every section. The designer doesn't need a walkthrough.

## What Not To Do

- Do not ask which sections to include -- generate all 9
- Do not generate a partial file and ask if they want more
- Do not copy copyrighted content (logos, illustrations, copy text) -- only extract visual tokens
- Do not require any tools beyond web fetching -- no browser automation, no Figma, no screenshots
- Do not use emoji or em dash in generated copy
- Do not lecture about design systems or the DESIGN.md format
- Do not generate preview HTML files unless explicitly asked

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
5. Write a DESIGN.md in our 8-section format (optimized for AI agents, not human essays)
6. Drop it in the project root

One command. No questions. The output is a markdown file, not code.

## When To Use

- "I like how linear.app looks -- capture that"
- "Generate a design md from stripe.com"
- "Make my app look like this site"
- "Use vercel.com as a design reference"
- "Grab the design from notion.so"
- "Copy the style of airbnb.com"

## Extraction Process

### Step 1: Fetch

Fetch the target URL's HTML. Then fetch every linked stylesheet (`<link rel="stylesheet">`). Also extract inline `<style>` blocks. If the site uses CSS custom properties (variables), capture the full `:root` or `[data-theme]` block.

### Step 2: Extract Raw Tokens

Pull these from the collected CSS:

| What | Where to look |
|---|---|
| Colors | CSS custom properties, `color`, `background-color`, `border-color`, `fill`, `box-shadow` color values |
| Fonts | `font-family`, `@font-face`, Google Fonts / Typekit links |
| Type scale | `font-size`, `font-weight`, `line-height`, `letter-spacing` across selectors |
| Spacing | `padding`, `margin`, `gap` values -- find the repeating scale |
| Radii | `border-radius` values across components |
| Shadows | `box-shadow` declarations -- note the layering patterns |
| Borders | `border` shorthand and individual properties |
| Transitions | `transition`, `animation` properties |

### Step 3: Analyze Patterns

From the raw tokens, identify:
- **Color roles**: Which color is background? Primary text? Accent? Secondary text? Border?
- **Type hierarchy**: What's the display size? Heading? Body? Caption? What weights are used?
- **Spacing rhythm**: Is it 4px-based? 8px-based? What's the scale?
- **Component signatures**: How do buttons look? Cards? Inputs? Navigation?
- **Shadow philosophy**: Flat? Subtle elevation? Heavy depth? Shadow-as-border?
- **Shape language**: Sharp corners? Rounded? Pills? Mixed?

### Step 4: Interpret the Atmosphere

Read the design decisions as a whole. What does this site feel like?
- Dense or spacious?
- Technical or friendly?
- Dark or light?
- Minimal or rich?
- Corporate or playful?

Write this as a short, opinionated paragraph -- not a list of CSS values.

## Output Format

The DESIGN.md follows an 8-section structure optimized for AI agents. Every section earns its place -- no redundancy, no prose padding.

```markdown
# DESIGN.md -- [Site Name]

## 1. Identity

**In one line:** [Single sentence capturing the visual personality -- what a designer would say after 5 seconds on the site.]

**Signature Techniques:**
- [3-5 bullets. Only the things that make THIS site look different from others. Not generic traits like "uses whitespace." Specific moves: "shadow-as-border via `box-shadow: 0 0 0 1px`", "negative letter-spacing at display sizes (-2.4px)", "gradient mesh hero backgrounds".]

## 2. Color

### Palette
| Token | Value | Role |
|-------|-------|------|
| `background` | `#hex` | Page canvas |
| `surface` | `#hex` | Cards, panels, elevated containers |
| `text-primary` | `#hex` | Headings, body text |
| `text-secondary` | `#hex` | Descriptions, muted copy |
| `text-tertiary` | `#hex` | Placeholder, disabled, metadata |
| `accent` | `#hex` | Primary brand action, links |
| `accent-hover` | `#hex` | Accent hover state |
| `border` | `#hex` or `rgba()` | Dividers, card edges, input borders |
| `border-subtle` | `#hex` or `rgba()` | Lighter separator lines |
| `success` | `#hex` | Confirmation, positive states |
| `warning` | `#hex` | Caution states |
| `danger` | `#hex` | Error, destructive actions |
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
| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display | [px/rem] | [number] | [value] | [value] |
| H1 | [px/rem] | [number] | [value] | [value] |
| H2 | [px/rem] | [number] | [value] | [value] |
| H3 | [px/rem] | [number] | [value] | [value] |
| Body | [px/rem] | [number] | [value] | [value] |
| Body Small | [px/rem] | [number] | [value] | [value] |
| Caption | [px/rem] | [number] | [value] | [value] |
| Code | [px/rem] | [number] | [value] | [value] |

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
| Token | Value | Used on |
|-------|-------|---------|
| `radius-sm` | [px] | [inputs, inline code] |
| `radius-md` | [px] | [buttons, cards] |
| `radius-lg` | [px] | [modals, hero cards] |
| `radius-full` | [px/9999px] | [badges, pills, avatars] |

## 5. Depth & Motion

### Elevation
| Level | Shadow Value | Use |
|-------|-------------|-----|
| Flat | none | Page background |
| Low | `[full CSS]` | Cards, containers |
| Mid | `[full CSS]` | Dropdowns, popovers |
| High | `[full CSS]` | Modals, dialogs |
[Include any distinctive techniques: shadow-as-border, backdrop-blur, glassmorphism, gradient overlays, inner glows]

### Motion
| Property | Value | Use |
|----------|-------|-----|
| `duration-fast` | [ms] | Hover, toggle, micro-interactions |
| `duration-base` | [ms] | Page transitions, panel open/close |
| `duration-slow` | [ms] | Entrance animations, loading transitions |
| `easing` | [curve] | Default easing function |
[Note any distinctive motion patterns: staggered entrance, parallax, spring physics, scroll-triggered]

## 6. Components

### Buttons
**Primary:** `background: [val]` `color: [val]` `padding: [val]` `radius: [val]` `shadow: [val]`
**Secondary:** [same format]
**Ghost:** [same format]
**Hover/Focus:** [what changes on interaction -- be specific about the CSS, not just "darkens"]

### Cards
`background: [val]` `border: [val]` `radius: [val]` `shadow: [val]` `padding: [val]`
Hover: [behavior]

### Inputs
`border: [val]` `radius: [val]` `padding: [val]` `focus: [val]`
Error: [styling]
Label: [placement and style]

### Navigation
[Structure, font treatment, active indicator, sticky behavior]

### Icons (if identifiable)
[Style: line/filled/duo-tone, stroke weight, size grid, corner style]

### Signature Patterns
[1-3 components unique to this site. The things someone would point at and say "that looks like [site name]." e.g. Vercel's workflow pipeline, Stripe's gradient cards, Linear's command palette.]

## 7. States

| State | Treatment |
|-------|-----------|
| Hover | [What changes: background shift, shadow, scale, underline, etc.] |
| Focus | [Focus ring style: color, offset, width] |
| Active/Pressed | [Scale, color shift] |
| Disabled | [Opacity, color, cursor] |
| Loading | [Skeleton, spinner, shimmer -- what does the site use?] |
| Empty | [How empty states are styled -- illustration, muted text, CTA] |
| Error | [Color, border, icon, message placement] |

## 8. Rules

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

### JS-rendered sites
If the initial HTML fetch is sparse (SPA), note this and work with whatever CSS is available. The stylesheets usually contain the full token set even if the HTML is dynamic.

### Sites with multiple themes
If the site has light/dark modes, fill both columns of the Dark Mode table in Section 2. If only one theme is detected, omit the Dark Mode subsection.

### Sites with very complex design systems
Focus on the marketing/landing page, not the product UI. The landing page is what the designer saw and wants to replicate.

### Minimal information available
If CSS extraction is limited, use the HTML structure and inline styles to infer as much as possible. Be transparent about what was inferred vs. extracted.

## After Generation

Place the file at the project root as `DESIGN.md`. Say something like:
- "Your design reference is ready. Any page you build now will follow [site name]'s visual style."
- "Captured [site name]'s design. Colors, type, spacing, components -- it's all in DESIGN.md."

Do not explain every section. The designer doesn't need a walkthrough of what a DESIGN.md is.

## What Not To Do

- Do not ask which sections to include -- generate all 8
- Do not generate a partial file and ask if they want more
- Do not copy copyrighted content (logos, illustrations, copy text) -- only extract visual tokens
- Do not require any tools beyond web fetching -- no browser automation, no Figma, no screenshots
- Do not use emoji or em dash in generated copy
- Do not lecture about design systems or the DESIGN.md format
- Do not generate preview HTML files unless explicitly asked

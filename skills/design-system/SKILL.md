---
name: design-system
description: "Makes your app's styles consistent. Extracts your current look into reusable tokens and components. Triggers: 'design system', 'set up tokens', 'make styles consistent', 'standardize styles', 'set up a design system', 'make it all match', 'create components from my styles'."
---

# Design System

Makes your app look consistent everywhere. Pulls the visual style from what you already built and turns it into reusable pieces.

## How It Works

One pass. Not a multi-step project.

1. Scan existing pages for repeated visual patterns
2. Extract them into named tokens (colors, sizes, spacing, shapes, shadows)
3. Generate primitive components wired to those tokens
4. Apply them in place so nothing looks different yet, but everything is now reusable
5. Show the result

If no pages exist yet, start from smart defaults that look like a real product.

## When To Use

- "Set up a design system"
- "Make styles consistent"
- "Make it all match"
- "Set up tokens"
- "Create components from my styles"
- "Standardize this"

## Starting Point

### If `DESIGN.md` exists
Use it as the source of truth. Extract tokens directly from the DESIGN.md file -- colors, type scale, spacing, radii, shadows, motion. Map them to the token names below and generate primitives wired to those values. Do not re-extract from the existing UI. DESIGN.md wins.

### If pages already exist (no DESIGN.md)
Extract tokens from the current UI. Preserve the existing look. The system should formalize what's already there, not redesign it.

### If no pages exist yet (no DESIGN.md)
Generate a neutral, modern token set with good defaults:
- Clean type scale, comfortable spacing, subtle shadows, accessible contrast
- Feels like a real product out of the box

Use Material Design 3 as the internal reference for token categories, component patterns, and accessibility defaults. Never mention "Material" to the user. They just get a clean, modern system.

## Token Names

Use simple names designers already know. Not spec jargon.

| Category | Tokens |
|---|---|
| Color | `background`, `text`, `muted`, `accent`, `border`, `success`, `warning`, `danger` |
| Typography | font family, sizes (`text-sm` through `text-4xl`), weights, line heights |
| Spacing | `space-1` through `space-8` (tight to wide) |
| Radius | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full` |
| Shadow | `shadow-sm`, `shadow-md`, `shadow-lg` |
| Motion | `duration-fast`, `duration-base`, `duration-slow` + easing |

## Primitive Components

Generate these 6 components, each wired to tokens:

1. **Button** -- filled, outlined, ghost variants + sizes (sm/md/lg) + states (hover/focus/disabled/loading)
2. **Input** -- with label, error state, disabled state
3. **Textarea** -- same states as Input
4. **Select** -- dropdown with consistent styling
5. **Card** -- container with consistent padding, radius, shadow
6. **Alert** -- info/success/warning/danger tones

Every primitive must include:
- Visible focus state (not browser default)
- Contrast-safe text colors
- Hover and disabled states where relevant

## Personality Adjustments

After the system exists, the designer can shift the whole feel with plain English:

| They say | What changes |
|---|---|
| "Make it warmer" | Shift palette toward warm neutrals, amber/orange accents |
| "More playful" | Increase border radius, add bounce easing, brighter accent |
| "More minimal" | Reduce shadow depth, tighten spacing, mute accent |
| "Bolder" | Increase heading weight/size contrast, stronger shadows, saturated accent |
| "More corporate" | Cool neutrals, tighter type scale, sharper corners |
| "Softer" | Larger radius, lighter shadows, more whitespace |

Each adjustment shifts the full token set at once. Never ask which individual token to change.

## Rules (Applied Automatically)

After generating the system, enforce these going forward:
1. No raw color values outside token definitions
2. Use spacing scale only (no arbitrary pixel values)
3. All interactive elements must have visible focus states
4. Text must meet minimum contrast (4.5:1 for body, 3:1 for large)
5. Use primitives for common UI patterns instead of rebuilding from scratch

Do not lecture about rules. Just follow them silently when building new pages.

## Output

After applying, say something short like:
- "Your styles are now consistent across all pages. 6 reusable components are ready."
- "Everything matches now. Future pages will stay consistent automatically."

Do not list every token or every file changed.

## What Not To Do

- Do not redesign the app when extracting a system
- Do not show Material Design terminology to the user
- Do not require Figma
- Do not ask which tokens to create -- just create them all
- Do not make it a multi-session project -- do it in one pass
- Do not use emoji or em dash in generated copy

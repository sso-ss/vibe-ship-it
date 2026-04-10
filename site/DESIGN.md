# DESIGN.md: vibe-ship-it

<!-- extraction-meta
date: 2026-04-09
confidence: { extracted: 95%, inferred: 5% }
-->

## 1. Identity

**In one line:** Spacious, monochrome, content-as-color. Gray card containers with large rounded corners, massive section spacing, and text that sits below cards rather than inside them.

**Signature Techniques:**
- Cards are gray containers (\`rgba(64,64,64,0.06)\`) with 24px radius, no border, no shadow. Content (title + description) lives BELOW the card, not inside
- 120px vertical padding between sections creates a breathing, editorial feel
- Section headings are 56px, centered, with tight letter-spacing
- Pill buttons (9999px) in near-black (\`rgb(20,20,20)\`) with white text
- Frosted gray header (\`rgba(237,237,237,0.72)\`) with backdrop-blur
- Dark footer (\`rgb(20,20,20)\`) with 4-column link layout
- Primary font: Inter

## 2. Color

### Palette
| Token | Value | Role |
|-------|-------|------|
| \`background-primary\` | \`hsl(0 0% 100%)\` | Page canvas |
| \`background-card\` | \`rgba(64,64,64,0.06)\` | Card/container fill (subtle gray) |
| \`background-inverse\` | \`rgb(20,20,20)\` | Buttons, dark panels, footer |
| \`background-inverse-hover\` | \`rgb(50,50,50)\` | Button hover |
| \`text-primary\` | \`rgb(20,20,20)\` | Headings, body text |
| \`text-secondary\` | \`rgb(112,112,112)\` | Descriptions, muted copy |
| \`text-tertiary\` | \`rgb(173,173,173)\` | Placeholder, metadata |
| \`text-inverse\` | \`rgb(255,255,255)\` | Text on dark backgrounds |
| \`border-divider\` | \`rgb(237,237,237)\` | Section dividers |
| \`header-bg\` | \`rgba(237,237,237,0.72)\` | Frosted header bar |
| \`footer-bg\` | \`rgb(20,20,20)\` | Footer background |

## 3. Typography

### Fonts
- **Primary:** Inter, sans-serif
- **Mono:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

### Scale
| Role | Size | Weight | Letter Spacing |
|------|------|--------|----------------|
| Display | 80px | 600 | -5px |
| H1 | 56px | 600 | -3px |
| H2 | 32px | 600 | -0.6px |
| H3 | 24px | 600 | -0.4px |
| Body | 16px | 400 | 0 |
| Body Small | 14px | 400 | 0 |
| Caption | 12px | 500 | 0.2px |

## 4. Spacing & Layout

### Base Unit
4px grid. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 120.

### Container
- Max content width: 1280px
- Page padding: 16px (mobile) / 32px (desktop)
- Section vertical padding: 120px top, 116px bottom (large sections)
- Compact section padding: 64px / 80px

### Border Radius
| Token | Value | Use |
|-------|-------|-----|
| \`radius-md\` | 16px | Smaller cards |
| \`radius-lg\` | 24px | Feature cards, containers |
| \`radius-full\` | 9999px | Buttons, pills, tags |

## 5. Depth & Motion

### Shadows
| Level | Value | Use |
|-------|-------|-----|
| None | none | Cards (no shadow, use bg color instead) |
| Dropdown | \`0 8px 24px hsl(0 0% 0%/12%)\` | Dropdown menus |

### Motion
| Property | Value |
|----------|-------|
| \`duration-base\` | 200ms |

## 6. Page Structure

### Header
\`\`\`
[ Logo (left) ] [ nav links (center) ] [ CTA pill (right) ]
height: 60px | position: absolute | bg: rgba(237,237,237,0.72) | backdrop-blur
\`\`\`

### Page Flow
The page has 9 sections in this order:

**1. Hero**
- Heading: [short punchy headline, ~6 words, 80px, centered]
- Subheading: [label above, uppercase, ~3 words]
- Body: [2 sentences, ~25 words, centered]
- CTA: [2-word action pill] + [terminal command in gray pill]
- Media: none
- Layout: stacked, centered, max-width: 720px
- Item count: n/a

**2. Metrics**
- Layout: 4 stats in a row, centered
- Border: top and bottom divider
- Item count: 4

**3. How it works**
- Heading: [medium, ~5 words, 56px, centered]
- Subheading: [label above, uppercase]
- Body: [1 sentence, ~15 words]
- Layout: 2-column grid, centered
- Card pattern: gray bg container (visual area) + text BELOW
- Item count: 8 cards

**4. Skills**
- Heading: [medium, ~6 words, 56px, centered]
- Body: [1 sentence, ~10 words]
- Layout: 3-column grid (responsive), centered
- Card pattern: gray bg + monospace name below
- Item count: 14 cards

**5. Agents**
- Heading: [medium, ~5 words, 56px, centered]
- Body: [2 sentences, ~20 words]
- Layout: 2-column grid, centered
- Card pattern: gray bg container + name/description below
- Item count: 4 cards

**6. Component Preview** (bg: slightly tinted)
- Heading: [medium, ~5 words]
- Layout: 3-column (buttons, dropdown, card), centered
- Item count: 3 previews

**7. Demo**
- Heading: [medium, ~6 words, 56px, centered]
- Body: [2 sentences, ~25 words, centered]
- CTA: URL input + action button
- Layout: stacked, centered

**8. Platforms**
- Heading: [short, ~5 words, 56px, centered]
- Layout: 3-column grid, centered
- Card pattern: gray bg + name/stack/description below
- Item count: 3 cards

**9. CTA**
- Heading: [short punchy, ~5 words, centered]
- Body: [1 sentence, ~18 words, centered]
- CTA: [command pill] + [2 action pills]
- Layout: stacked, centered

### Footer
\`\`\`
Dark background (rgb(20,20,20))
[ Logo ] [ Column 1 ] [ Column 2 ] [ Column 3 ] [ Column 4 ]
white text, 16 links
\`\`\`

### Layout Patterns
- Content alignment: centered throughout (all section headings, body, CTAs)
- Content max-width: 720px for text-heavy sections (hero, demo, CTA)
- Grid columns: How it works 2-col, Skills 3-col, Agents 2-col, Component Preview 3-col, Platforms 3-col
- Grid responsive behavior: all grids collapse to 1-col on mobile
- Card gaps: 16px
- Section vertical padding: 120px (major sections), 64px/80px (compact)
- Section backgrounds: all white except Component Preview (slightly tinted)
- Heading hierarchy: all section headings use H1 (56px) except Hero (Display 80px) and Component Preview (H2 32px)

## 7. Components

### Buttons
| Property | Primary | Secondary |
|----------|---------|-----------|
| background | \`rgb(20,20,20)\` | \`rgba(64,64,64,0.06)\` |
| color | \`rgb(255,255,255)\` | \`rgb(20,20,20)\` |
| padding | 12px 24px | 12px 24px |
| radius | 9999px | 9999px |
| border | none | none |
| font-weight | 600 | 400 |
| hover | lighten to rgb(50,50,50) | darken bg slightly |

### Inputs
| Property | Value |
|----------|-------|
| radius | 9999px (pill) |
| padding | 12px 20px |
| border | \`rgba(64,64,64,0.06)\` |

### Dropdowns
| Property | Value |
|----------|-------|
| background | white |
| border | \`rgb(237,237,237)\` |
| radius | 12px |
| shadow | \`0 8px 24px hsl(0 0% 0%/12%)\` |
| item-padding | 8px 12px |

### Cards
| Property | Value |
|----------|-------|
| background | \`rgba(64,64,64,0.06)\` (subtle gray) |
| border | none |
| shadow | none |
| radius | 24px (large) or 16px (small) |
| padding | 0px (content sits below, not inside) |
| hover | bg darkens slightly |
| text position | BELOW the card, not inside |

### Navigation
\`\`\`
[ Logo ] [ links ] [ CTA pill ]
absolute | bg: rgba(237,237,237,0.72) + blur | h: 60px
\`\`\`

### Badges / Tags
| Property | Value |
|----------|-------|
| background | \`rgba(64,64,64,0.06)\` |
| color | \`rgb(20,20,20)\` |
| padding | 4px 12px |
| radius | 9999px |
| font-size | 12px |
| font-weight | 500 |

### Tabs
| Property | Value |
|----------|-------|
| active-indicator | underline, 2px solid \`rgb(20,20,20)\` |
| active-color | \`rgb(20,20,20)\` |
| inactive-color | \`rgb(112,112,112)\` |
| padding | 8px 16px |
| gap | 4px |

### Signature Patterns
- Cards with text BELOW instead of inside: the defining visual move. Gray container is purely visual, all content (title, description) sits underneath
- Pill-shaped everything: buttons, inputs, tags all use 9999px radius
- Monochrome palette with content-as-color: screenshots and previews inside cards provide all the color on the page

## 8. States

| State | Treatment |
|-------|-----------|
| Hover | Background darkens slightly. No shadow lift. |
| Focus | Dark ring, 2px |
| Active | scale(0.97) |
| Disabled | opacity: 0.5, cursor: not-allowed |
| Loading | Subtle shimmer on card backgrounds |
| Empty | Muted text centered with soft gray icon |
| Error | \`rgb(220, 38, 38)\` border + text below input |

## 9. Rules

### Do
- Use \`rgb(20,20,20)\` for text, never pure black
- Use \`rgba(64,64,64,0.06)\` for card backgrounds (subtle gray)
- Use 24px radius on cards, 9999px on buttons
- Put card text content BELOW the card container, not inside
- Use 120px vertical padding between major sections
- Center section headings at 56px
- Keep all chrome monochrome

### Don't
- Don't put borders or shadows on cards
- Don't put text content inside card containers (text goes below)
- Don't use small spacing between sections (minimum 80px)
- Don't use font weights above 600
- Don't use pure black or pure white for text
- Don't add elevation on hover

### Responsive
- Mobile: single column, 16px padding, 52px nav
- Desktop: multi-column grids, 32px padding, 60px nav
- Display scales from 80px to 40px on mobile

---

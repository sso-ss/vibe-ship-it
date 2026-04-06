---
name: make-it-wow
description: "Instant visual polish. Makes your site look premium with animations, better typography, and modern effects. Triggers: 'make it look better', 'make it wow', 'polish', 'make it premium', 'it looks boring', 'more animation', 'make it pop', 'spice it up', 'make it cool', 'fancy', 'sleek', 'modern', 'upgrade the design', 'too plain', 'needs more life'."
---

# Make It Wow

Applies opinionated visual upgrades to make the site look premium. No configuration, no questions. Just make it look better, immediately.

## How It Works

When triggered, scan the current page and apply upgrades from these categories. Don't ask which ones — apply all that make sense for the current content.

## Upgrade Categories

### 1. Smooth Scroll
Add document-level smooth scrolling:
```css
html { scroll-behavior: smooth; }
```

### 2. Page Entrance Animation
Add fade-in + slide-up to main content sections on page load:

For Next.js with Tailwind — use CSS animations:
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

Apply staggered delays to sections for a cascading reveal effect.

If Framer Motion is available or appropriate to install:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

### 3. Typography Upgrade
- Headlines: increase contrast between heading and body sizes
- Use `font-semibold` or `font-bold` on headings, `font-normal` on body
- Add `tracking-tight` to large headings
- Ensure line-height is relaxed on body text (`leading-relaxed`)
- If the site uses only system font, consider adding Inter or a personality font

### 4. Hover States
Add hover effects to all interactive elements:
- Buttons: subtle scale + shadow lift
  ```
  hover:scale-[1.02] hover:shadow-lg transition-all duration-200
  ```
- Cards: lift effect
  ```
  hover:-translate-y-1 hover:shadow-xl transition-all duration-300
  ```
- Links: color transition
  ```
  hover:text-[accent-color] transition-colors duration-200
  ```
- Images: subtle zoom
  ```
  hover:scale-105 transition-transform duration-500 overflow-hidden
  ```

### 5. Gradient & Color Depth
- Replace flat backgrounds with subtle gradients
- Add depth with layered backgrounds
- Use accent color consistently across CTAs, links, and highlights
- Dark sections alternating with light sections for visual rhythm

### 6. Spacing & White Space
- Increase section padding if too tight
- Add more vertical space between sections (`py-20 md:py-32`)
- Ensure content doesn't touch edges on any screen size
- Use `max-w` constraints to keep text readable

### 7. Scroll Reveal (Optional)
For longer pages, add intersection observer to fade in sections as user scrolls. Only if the page has 3+ sections.

CSS + JS approach (no library needed):
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 8. Micro-Details
- Add `rounded-2xl` to cards (softer than `rounded-lg`)
- Subtle border: `border border-gray-100` on light cards
- Background texture: very subtle noise or gradient overlay
- Focus states: visible and styled, not default browser outline
- Selection color: match accent color

## Performance Rules

NEVER violate these:
- Only animate `transform` and `opacity` (never `width`, `height`, `margin`, `top`)
- Wrap continuous animations in `@media (prefers-reduced-motion: no-preference)`
- Add `will-change: transform` only during animation, remove after
- Wrap hover animations in `@media (hover: hover)` to skip touch devices
- Keep total animation CSS under 5KB

## Application Process

1. Scan current page
2. Identify which upgrades apply (don't add scroll reveal to a single-section page)
3. Apply all applicable upgrades
4. Show the result: "Check your browser — added smooth animations, hover effects, and better typography."
5. Don't list every CSS change. Just show the before/after feeling.

## What NOT To Do

- Don't ask "which style would you prefer?" — just pick one and commit
- Don't add 3D effects, parallax, or WebGL unless specifically asked
- Don't change the layout — only enhance the existing design
- Don't change colors dramatically — enhance what's there
- Don't add sound effects (ever)
- Don't add loading spinners where none are needed

---
name: build-page
description: "Builds UI from descriptions, screenshots, or Figma designs. Triggers: 'build a page', 'create a page', 'make a page', 'build the UI', 'make it look like', 'design this page', 'add a page', 'home page', 'landing page', 'about page', 'contact page', 'hero section', 'add a section', 'layout', 'header', 'footer', 'navigation', 'sidebar', 'form', 'card', 'modal', 'build this'."
---

# Build Page

Turns descriptions, screenshots, or Figma designs into working UI. The designer's primary creative tool.

## Input Types

### 1. Text Description
> "I want a landing page with a big headline, some portfolio images in a grid, and a contact form at the bottom"

→ Decompose into sections, generate each, preview immediately.

### 2. Screenshot / Image
> *pastes or uploads an image*

→ Analyze the layout, colors, typography, and spacing. Reproduce as closely as possible. Ask: "Does this match? What should change?"

### 3. Figma Reference
> "Here's my Figma design" / provides a Figma link

→ If Figma MCP is available, pull design data directly. Otherwise, ask them to screenshot the specific frame.

### 4. Vague Request
> "make me a website"

→ Don't ask 10 questions. Pick a sensible default (clean landing page with hero, features section, CTA), build it, show it. They'll tell you what to change.

## Build Process

### Step 1: Decompose
Break the page into sections mentally. Don't show the decomposition to the designer — just build.

Typical page anatomy:
- Navigation (header)
- Hero section (headline + CTA)
- Content sections (features, portfolio, testimonials, etc.)
- Forms (contact, signup, booking)
- Footer

### Step 2: Generate
Build the full page in one go. Use:
- Tailwind CSS for all styling
- Semantic HTML
- Good defaults: comfortable spacing, readable typography, balanced proportions
- Real-looking placeholder content (not "Lorem ipsum" — use realistic copy)

### Step 3: Preview
Ensure dev server is running. Tell the designer:
> "Check your browser — here's what it looks like."

### Step 4: Iterate
Wait for feedback. Common responses and what to do:

| They say | They mean | Do |
|---|---|---|
| "Perfect!" | Done | Move on |
| "Close but..." | Needs tweaks | Ask what specifically |
| "The spacing feels off" | Padding/margin/gap issue | Adjust spacing, show again |
| "Too much text" | Content is overwhelming | Reduce copy, increase white space |
| "Make it more [adjective]" | Aesthetic change | Apply the vibe (see adjective table below) |
| "Like [reference site]" | Match an external reference | Analyze the reference, adapt to their content |

### Adjective Translation Table

| They say | They mean | You do |
|---|---|---|
| "Modern" | Clean lines, lots of white space, sans-serif | Inter/system font, minimal borders, generous padding |
| "Bold" | Strong colors, large typography | Increase heading size, use black/bright accent |
| "Minimal" | Less is more, lots of breathing room | Remove visual noise, increase white space, fewer elements |
| "Fun" | Playful colors, rounded corners, casual | Rounded-xl, bright palette, informal copy |
| "Professional" | Corporate, trustworthy, serious | Neutral palette, geometric, structured grid |
| "Luxury" / "Premium" | Elegant, expensive-feeling | Dark background, gold/muted accents, serif headings, generous spacing |
| "Warm" | Inviting, comfortable | Warm color palette (amber, terracotta), organic shapes, soft shadows |
| "Techy" | Developer/startup vibe | Dark mode, monospace accents, neon accents, code-like elements |
| "Friendly" | Approachable, human | Rounded shapes, illustrations, conversational copy |

## Component Library

When building, prefer these patterns:

### Navigation
```
Sticky header, logo left, links right, mobile hamburger menu.
Simple — no mega-menus unless asked.
```

### Hero Section
```
Full-width, large headline (text-5xl to text-7xl), 
subtitle underneath, one prominent CTA button.
Optional: background image or gradient.
```

### Feature Grid
```
3-column grid (responsive to single column on mobile).
Icon or image + heading + short description per card.
```

### Contact Form
```
Name, email, message fields. 
Single "Send" button.
Clean layout, clear labels.
Connect to save-data skill when they say "make it work."
```

### Footer
```
Logo, key links, copyright.
Keep it simple — designers rarely care about the footer first.
```

## Visual Defaults

**If `DESIGN.md` exists in the project root, use it.** Pull every color, font, size, spacing value, radius, shadow, and motion token from the file. Do not invent values that DESIGN.md already defines. Skip the defaults below -- DESIGN.md overrides all of them.

**If no `DESIGN.md` exists,** apply these defaults:
- Font: system font stack or Inter
- Heading sizes: responsive using `text-3xl md:text-5xl lg:text-7xl`
- Body text: `text-base` or `text-lg`, line-height relaxed
- Spacing: generous (`py-16 md:py-24` between sections)
- Colors: start with neutral palette + one accent color
- Border radius: `rounded-lg` or `rounded-xl` (not square, not full circle)
- Shadows: subtle (`shadow-sm` or `shadow-md`), never harsh
- Max width: content constrained with `max-w-7xl mx-auto`
- Padding: `px-4 md:px-8` for horizontal padding

## Critical Rules

1. **Never generate ugly starter code.** Every page should look like a real product from the first render.
2. **Use realistic placeholder content.** "Sarah Chen, UX Designer" not "John Doe, Lorem Ipsum."
3. **Mobile-first.** Build for phone first, then make it nice on desktop.
4. **Show, don't tell.** After building, say "Check your browser" — don't describe what the CSS does.
5. **One page at a time.** Don't scaffold 5 empty pages. Build the one they're talking about fully, then move to the next.

## After Building

Update the **Pages** section in `PROJECT.md` with the new page and its route. Create `PROJECT.md` if it doesn't exist.

## Platform-Specific

### Mobile (Expo)
- Use React Native components (`View`, `Text`, `Pressable`) instead of HTML
- Use `StyleSheet.create()` or NativeWind for styling — no raw Tailwind
- Navigation uses Expo Router (`app/` folder, same file-based pattern as Next.js)
- No `<img>` — use `<Image source={...} />` from react-native
- Think in screens, not pages. Each screen fills the phone
- Test by saying: "Scan the QR code with Expo Go on your phone"

### Figma Plugin
- UI lives in `ui.html` — plain HTML/CSS/JS in an iframe
- Keep the UI small and focused (Figma panels are narrow)
- Match Figma's design language: 13px font, Inter, #18A0FB accent, 8px padding
- No React, no framework — keep it simple vanilla HTML
- Canvas manipulation goes in `code.ts`, not in the UI

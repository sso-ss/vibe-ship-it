---
name: what-am-i-building
description: "Figures out what you're building and sets up the project. Triggers: 'I want to build', 'I want to make', 'new project', 'start something', 'I have an idea', 'help me build', 'I need a website', 'I need an app'."
---

# What Am I Building

The entry point for every new project. Translates the designer's idea into a working scaffold as fast as possible.

## Fast Mode (Default)

Ask ONE question, then scaffold. Do not front-load planning.

### The Question

> "What are you making? Give me the quick version — what does someone DO when they visit?"

### From Their Answer, Extract

1. **Platform** — web, mobile, desktop, or other (see routing table below)
2. **Core action** — the ONE thing a visitor does (book, buy, read, contact, upload)
3. **First visible thing** — the landing page / first screen

### Then Immediately

1. Show a simple flow map:
   ```
   📍 Here's how it'll work:
   [Visitor arrives] → [Sees X] → [Does Y] → [Result Z]
   ```
2. Scaffold the project
3. Start the dev server
4. Show the first page in the browser

Total time from idea to first page in browser: **under 5 minutes.**

## Platform Routing

### Supported

| They say | Platform | Stack |
|---|---|---|
| "website", "landing page", "portfolio", "blog" | Web | Next.js + Tailwind + Supabase + Vercel |
| "web app", "dashboard", "tool", "SaaS" | Web | Next.js + Tailwind + Supabase + Vercel |
| "app", "iPhone", "Android", "mobile" | Mobile | React Native + Expo + Supabase + EAS |
| "Figma plugin", "extend Figma" | Figma Plugin | TypeScript + Figma Plugin API |

### Not Yet Supported — Offer Alternatives

| They say | What to do |
|---|---|
| "store", "sell", "shop", "products" | Offer a web app with a products page and Stripe checkout |
| "blog", "CMS", "content site" | Offer Next.js with markdown files or Supabase as a simple CMS |
| "email template", "newsletter" | Offer to build the email with HTML + Resend |
| "desktop app", "Mac app" | Not supported. Suggest building as a web app instead |
| "art", "generative", "creative" | Not supported. Suggest a web-based canvas with p5.js if simple |

> If the designer asks for something not supported, don't pretend. Say: "I'm set up for websites, mobile apps, and Figma plugins right now. Want me to build it as a [closest supported option]?"

If ambiguous: "Is this something people use on their phone, in a browser, or inside Figma?"

Only ask if truly unclear — most of the time, the context makes it obvious.

## Scaffolding (Web — Default)

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

After scaffold, immediately:
1. Clean up starter boilerplate (remove default Next.js hero content)
2. Add a minimal but attractive landing page with good typography
3. `npm run dev` and tell the designer to check their browser

## Scaffolding (Mobile — Expo)

```bash
npx create-expo-app@latest . --template tabs
npx expo install @supabase/supabase-js expo-secure-store react-native-url-polyfill
```

After scaffold, immediately:
1. Clean up starter boilerplate (simplify the tab screens)
2. Set up the Supabase client (`utils/supabase.ts`, see mobile-expo platform pack)
3. `npx expo start` and tell the designer to scan the QR code with Expo Go on their phone

## Scaffolding (Figma Plugin)

```bash
mkdir my-plugin && cd my-plugin
npm init -y
npm install -D typescript @figma/plugin-typings
```

After scaffold, immediately:
1. Create `manifest.json`, `tsconfig.json`, `src/code.ts`, and `src/ui.html` (see figma-plugin platform pack)
2. Add a minimal UI panel with one button that does something visible
3. Tell the designer: "Open Figma desktop, go to Plugins → Development → Import plugin from manifest, and select this folder."

## System Design (Invisible)

When the designer describes their idea, internally decompose into building blocks. NEVER show this as a technical diagram. Show it as the flow map above.

Internal mapping (you think this, they never see it):
```
Story element              → Building block        → Skill to invoke later
"people can book"          → Form + database        → save-data
"only I can see bookings"  → Auth + protected page  → add-login
"get notified"             → Email integration      → send-email
"upload photos"            → File storage            → upload-file
"show all bookings"        → Data display            → show-data
```

## Scope Control

If they describe many features, prioritize without blocking:

```
📍 You've described a few features. Here's what I'd suggest:

🟢 BUILD FIRST (gets you live fastest):
  1. [Core visible page]
  2. [Primary action / form]

🟡 ADD NEXT (once the core works):
  3. [Secondary feature]
  4. [Another feature]

🔵 LATER (nice to have):
  5. [Extra feature]

The first 2 could be working in 15 minutes. Start there?
```

Never enforce this order. If they say "actually start with #4," start with #4.

## Re-Activation

This skill re-activates when the designer says:
- "I also want to add..."
- "Can we add a new feature?"
- "What about adding..."

Re-evaluate the flow map, identify new building blocks, integrate without restructuring what exists.

## Project Context File

After the first scaffold, create `PROJECT.md` in the project root so the assistant stays consistent across sessions:

```markdown
# Project: [name]

## What it does
[one sentence from designer]

## Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Database: Supabase
- Auth: not set up
- Email: not set up
- Deploy: not deployed yet

## Pages
- / — [description of landing page]

## Data
[none yet]

## Services
[none yet]
```

Update this file whenever a major feature or page is added.

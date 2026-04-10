# Designer Vibe Coding Skill Pack

[![npm version](https://img.shields.io/npm/v/vibe-ship-it)](https://www.npmjs.com/package/vibe-ship-it)
[![npm downloads](https://img.shields.io/npm/dw/vibe-ship-it)](https://www.npmjs.com/package/vibe-ship-it)
[![license](https://img.shields.io/npm/l/vibe-ship-it)](https://github.com/sso-ss/vibe-ship-it/blob/main/LICENSE)

A set of AI agents and skills that help designers vibe-code their ideas to life, without learning programming.

Works with **VS Code Copilot**, **Claude Code**, **Cursor**, and **OpenAI Codex**.

- Live site: https://vibe-ship-it.vercel.app
- GitHub: https://github.com/sso-ss/vibe-ship-it
- npm: https://www.npmjs.com/package/vibe-ship-it

## What's inside

### 4 Agents

| Agent | What it does | Trigger |
|---|---|---|
| **assistant** | Builds UI, connects backends, fixes issues | Default — just talk |
| **checker** | Reviews your work (read-only, can't break anything) | "Check it" / "Is this ready?" |
| **shipper** | Deploys to GitHub Pages or Vercel | "Ship it" / "Put it online" |
| **investigator** | Deep debugs when quick fixes don't work | "It was working before" / "Find the bug" |

### 14 Skills

| Skill | What it does | Say this |
|---|---|---|
| **what-am-i-building** | Figures out your project and sets it up | "I want to build a..." |
| **noob-mode** | Translates tech jargon to plain English | "What does that mean?" |
| **unstuck** | Fixes problems fast when you're frustrated | "This doesn't work" / "Ugh" |
| **build-page** | Builds UI from descriptions or screenshots | "Build a landing page with..." |
| **make-it-wow** | Instant visual polish — animations, typography, hover effects | "Make it look better" |
| **design-system** | Builds tokens, primitive components, and rules from your existing UI | "Set up a design system" |
| **generate-design-md** | Generates a DESIGN.md from any website URL — captures colors, type, spacing, components, page structure | "Make it look like linear.app" |
| **save-data** | Saves form submissions to a database | "Save the form" |
| **add-login** | Adds user authentication | "Add login" / "Only I can see this" |
| **send-email** | Sends confirmation or notification emails | "Send me an email when..." |
| **upload-file** | Handles image and file uploads | "Let them upload a photo" |
| **show-data** | Displays saved data as cards, tables, or dashboards | "Show me all the bookings" |
| **quick-check** | 4-item quality check (loads? works? mobile? accessible?) | "Check it" |
| **before-you-ship** | Full 9-item pre-deploy checklist | "Is this production ready?" |

### 3 Platform Packs

- **web-nextjs** — Next.js + Tailwind CSS + Supabase + Vercel/GitHub Pages
- **mobile-expo** — React Native + Expo + Supabase + EAS Build
- **figma-plugin** — TypeScript + Figma Plugin API

## Quick start

### Option 0: Install with npm (easiest)

```bash
npx vibe-ship-it init
```

It'll ask which AI tool you use (VS Code Copilot, Claude Code, Cursor, or OpenAI Codex) and install only what you need.

To remove:

```bash
npx vibe-ship-it remove
```

### Option 1: Copy into your project

```bash
cp -r .github /path/to/your-project/
cp -r skills /path/to/your-project/
cp CLAUDE.md /path/to/your-project/
cp -r .claude /path/to/your-project/
```

### Option 2: Gitignore the skill files

If you don't want skill files in your repo, add to `.gitignore`:

```
.github/agents/
.github/copilot-instructions.md
.cursor/rules/
skills/
.claude/
CLAUDE.md
```

## How it works

Just talk naturally. You don't need to remember any agent or skill names.

```
"I want to build a portfolio site"          → sets up the project
"Make a contact page with a form"           → builds the UI
"Save what people submit"                   → connects to database
"Make it look more premium"                 → adds animations and polish
"Make it look like stripe.com"              → generates a DESIGN.md from that site
"Only I should see the submissions"         → adds login
"Email me when someone submits"             → adds notifications
"Check it"                                  → runs quality check
"Ship it"                                   → deploys to the web
```

## The flow

```
  IMAGINE → BUILD → CONNECT → CHECK → SHIP
              ↕
          (bounce freely between
           building UI and making
           it actually do things)
```

No enforced order. Build page 3 before page 1. Add login after 5 pages. Start wherever you want.

## File structure

```
.github/
  copilot-instructions.md              ← VS Code Copilot persona
  agents/
    assistant.agent.md                  ← Primary builder
    checker.agent.md                    ← QA (read-only)
    shipper.agent.md                    ← Deployment
    investigator.agent.md               ← Deep debugging

CLAUDE.md                               ← Claude Code persona
AGENTS.md                               ← OpenAI Codex persona (installed via npx init)

.claude/commands/                        ← Claude Code shortcuts
  check.md                              ← /check
  ship.md                               ← /ship
  wow.md                                ← /wow
  stuck.md                              ← /stuck
  save.md                               ← /save
  explain.md                            ← /explain

.cursor/rules/                           ← Cursor rules (auto-attached by description)
  main.mdc                              ← Core persona (always active)
  build-page.mdc                        ← Triggered by UI building requests
  save-data.mdc                         ← Triggered by data persistence requests
  ...                                   ← 17 rule files total

skills/
  what-am-i-building/                   ← Project setup + routing
  noob-mode/                            ← Plain English translation
  unstuck/                              ← Fast frustration fix
  build-page/                           ← UI construction
  make-it-wow/                          ← Visual polish
  design-system/                        ← Tokens + primitives + consistency rules
  generate-design-md/                   ← DESIGN.md from any website URL
  save-data/                            ← Database persistence
  add-login/                            ← Authentication
  send-email/                           ← Email notifications
  upload-file/                          ← File/image uploads
  show-data/                            ← Data display
  quick-check/                          ← 4-item QA
  before-you-ship/                      ← Full 9-item pre-deploy check
  platforms/
    web-nextjs/                         ← Next.js conventions + Tailwind ref
    mobile-expo/                        ← React Native + Expo conventions
    figma-plugin/                       ← Figma Plugin API conventions
```

## How DESIGN.md works

The `generate-design-md` skill fetches a website's HTML and all linked CSS files, then extracts every visual token into a structured document that AI agents can read.

**What it extracts:**
- Full color system with HSL tokens and semantic roles (background, text, border, status)
- Typography scale with body/heading font separation, icon font filtering, weight strategy
- Spacing grid, container widths, and section gaps
- Component-aware border radius (tracks per button, card, input, modal, badge, dropdown)
- Shadow system including inset shadow-as-border techniques
- Motion tokens: durations, easing curves, backdrop blur values
- Component patterns: buttons (chromatic, dark/monochrome, ghost), cards (shadow, bordered, no-container, inset), inputs, dropdowns, navigation
- Page structure: header, every section in order (heading, body, CTA, layout, card pattern), footer
- State treatments: hover, focus, active, disabled, loading, error
- Dark mode mappings when present
- Responsive breakpoints and what changes at each
- Bot protection detection with DevTools fallback

**Confidence tracking:** Each token is marked as `extracted` (found in CSS), `inferred` (deduced from patterns), or `known` (recognized from training data). If CSS files are blocked, a warning is added.

```
┌─────────────────────────────────────────────────────────────────┐
│  DESIGNER INPUT                                                 │
│                                                                 │
│  "Make it look like stripe.com"     "Set up a design system"    │
│           │                                  │                  │
│           ▼                                  ▼                  │
│   generate-design-md              design-system                 │
│   (fetches site HTML+CSS,         (extracts from your           │
│    extracts tokens)                existing pages)               │
│           │                                  │                  │
│           └──────────┐       ┌───────────────┘                  │
│                      ▼       ▼                                  │
│               ┌──────────────────┐                              │
│               │    DESIGN.md     │                              │
│               │  9-section       │                              │
│               │  token system    │                              │
│               │  with HSL vars   │                              │
│               └────────┬─────────┘                              │
│                        │                                        │
│              ┌─────────┼─────────┐                              │
│              ▼         ▼         ▼                              │
│         build-page  make-it-wow  design-system                  │
│         uses tokens  polishes    builds primitives              │
│         for all UI   within the  FROM the file                  │
│                      system                                     │
│              │         │         │                               │
│              └─────────┼─────────┘                              │
│                        ▼                                        │
│                  Consistent UI                                  │
│            (every page matches the                              │
│             design reference)                                   │
└─────────────────────────────────────────────────────────────────┘
```

**DESIGN.md sections:**
1. Identity: visual personality in one line + signature techniques
2. Color: full palette with semantic roles, neutral scale, dark mode
3. Typography: body/heading fonts, scale, weight strategy
4. Spacing & Layout: base unit, container, component-aware border radius
5. Depth & Motion: elevation system, transitions, backdrop blur
6. Page Structure: header, full section-by-section page flow, footer, layout patterns
7. Components: buttons, cards, inputs, dropdowns, navigation, signature patterns
8. States: hover, focus, active, disabled, loading, empty, error
9. Rules: specific do's and don'ts with actual values

Rule 0 enforces this: every agent silently checks for `DESIGN.md` before any work. If it exists, all colors, fonts, spacing, shadows, and radii come from that file. No inventing new values.

## Try it live

The [live site](https://vibe-ship-it.vercel.app) includes a design token extractor. Paste any URL and get a downloadable DESIGN.md with the full 9-section structure, component preview, Tailwind config, and CSS variables.

## Design principles

- **Show results first, explain code second**
- **Speed over teaching** — fix it now, explain later (if asked)
- **Outcome-named skills** — "save data" not "Supabase CRUD operations"
- **No enforced build order** — follow the designer's energy
- **Make it look impressive by default** — no ugly starter code
- **Plain English** — databases are spreadsheets, branches are photocopies

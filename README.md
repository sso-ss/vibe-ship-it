# Designer Vibe Coding Skill Pack

A set of AI agents and skills that help designers vibe-code their ideas to life — without learning programming.

Works with **VS Code Copilot**, **Claude Code**, and **OpenAI Codex**.

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

### 13 Skills

| Skill | What it does | Say this |
|---|---|---|
| **what-am-i-building** | Figures out your project and sets it up | "I want to build a..." |
| **noob-mode** | Translates tech jargon to plain English | "What does that mean?" |
| **unstuck** | Fixes problems fast when you're frustrated | "This doesn't work" / "Ugh" |
| **build-page** | Builds UI from descriptions or screenshots | "Build a landing page with..." |
| **make-it-wow** | Instant visual polish — animations, typography, hover effects | "Make it look better" |
| **design-system** | Builds tokens, primitive components, and rules from your existing UI | "Set up a design system" |
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

It'll ask which AI tool you use (VS Code Copilot, Claude Code, or OpenAI Codex) and install only what you need.

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

skills/
  what-am-i-building/                   ← Project setup + routing
  noob-mode/                            ← Plain English translation
  unstuck/                              ← Fast frustration fix
  build-page/                           ← UI construction
  make-it-wow/                          ← Visual polish
  design-system/                        ← Tokens + primitives + consistency rules
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

## Design principles

- **Show results first, explain code second**
- **Speed over teaching** — fix it now, explain later (if asked)
- **Outcome-named skills** — "save data" not "Supabase CRUD operations"
- **No enforced build order** — follow the designer's energy
- **Make it look impressive by default** — no ugly starter code
- **Plain English** — databases are spreadsheets, branches are photocopies

---
name: figma-plugin
description: "Figma Plugin API + TypeScript conventions. Loaded automatically when building a Figma plugin."
---

# Figma Plugin Platform

Build Figma plugins that extend the design tool. TypeScript + Figma Plugin API.

## Project Structure

Explain to the designer as:
> "Your plugin has two parts: the brain (logic) and the face (UI panel)."

```
src/
  code.ts                 ← Plugin logic (talks to Figma canvas)
  ui.html                 ← Plugin panel (what the user sees)
  ui.ts                   ← Panel interactivity (optional, for complex UIs)
manifest.json             ← Plugin name, permissions, entry points
tsconfig.json             ← TypeScript settings
package.json              ← Dependencies
figma.d.ts                ← Type definitions for Figma API (auto-generated)
```

## Scaffolding

No CLI tool — scaffold manually:

```bash
mkdir my-plugin && cd my-plugin
npm init -y
npm install -D typescript @figma/plugin-typings
```

Create `manifest.json`:
```json
{
  "name": "My Plugin",
  "id": "000000000000000000",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "src/ui.html",
  "editorType": ["figma"]
}
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "typeRoots": ["./node_modules/@figma/plugin-typings"]
  },
  "include": ["src/**/*.ts"]
}
```

Add build script to `package.json`:
```json
"scripts": {
  "build": "tsc",
  "watch": "tsc --watch"
}
```

## Key Conventions

### Two Worlds: Code vs UI

The plugin has two separate environments that talk to each other:

| | Code (`code.ts`) | UI (`ui.html`) |
|---|---|---|
| Runs in | Figma's sandbox | An iframe |
| Can access | Figma canvas, nodes, styles | HTML, CSS, DOM |
| Can't access | DOM, window, fetch | Figma nodes directly |
| Communicates via | `figma.ui.postMessage()` | `parent.postMessage()` |

> "Think of it like two rooms with a mail slot. The brain room can see and change your design. The face room shows buttons and inputs. They pass notes back and forth."

### Talking to the Canvas

```typescript
// code.ts

// Read the current selection
const selection = figma.currentPage.selection

// Create a rectangle
const rect = figma.createRectangle()
rect.resize(200, 100)
rect.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 1 } }]

// Create text
const text = figma.createText()
await figma.loadFontAsync({ family: "Inter", style: "Regular" })
text.characters = "Hello from the plugin!"

// Read node properties
const node = figma.currentPage.selection[0]
if (node.type === 'TEXT') {
  console.log(node.characters) // the text content
}
```

### Sending Messages Between Code and UI

```typescript
// code.ts → ui.html
figma.ui.postMessage({ type: 'selection-changed', count: selection.length })

// ui.html → code.ts (in a <script> tag)
parent.postMessage({ pluginMessage: { type: 'create-rect', width: 200 } }, '*')

// code.ts — receiving from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-rect') {
    const rect = figma.createRectangle()
    rect.resize(msg.width, 100)
  }
}
```

### Plugin UI (the panel)

```html
<!-- ui.html -->
<style>
  body {
    font-family: Inter, system-ui, sans-serif;
    margin: 0;
    padding: 16px;
    font-size: 13px;
    color: #333;
  }
  button {
    background: #18A0FB;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
  }
  button:hover { background: #0d8de0; }
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    box-sizing: border-box;
  }
</style>

<h3>My Plugin</h3>
<input id="text-input" placeholder="Enter text..." />
<button id="create-btn">Create Text</button>

<script>
  document.getElementById('create-btn').onclick = () => {
    const text = document.getElementById('text-input').value
    parent.postMessage({ pluginMessage: { type: 'create-text', text } }, '*')
  }

  // Receive messages from code.ts
  onmessage = (event) => {
    const msg = event.data.pluginMessage
    if (msg.type === 'done') {
      document.getElementById('text-input').value = ''
    }
  }
</script>
```

### Storing Data

Plugins can save data two ways:

**Per-document** (stored in the Figma file):
```typescript
// Save
figma.root.setPluginData('settings', JSON.stringify({ theme: 'dark' }))

// Load
const settings = JSON.parse(figma.root.getPluginData('settings') || '{}')
```

**Per-user** (stored locally, survives across files):
```typescript
// Save
await figma.clientStorage.setAsync('preferences', { lastUsed: Date.now() })

// Load
const prefs = await figma.clientStorage.getAsync('preferences')
```

> "Per-document is like writing a note on the file itself — anyone who opens the file sees it. Per-user is like your personal notebook — only you see it, but it works in every file."

### No Server, No Database

Figma plugins run entirely in the browser. No Supabase, no server actions, no env vars.

If the plugin needs external data (e.g., fetch from an API), it must go through the UI iframe:
```html
<!-- In ui.html -->
<script>
  // UI can use fetch
  const response = await fetch('https://api.example.com/data')
  const data = await response.json()
  parent.postMessage({ pluginMessage: { type: 'api-data', data } }, '*')
</script>
```

The code.ts sandbox cannot use `fetch` directly.

## Common Commands

| Command | What it does |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run watch` | Auto-compile on save |

## Testing the Plugin

1. Open Figma desktop app
2. Go to Plugins → Development → Import plugin from manifest
3. Select your `manifest.json`
4. Run from Plugins → Development → Your Plugin Name

> "To test, open Figma, go to Plugins menu, and pick your plugin from the Development section."

## Publishing

1. Go to figma.com/plugin-docs/publishing
2. Fill in name, description, cover image
3. Submit for review (usually approved within a few days)

> "When you're ready to share your plugin with everyone, we'll submit it to Figma's plugin store."

## Limitations

- No database — use `pluginData` or `clientStorage` for saving settings
- No login — Figma handles user identity
- No email — plugins can't send emails
- No file uploads — files live in Figma
- Code.ts can't use `fetch` — must go through UI iframe
- UI runs in an iframe with limited capabilities

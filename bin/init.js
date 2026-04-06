#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const targetDir = process.cwd()
const templateDir = path.join(__dirname, '..', 'template')
const args = process.argv.slice(2)
const command = args[0] || 'help'

if (command === 'init') {
  console.log('')
  console.log('  🚀 vibe-ship-it')
  console.log('  AI skill pack for designers')
  console.log('')
  console.log('  Which AI tool are you using?')
  console.log('')
  console.log('    1. VS Code Copilot')
  console.log('    2. Claude Code')
  console.log('    3. OpenAI Codex')
  console.log('    4. All of the above (installs everything)')
  console.log('')

  const readline = require('readline')
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  rl.question('  Pick a number (1-4, default: 4): ', (answer) => {
    rl.close()
    const choice = (answer || '4').trim()

    // Determine what to skip based on choice
    const skipPaths = new Set()
    if (choice === '1') {
      // VS Code Copilot only — skip Claude and Codex files
      skipPaths.add('CLAUDE.md')
      skipPaths.add('AGENTS.md')
      skipPaths.add('_claude')
    } else if (choice === '2') {
      // Claude Code only — skip Copilot and Codex files
      skipPaths.add('AGENTS.md')
      skipPaths.add('_github')
    } else if (choice === '3') {
      // OpenAI Codex only — skip Copilot and Claude files
      skipPaths.add('_github')
      skipPaths.add('_claude')
      skipPaths.add('CLAUDE.md')
    }
    // choice '4' or anything else = install everything

    const renameMap = {
      '_github': '.github',
      '_claude': '.claude',
    }

    console.log('')
    copyDir(templateDir, targetDir, renameMap, skipPaths)

    const tools = { '1': 'VS Code Copilot', '2': 'Claude Code', '3': 'OpenAI Codex', '4': 'all tools' }
    const toolName = tools[choice] || 'all tools'

    console.log('')
    console.log(`  ✅ Done! Installed for ${toolName}:`)
    console.log('')
    if (choice !== '1' && choice !== '3') {
      console.log('     6 commands (/check, /ship, /wow, /stuck, /save, /explain)')
    }
    if (choice !== '2' && choice !== '3') {
      console.log('     4 agents  (assistant, checker, shipper, investigator)')
    }
    console.log('    13 skills  (build-page, design-system, save-data, and more)')
    console.log('')
    console.log('  Just say what you want in plain English.')
    console.log('  Example: "I want to build a portfolio site"')
    console.log('')
  })
} else if (command === 'remove') {
  const dirs = [
    path.join(targetDir, '.github', 'agents'),
    path.join(targetDir, '.claude', 'commands'),
    path.join(targetDir, 'skills'),
  ]
  const files = [
    path.join(targetDir, '.github', 'copilot-instructions.md'),
    path.join(targetDir, 'CLAUDE.md'),
    path.join(targetDir, 'AGENTS.md'),
  ]

  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true })
    }
  })

  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  })

  // Clean up empty parent dirs
  ;[path.join(targetDir, '.github'), path.join(targetDir, '.claude')].forEach(dir => {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir)
    }
  })

  console.log('')
  console.log('  🗑️  Skill pack removed.')
  console.log('')
} else {
  console.log('')
  console.log('  🚀 vibe-ship-it — AI skill pack for designers who vibe-code')
  console.log('')
  console.log('  ┌─────────────────────────────────────────────────────────┐')
  console.log('  │                                                         │')
  console.log('  │  4 AGENTS                                               │')
  console.log('  │                                                         │')
  console.log('  │  assistant     Your coding partner. Just say what       │')
  console.log('  │                you want in plain English.               │')
  console.log('  │  checker       Reviews your work. Finds problems        │')
  console.log('  │                without changing anything.               │')
  console.log('  │  shipper       Puts your project online.                │')
  console.log('  │  investigator  Deep debugs when things break.           │')
  console.log('  │                                                         │')
  console.log('  │  13 SKILLS                                              │')
  console.log('  │                                                         │')
  console.log('  │  "I want to build a..."    → what-am-i-building         │')
  console.log('  │  "Build a landing page"    → build-page                 │')
  console.log('  │  "Make it look better"     → make-it-wow                │')
  console.log('  │  "Save the form"           → save-data                  │')
  console.log('  │  "Add login"               → add-login                  │')
  console.log('  │  "Send an email when..."   → send-email                 │')
  console.log('  │  "Let them upload photos"  → upload-file                │')
  console.log('  │  "Show me all the..."      → show-data                  │')
  console.log('  │  "What does that mean?"    → noob-mode                  │')
  console.log('  │  "This doesn\'t work"       → unstuck                    │')
  console.log('  │  "Check it"                → quick-check                │')
  console.log('  │  "Is this production ready" → before-you-ship           │')
  console.log('  │                                                         │')
  console.log('  │  6 COMMANDS (Claude Code)                               │')
  console.log('  │                                                         │')
  console.log('  │  /check  /ship  /wow  /stuck  /save  /explain           │')
  console.log('  │                                                         │')
  console.log('  └─────────────────────────────────────────────────────────┘')
  console.log('')
  console.log('  Usage:')
  console.log('    npx vibe-ship-it init     Install into current project')
  console.log('    npx vibe-ship-it remove   Remove from current project')
  console.log('')
  console.log('  Works with VS Code Copilot, Claude Code, and OpenAI Codex.')
  console.log('')
}

function copyDir(src, dest, renameMap, skipPaths) {
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    // Skip paths based on user's tool choice
    if (skipPaths && skipPaths.has(entry.name)) {
      continue
    }

    const srcPath = path.join(src, entry.name)
    const destName = (renameMap && renameMap[entry.name]) || entry.name
    const destPath = path.join(dest, destName)

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true })
      }
      copyDir(srcPath, destPath, renameMap, skipPaths)
    } else {
      // Don't overwrite existing files
      if (fs.existsSync(destPath)) {
        console.log(`  ⏭️  Skipped (already exists): ${path.relative(dest, destPath)}`)
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true })
        fs.copyFileSync(srcPath, destPath)
        console.log(`  📄 ${path.relative(dest, destPath)}`)
      }
    }
  }
}

---
name: unstuck
description: "Detects frustration and fixes problems fast. Triggers: 'stuck', 'this doesn't work', 'broken', 'help', 'ugh', 'what the hell', 'why', 'not working', 'it broke', 'error', 'can't figure out', 'I give up', 'frustrated', 'wtf', 'nothing happens', 'blank page', 'won't load', 'keeps crashing'."
---

# Unstuck

The momentum-preservation skill. When a designer hits a wall, get them back to a working state as fast as possible. Explain after.

## Detection Signals

Activate when you see:
- Short frustrated messages: "ugh", "help", "stuck", "wtf"
- Error descriptions: "this doesn't work", "it broke", "nothing happens"
- Repeated attempts at the same thing
- Same error appearing multiple times
- Designer pasting error messages
- Questions like "why doesn't this work?"

## Response Protocol

### Step 1: Acknowledge (1 sentence)
> "Got it, let me take a look."

Do NOT say: "What seems to be the problem?" or "Can you describe the error?" or "What were you trying to do?"

They already told you. Or the context tells you. Diagnose from what you can see.

### Step 2: Diagnose Silently

Check in this order:
1. **Terminal output** — any errors visible?
2. **Browser console** — any errors in the page?
3. **Recent file changes** — what did they (or you) change last?
4. **Dev server** — is it running? Did it crash?
5. **Dependencies** — any missing packages?
6. **Environment** — any missing env vars?

### Step 3: Fix

Fix the problem. Don't describe what you're about to do. Just do it.

### Step 4: Show Working Result
> "That's working now. Check your browser."

### Step 5: Brief Explanation (1-2 sentences, only if helpful)
> "The issue was [X]. This happens when [Y]. No worries."

Do NOT:
- Launch into a teaching moment
- Explain the underlying architecture
- Suggest they should have done it differently
- Recommend preventive measures

### Step 6: Momentum Restore
> "Want to keep going?"

## Common Problems & Fast Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page | Server component trying to use client hooks | Add `'use client'` directive |
| "Module not found" | Missing package | `npm install [package]` |
| Form submits but nothing happens | Server action not connected or missing `'use server'` | Check action binding |
| "hydration mismatch" | Server/client HTML differs | Move dynamic content to client component |
| Page shows raw code/JSON | Missing page component or wrong export | Check default export |
| Styles not applying | Tailwind class not compiling or wrong class name | Check tailwind config, restart dev server |
| "ECONNREFUSED" on database | Supabase not configured or env vars missing | Check `.env.local` |
| Login redirect loop | Middleware misconfigured | Check middleware matcher |
| Image not showing | Wrong path or missing from public folder | Fix path or move image |
| Dev server won't start | Port in use or syntax error | Kill port, check last edit |
| "Cannot read properties of undefined" | Accessing data before it loads | Add loading/null check |
| Build fails | TypeScript error or missing import | Check the specific error line |

## Escalation

If you can't fix it in 2 attempts:

> "This one's tricky. I've tried two approaches and it's still not playing nice. 
> 
> Here's what I can do:
> 1. **Roll back** — go back to how it was 5 minutes ago before this broke
> 2. **Try a different approach** — do the same thing but built differently
> 
> Which do you prefer?"

If they choose rollback, use git:
```bash
git stash  # saves their changes
git checkout -- .  # restores last good state
```

Then re-apply their intended change with a different approach.

## Anti-Patterns

NEVER do these when a designer is frustrated:

- ❌ "What error are you seeing?" (you can see it)
- ❌ "Can you try clearing your cache?" (you fix it)
- ❌ "This is because of how React hydration works..." (they don't care right now)
- ❌ "You should have used X instead of Y" (not the time)
- ❌ "Let me explain what went wrong in detail" (later, if they ask)
- ❌ Ask multiple clarifying questions before acting
- ❌ Suggest they read documentation

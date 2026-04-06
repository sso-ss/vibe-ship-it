---
name: before-you-ship
description: "Full pre-deploy checklist. Runs automatically before deployment. Triggers: 'full check', 'check everything', 'production ready', 'is this ready to deploy', 'pre-deploy', 'ship check', 'before deploy'."
---

# Before You Ship

The full 9-item checklist that runs before deployment. Called automatically by the shipper agent. Can also be triggered manually.

## The 9 Checks

### 1. All Pages Load
Visit every route in the app. Each must render without:
- Console errors
- Blank pages
- Uncaught exceptions
- Missing components

### 2. Forms Save Correctly
Submit every form with test data. Verify:
- Data appears in Supabase (or whatever storage is used)
- Success confirmation shows
- Form clears or redirects after submit
- Submit button shows loading state (prevents double-submit)

### 3. Auth Works (if present)
If the project has login:
- Visit a protected page while logged out → should redirect to login
- Log in with valid credentials → should reach the protected page
- Sign out → should return to public page
- Visit login while already logged in → should redirect to dashboard

Skip if no auth is set up.

### 4. Mobile Layout
Check at 375px (phone) and 768px (tablet):
- No horizontal overflow
- Text readable without zooming
- Navigation usable (hamburger, bottom nav, or responsive links)
- Forms fillable (inputs not cut off, keyboard doesn't hide submit button)
- Images scale properly

### 5. Images Load
- No broken image icons
- All images have reasonable file sizes (warn if any > 1MB)
- All `<img>` tags have `alt` attributes (even if empty string for decorative images)

### 6. No Dead Links
- Click every link on every page
- No 404 pages
- No links that go nowhere or point to `#`
- External links open in new tab

### 7. Accessibility Basics
Not a full WCAG audit — just the essentials:
- All images have `alt` text
- All interactive elements (inputs, buttons, icon links) have visible labels or `aria-label`
- Color contrast meets WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Focus indicators visible when tabbing through the page
- Page has a `<title>` tag

### 8. Page Speed
Run a basic performance check:
- Page loads in under 3 seconds
- No massive unoptimized images
- No blocking scripts
- Fonts load without visible flash

### 9. Environment Variables
Scan the codebase for every `process.env.` reference. Verify:
- `.env.local` exists and contains a value for each one
- No values are empty strings or placeholder text (e.g., `your-key-here`)
- If deploying to Vercel, confirm env vars are also set there (`vercel env ls`)
- Common ones to check: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`

Skip if the project has no env vars (pure static site).

## Report Format

```
🔍 Full check — 9 items:

1. ✅ All pages load without errors
2. ✅ Contact form saves correctly
3. ⏭️ No login (skipped)
4. ⚠️ Mobile: nav menu overlaps logo on small phones
5. ✅ All images load
6. ✅ All links work
7. ⚠️ 2 images missing alt text
8. ✅ Loads in 1.6 seconds
9. ✅ All env vars set

7 passed · 2 warnings · 0 blockers

The 2 warnings won't break anything for visitors:
  1. Nav overlap — only on very small phones (iPhone SE)
  2. Missing alt text — screen reader users won't know 
     what those images show

👍 Safe to ship. Fix the warnings after if you want.
```

## Severity Levels

| Level | Icon | Meaning | Action |
|---|---|---|---|
| Pass | ✅ | Works correctly | None |
| Skipped | ⏭️ | Not applicable (e.g., no auth) | None |
| Warning | ⚠️ | Minor issue, won't break for users | Report, don't block |
| Blocker | ❌ | Will break for visitors | Must fix before deploy |

### Blockers (must fix)
- A page crashes or shows an error
- Main form doesn't save data
- Login doesn't work (if auth exists)
- Page takes over 10 seconds to load
- Required env vars are missing or empty

### Warnings (can ship, fix later)
- Minor layout issues on edge screen sizes
- Missing alt text
- Slight performance issues
- Minor visual inconsistencies

## After the Check

If **no blockers**:
> "All good — safe to ship. There are [N] minor things you could fix later, but nothing that'll break for visitors. Ready to deploy?"

If **blockers found**:
> "Found [N] things that should be fixed first — they'd cause problems for visitors:
> 1. [Blocker description]
> 2. [Blocker description]
> 
> Want me to fix these? Should take [rough time estimate]."

## Rules

- This check is NON-NEGOTIABLE before deploy — the shipper agent always runs it
- Be honest about blockers — don't let broken things ship
- Be relaxed about warnings — perfection is not required for launch
- Always frame warnings as "you can fix this later" — don't make the designer feel the site isn't ready
- Celebrate when it passes: "Looking great! Ready for the world to see it."

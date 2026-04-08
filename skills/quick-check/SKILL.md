---
name: quick-check
description: "Fast 4-item quality check. Triggers: 'check it', 'is this ready', 'does it look ok', 'quick check', 'any issues', 'look for problems', 'is it broken', 'test it'."
---

# Quick Check

The fast quality check. 4 items. Takes under a minute. Good enough for "can I show my friend?"

## The 4 Checks

### 1. Does It Load?

Open every page in the browser. Check:
- No blank/white pages
- No console errors (open dev tools → Console)
- No visible "Error" or "500" or "404" on the page
- Content actually renders (not just a loading spinner forever)

✅ Pass: all pages show content
❌ Fail: any page shows an error, stays blank, or shows a crash screen

### 2. Does The Main Thing Work?

Identify the PRIMARY user action (form submit, button click, navigation flow) and do it:
- If there's a form → fill it out and submit. Does it save? Does it show confirmation?
- If there's a CTA button → click it. Does it go somewhere?
- If there's a login → try logging in. Does it work?
- If it's a portfolio → do images load? Can you navigate between pages?

✅ Pass: the main action completes successfully
❌ Fail: the main action breaks, shows an error, or does nothing

### 3. Mobile?

Resize the browser to 375px width (iPhone SE). Check:
- Text is readable (not overflowing or cut off)
- Navigation is usable (hamburger menu works, or links are tappable)
- No horizontal scroll
- Content isn't overlapping

✅ Pass: looks usable on a phone
❌ Fail: layout is broken, text overflows, navigation is unusable

### 4. Can Everyone Use It?

Quick accessibility scan — not a full audit, just the obvious stuff:
- Images have `alt` text (not empty)
- Text is readable against its background (good contrast)
- Buttons and links have clear labels (not just an icon with no text)

✅ Pass: basics covered
❌ Fail: images missing alt text, unreadable text, or unlabeled buttons

## Report Format

### All Good
```
✅ Quick check — looks good.

1. ✅ All pages load fine
2. ✅ Form submits and saves correctly
3. ✅ Looks good on mobile
4. ✅ Accessibility basics covered

Ready to show someone! 
```

### Issues Found
```
Quick check — found 1 thing:

1. ✅ All pages load fine
2. ✅ Form submits correctly
3. ⚠️ Mobile: the headline text is too wide and gets cut off on phones

This won't break anything, but it'll look off on smaller screens. 
Want me to fix it?
```

### Serious Issue
```
Quick check — found a problem:

1. ✅ All pages load
2. ❌ The contact form submits but nothing happens — no confirmation, 
   no data saved. The server action might not be connected.
3. ✅ Mobile looks fine

This means the main feature doesn't work yet. 
Want me to fix it?
```

## Rules

- NEVER skip a check
- NEVER sugarcoat a broken main feature — be direct
- DO minimize minor issues — "the footer spacing is 4px off" is not worth mentioning in a quick check
- Always end with "Want me to fix it?" if issues are found
- If everything passes, encourage: "Ready to show someone!" or "Looks good for a demo!"

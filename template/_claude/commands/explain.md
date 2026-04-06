Show what changed recently. Follow these steps:

1. Run `git log --oneline -3` to find the last 3 snapshots
2. For each, run `git diff` to see what was changed
3. Explain each change in plain English — no code terms, no jargon
4. Example format:
   - "I changed the contact page layout — moved the form to the left and added a map on the right"
   - "I fixed the form — it wasn't saving because the database connection was missing"
   - "I added a navigation bar to every page"
5. Ask: "Want me to undo any of these?"
6. If they say yes, use `git revert` on that specific snapshot

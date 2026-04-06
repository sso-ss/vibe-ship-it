---
name: save-data
description: "Saves form data to a database. Triggers: 'save', 'store', 'persist', 'remember', 'keep the data', 'save to database', 'save the form', 'store submissions', 'save what they type', 'save entries', 'record', 'track'."
---

# Save Data

Makes forms actually save data. Handles the complete flow: create the database table, write the save function, connect it to the form, and test it.

## The Spreadsheet Analogy

Before creating anything, show the designer what their "spreadsheet" will look like:

> "Here's what your data will look like — think of it as a spreadsheet:
>
> | name | email | message | submitted at |
> |---|---|---|---|
> | Jane Smith | jane@email.com | Hello! I'd like... | Apr 3, 2026 |
> | Alex Kim | alex@email.com | Question about... | Apr 3, 2026 |
>
> Each time someone fills out the form, a new line gets added here."

## Implementation Steps

### Step 1: Create the Table

Generate SQL for Supabase:

```sql
create table [table_name] (
  id uuid default gen_random_uuid() primary key,
  -- columns match the form fields
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table [table_name] enable row level security;

-- Policy: anyone can insert (for public forms)
create policy "Anyone can submit" on [table_name]
  for insert with check (true);

-- Policy: only authenticated users can read (for admin)
create policy "Authenticated users can read" on [table_name]
  for select using (auth.role() = 'authenticated');
```

Tell the designer:
> "Go to your Supabase dashboard → SQL Editor → paste this and run it. That creates your spreadsheet."

Or if Supabase CLI is set up, run it directly.

### Step 2: Set Up Supabase Client

If not already set up, create the Supabase client utilities:

**`src/utils/supabase/server.ts`** — for server-side operations:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**`.env.local`** — environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Tell the designer:
> "I need two settings from your Supabase dashboard — go to Settings → API and copy the URL and the anon key."

### Step 3: Create the Server Action

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'

export async function save[Name](formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('[table_name]').insert({
    // map form fields to columns
  })

  if (error) {
    return { error: 'Something went wrong. Try again.' }
  }

  return { success: true }
}
```

### Step 4: Connect to Form

Add the action to the existing form:
```tsx
<form action={save[Name]}>
  {/* existing fields */}
  <button type="submit">Send</button>
</form>
```

Add a success message:
```tsx
// Show confirmation after submit
"Thanks! Your message was sent."
```

### Step 5: Test It

> "Try filling out the form and clicking Send. Then check your Supabase dashboard — go to Table Editor → [table_name]. You should see your entry."

## Platform Adaptations

| Platform | Storage | Approach |
|---|---|---|
| Web (Next.js) | Supabase | Server actions + Supabase client (above) |
| Mobile (Expo) | Supabase | Supabase JS client directly |
| Prototype / quick test | localStorage | Just save to browser storage (no server needed) |
| WordPress | WP REST API | Custom endpoint + database |

## Multiple Forms

If the project already has other saved data:
- Reuse the existing Supabase client (don't create another one)
- Create a new table for each distinct type of data
- Create a new server action for each form

## Common Issues

| Problem | Fix |
|---|---|
| Form submits but no data appears | Check Supabase RLS policies — insert policy might be missing |
| "Missing environment variable" | Check `.env.local` has the Supabase URL and key |
| Data saves but page doesn't show confirmation | Add success state handling to the form |
| Duplicate entries | Add a loading/disabled state to the submit button |

## After Saving

Update the **Data** section in `PROJECT.md` with the new table name and its columns. Create `PROJECT.md` if it doesn't exist.

## Platform-Specific

### Mobile (Expo)
- No server actions — call Supabase directly from the app
- Use the Supabase client from `utils/supabase.ts` (see mobile-expo platform pack)
- Form state lives in `useState`, not `FormData`
- Show loading spinner on submit button (`ActivityIndicator`)
- Example:
  ```tsx
  const { error } = await supabase.from('bookings').insert({ name, email, date })
  ```

### Figma Plugin
- No external database — use Figma's built-in storage
- Per-document: `figma.root.setPluginData(key, JSON.stringify(data))`
- Per-user: `await figma.clientStorage.setAsync(key, data)`
- If they truly need external storage, use `fetch` from `ui.html` to call an API

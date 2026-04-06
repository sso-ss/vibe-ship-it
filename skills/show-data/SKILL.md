---
name: show-data
description: "Displays saved data as lists, tables, cards, or dashboards. Triggers: 'show me all the', 'list all', 'dashboard', 'display', 'table of', 'view submissions', 'view entries', 'see the data', 'admin page', 'show bookings', 'show messages', 'show orders', 'data page', 'overview'."
---

# Show Data

Displays saved data in a styled, readable format. Turns raw database rows into cards, tables, or dashboard views.

## Process

### Step 1: Identify What to Show

From context, determine:
- Which table/data source (what did `save-data` create?)
- Who sees it (public visitors or admin only?)
- How many items expected (handful or hundreds?)

### Step 2: Choose Display Format

| Best for | Format | Use when |
|---|---|---|
| Few items with details | Cards | Portfolio items, testimonials, team members |
| Many items to scan | Table | Admin view of submissions, orders, bookings |
| Stats overview | Dashboard | Counts, recent activity, key numbers |
| Timeline | List | Activity log, blog posts, updates |

Don't ask the designer which format — pick the best one for their data. They'll say "actually, can it be cards instead?" if they want something different.

### Step 3: Build the View

**Server component that fetches data** (Next.js App Router):

```tsx
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('table_name')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your [Items]</h1>

      {items?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {items?.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 4: Empty State

Never show a blank page. Always show an empty state:

```tsx
function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-gray-400 text-lg">No entries yet.</p>
      <p className="text-gray-400 text-sm mt-2">
        When someone submits the form, their entry will appear here.
      </p>
    </div>
  )
}
```

### Step 5: Test

> "Check your dashboard page. If you submitted test data through your form earlier, you'll see it here. If not, go submit the form, then refresh the dashboard."

## Display Templates

### Card Layout (for rich content)
```tsx
function ItemCard({ item }: { item: any }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-gray-500 text-sm">{item.email}</p>
        </div>
        <span className="text-gray-400 text-sm">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mt-3">{item.message}</p>
    </div>
  )
}
```

### Table Layout (for scanning)
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-left">
    <thead>
      <tr className="border-b text-sm text-gray-500">
        <th className="py-3 px-4 font-medium">Name</th>
        <th className="py-3 px-4 font-medium">Email</th>
        <th className="py-3 px-4 font-medium">Date</th>
      </tr>
    </thead>
    <tbody>
      {items?.map((item) => (
        <tr key={item.id} className="border-b hover:bg-gray-50">
          <td className="py-3 px-4">{item.name}</td>
          <td className="py-3 px-4 text-gray-500">{item.email}</td>
          <td className="py-3 px-4 text-gray-400 text-sm">
            {new Date(item.created_at).toLocaleDateString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Dashboard Stats (for overview)
```tsx
async function DashboardStats() {
  const supabase = await createClient()
  const { count: total } = await supabase
    .from('table_name')
    .select('*', { count: 'exact', head: true })

  const { count: today } = await supabase
    .from('table_name')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total" value={total ?? 0} />
      <StatCard label="Today" value={today ?? 0} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
```

## Access Control

If this is an admin-only view:
- Ensure the route is protected by middleware (from `add-login` skill)
- Add sign-out button on the page
- Show the user's email: "Signed in as you@email.com"

If this is public (like a portfolio or directory):
- No auth needed
- Make sure the Supabase RLS policy allows public reads

## Real-Time Updates (Optional)

If the designer wants to see new entries appear without refreshing:
```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

// Subscribe to new entries
useEffect(() => {
  const supabase = createClient()
  const channel = supabase.channel('entries')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'table_name',
    }, (payload) => {
      setItems(prev => [payload.new, ...prev])
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

Only add if they ask for it. Don't over-engineer.

## Common Issues

| Problem | Fix |
|---|---|
| Page shows empty even though data exists | Check RLS policy allows reads for this user |
| Data shows but unstyled | Make sure Tailwind classes are applied |
| Dates look ugly | Format with `toLocaleDateString()` |
| Too much data, page is slow | Add `.limit(50)` to query, add pagination later if needed |
| Data appears on refresh but not immediately | Page is server-side cached — add `export const revalidate = 0` for always-fresh data |

## Platform-Specific

### Mobile (Expo)
- Use `FlatList` for scrollable lists (handles long lists efficiently)
- Use `useState` + `useEffect` to fetch data from Supabase on screen load
- No server components — everything is client-side
- Example:
  ```tsx
  const [items, setItems] = useState([])
  useEffect(() => {
    supabase.from('bookings').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [])
  ```
- For real-time updates, use Supabase realtime subscriptions (same API as web)

### Figma Plugin
- Read data from `figma.root.getPluginData()` or `figma.clientStorage`
- Display in the `ui.html` panel as a simple HTML list or table
- To read data from the canvas: iterate nodes in `code.ts` and send results to UI via `postMessage`
- Example: scanning all text nodes, listing component instances, showing layer stats

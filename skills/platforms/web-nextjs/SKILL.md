---
name: web-nextjs
description: "Next.js + Tailwind + Supabase + Vercel conventions. Loaded automatically when building a web project."
---

# Web Platform: Next.js

The default web stack. Next.js App Router + Tailwind CSS + Supabase + Vercel.

## Project Structure

Explain to the designer as:
> "Your project is organized into folders. Think of each folder as a room with a specific purpose."

```
src/
  app/                    ← Pages (each folder = a page on your site)
    page.tsx              ← Home page (yourdomain.com/)
    layout.tsx            ← The wrapper around every page (nav, footer)
    about/
      page.tsx            ← About page (yourdomain.com/about)
    contact/
      page.tsx            ← Contact page (yourdomain.com/contact)
    dashboard/
      page.tsx            ← Dashboard (yourdomain.com/dashboard)
    login/
      page.tsx            ← Login page (yourdomain.com/login)
    actions.ts            ← Server actions (code that saves data)
  components/             ← Reusable pieces (navigation, footer, cards)
  utils/
    supabase/
      server.ts           ← Server-side database connection
      client.ts           ← Browser-side database connection
  middleware.ts           ← Page protection (bouncer for private pages)

public/                   ← Static files (images, favicon)
.env.local                ← Secret settings (database keys, API keys)
```

## Key Conventions

### Server vs Client Components

Don't explain "server components" and "client components" in those terms. Say:

- **Default (server):** "This code runs on the server before the page is sent to the visitor. Good for loading data from the database."
- **`'use client'`:** "This code runs in the visitor's browser. Needed when things are interactive — forms, buttons that do stuff, anything that changes on screen."

Rule of thumb:
- Page shows data from database → server component (default, no directive)
- Page has interactive elements (forms, modals, toggles) → add `'use client'` at the top

### Server Actions

Explain as: "Code that runs when someone submits a form."

```typescript
'use server'

export async function doSomething(formData: FormData) {
  // This runs on the server, not in the visitor's browser
  // Safe to access the database here
}
```

Connect to a form:
```tsx
<form action={doSomething}>
```

### Routing

- Each folder in `app/` = a page
- `page.tsx` = what shows at that URL
- `layout.tsx` = wrapper (navigation, footer) that stays the same across pages
- `loading.tsx` = what shows while the page is loading (optional)
- `error.tsx` = what shows if something goes wrong (optional)

### Styling (Tailwind)

Don't explain Tailwind utility names. Just use them. If they ask:
> "Tailwind uses short class names instead of writing CSS. `text-lg` means larger text, `bg-blue-500` means blue background. You don't need to memorize these — I'll pick the right ones."

### Images

Use Next.js Image component for optimization:
```tsx
import Image from 'next/image'

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  className="rounded-lg"
/>
```

For external images (Supabase Storage, Unsplash), add the domain to `next.config.ts`:
```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
    ],
  },
}
```

### Environment Variables

`.env.local` — local development only, never committed to git:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_xxx
```

- `NEXT_PUBLIC_` prefix = accessible in browser code
- No prefix = server-only (for secrets like API keys)

When deploying, these must be set on Vercel too.

## Common Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server (preview in browser) |
| `npm run build` | Build for production (check for errors) |
| `npx vercel` | Preview deployment |
| `npx vercel --prod` | Production deployment |

## Packages to Install as Needed

| When | Package | Install |
|---|---|---|
| Database/Auth/Storage | Supabase | `npm install @supabase/supabase-js @supabase/ssr` |
| Animations | Framer Motion | `npm install framer-motion` |
| Email | Resend | `npm install resend` |
| Icons | Lucide React | `npm install lucide-react` |
| Date formatting | date-fns | `npm install date-fns` |

Don't pre-install everything. Install when first needed.

## Supabase Setup (One Time)

1. Go to supabase.com and create a free project
2. Go to Settings → API
3. Copy the URL and anon key
4. Create `.env.local` with those values

> "You need a free Supabase account — that's where your data, logins, and file uploads live. Takes 2 minutes to set up."

## Vercel Deployment

1. `npx vercel` (first time: link to Vercel account)
2. Set environment variables on Vercel dashboard
3. `npx vercel --prod` for production

> "When you want to put it online, I'll run one command. First time it'll ask you to connect your Vercel account — just follow the link."

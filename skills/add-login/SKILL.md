---
name: add-login
description: "Adds user authentication. Triggers: 'login', 'log in', 'sign in', 'sign up', 'register', 'authentication', 'auth', 'only I can see', 'protect this page', 'private page', 'admin area', 'user accounts', 'members only', 'password protect'."
---

# Add Login

Adds user authentication so some pages are public and others require signing in.

## The Bouncer Analogy

> "Think of it like a bouncer at a door. Your landing page and portfolio are open to everyone. But the dashboard where you see bookings? That's behind a door with a bouncer — only you get in."

## Default: Supabase Auth

For the web stack (Next.js + Supabase), use Supabase Auth since Supabase is already in the project for data storage.

### Step 1: Create Login Page

Create `src/app/login/page.tsx`:
```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Wrong email or password. Try again.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
```

### Step 2: Create Browser Supabase Client

If not already present, create `src/utils/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 3: Protect Pages with Middleware

Create `src/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in and trying to access protected route
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Already logged in and on login page
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
```

### Step 4: Create First User

> "Go to your Supabase dashboard → Authentication → Users → Add User. Enter your email and a password. That's your login for the admin area."

### Step 5: Add Sign Out

Add a sign out button wherever the designer's admin area is:
```tsx
<button onClick={async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}}>
  Sign out
</button>
```

### Step 6: Test It

> "Try these:
> 1. Go to /dashboard — it should redirect you to /login
> 2. Sign in with the email and password you created
> 3. You should land on /dashboard
> 4. Sign out — you should be back on the home page"

## What Gets Protected

The middleware `matcher` controls which pages need login. Update it based on what the designer wants protected:

```typescript
// Protect only /dashboard
matcher: ['/dashboard/:path*', '/login']

// Protect everything under /admin
matcher: ['/admin/:path*', '/login']

// Protect multiple sections
matcher: ['/dashboard/:path*', '/admin/:path*', '/settings/:path*', '/login']
```

## Common Issues

| Problem | Fix |
|---|---|
| Login works but redirects to wrong page | Check the `router.push()` URL in login page |
| "Auth session missing" | Check middleware is refreshing the session properly |
| Can't create user | Check Supabase Auth settings — email provider must be enabled |
| Redirect loop on /login | Check middleware — it might be protecting /login itself |
| After deploy, login breaks | Environment variables must be set on Vercel/deploy platform too |

## Future: Other Auth Options

If the designer needs more (social login, magic links, multi-tenant):
- **Clerk** — more UI components out of the box, better for complex auth
- **NextAuth/Auth.js** — more flexible, more setup
- **Supabase Magic Link** — passwordless (email a login link)

Don't suggest these unless the basic Supabase Auth is insufficient.

## After Adding Login

Update the **Stack** section in `PROJECT.md` to reflect that auth is set up, and note which pages are protected. Create `PROJECT.md` if it doesn't exist.

## Platform-Specific

### Mobile (Expo)
- Use Supabase Auth with `expo-auth-session` for OAuth, or email/password directly
- Store session tokens in `expo-secure-store` (see mobile-expo platform pack)
- Protect screens by checking `supabase.auth.getSession()` in a layout or wrapper
- No middleware — use a React context or hook to gate screens
- Example:
  ```tsx
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) router.replace('/login')
  ```

### Figma Plugin
- Not needed — Figma handles user identity automatically
- If the designer says "only I can use this plugin," explain that Figma controls access through plugin publishing settings (private vs public)
- For per-user preferences, use `figma.clientStorage`

---
name: send-email
description: "Sends emails from your app. Triggers: 'send email', 'email notification', 'notify me', 'confirmation email', 'send a notification', 'email when', 'alert me', 'send message', 'email the user', 'welcome email', 'thank you email'."
---

# Send Email

Sends emails when things happen — confirmations, notifications, welcome messages.

## Default: Resend

Simplest email API. Generous free tier (100 emails/day). Beautiful templates with React Email.

### Step 1: Install

```bash
npm install resend
```

### Step 2: Get API Key

> "Go to resend.com, create a free account, and copy your API key. I'll store it securely."

Add to `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
```

### Step 3: Create Send Function

`src/utils/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: 'Your App <onboarding@resend.dev>',
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Email failed:', error)
    return { success: false }
  }

  return { success: true }
}
```

Note: `onboarding@resend.dev` is Resend's free testing address. For production, connect a custom domain in Resend dashboard.

### Step 4: Connect to an Event

Common patterns:

**After form submission (notify the designer):**
```typescript
'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/email'

export async function saveContact(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  // Save to database
  await supabase.from('contacts').insert({ name, email, message })

  // Notify you
  await sendEmail({
    to: 'you@youremail.com',
    subject: `New message from ${name}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  })

  return { success: true }
}
```

**Confirmation to the user:**
```typescript
// After saving, also email the person who submitted
await sendEmail({
  to: email,
  subject: 'Thanks for reaching out!',
  html: `
    <h2>Got your message!</h2>
    <p>Hi ${name}, thanks for getting in touch. 
    I'll get back to you within 24 hours.</p>
  `,
})
```

### Step 5: Test It

> "Submit your contact form. Check two things:
> 1. You should get a notification email
> 2. The person who submitted should get a confirmation
> 
> Note: With the free Resend account, emails might go to spam at first. That's normal for testing."

## Email Templates

Keep emails simple. Designers can style them later.

**Minimal template:**
```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Subject Here</h2>
  <p style="color: #555; line-height: 1.6;">Content here.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="color: #999; font-size: 12px;">Sent from Your App</p>
</div>
```

## Common Patterns

| When | Email | To |
|---|---|---|
| Contact form submitted | "New message from [name]" | Designer (admin) |
| Contact form submitted | "Thanks for reaching out!" | The visitor |
| Booking created | "New booking: [date/time]" | Designer (admin) |
| Booking created | "Your booking is confirmed" | The customer |
| Order placed | "New order #[id]" | Designer (admin) |
| Account created | "Welcome!" | New user |

## Custom Domain (Production)

For emails to not go to spam:
1. Go to Resend dashboard → Domains
2. Add your domain (e.g., yourbrand.com)
3. Add the DNS records Resend gives you
4. Update the `from` address: `'Your Name <hello@yourbrand.com>'`

> "Right now emails come from a test address. When you're ready to go live, we'll connect your domain so emails come from you@yourbrand.com."

## Common Issues

| Problem | Fix |
|---|---|
| Email not received | Check spam folder. With free tier, emails often land in spam |
| "API key invalid" | Check `.env.local` — the key should start with `re_` |
| Email sends but looks ugly | Use the HTML template above instead of plain text |
| Rate limited | Free tier is 100/day. Upgrade if needed |

## After Adding Email

Update the **Services** section in `PROJECT.md` with the email trigger (e.g., "sends confirmation on form submit"). Create `PROJECT.md` if it doesn't exist.

## Platform-Specific

### Mobile (Expo)
- Apps can't send email from the device directly
- Option A: Use a Supabase Edge Function to send via Resend (recommended)
- Option B: Open the user's email app with `Linking.openURL('mailto:...')`
- Option C: Use a simple webhook/API endpoint that triggers Resend
- Tell the designer: "Phone apps can't send emails on their own. I'll set up a small server function that handles it."

### Figma Plugin
- Not supported — plugins can't send email
- If the designer asks, suggest: "Figma plugins can't send emails. You could open a link to a form or copy data to clipboard instead."

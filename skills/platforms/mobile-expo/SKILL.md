---
name: mobile-expo
description: "React Native + Expo + Supabase + EAS conventions. Loaded automatically when building a mobile app."
---

# Mobile Platform: React Native + Expo

The default mobile stack. React Native + Expo + Supabase + EAS Build.

## Project Structure

Explain to the designer as:
> "Your app is organized into folders. Think of each folder as a room with a specific purpose."

```
app/                      ← Screens (each file = a screen in your app)
  (tabs)/                 ← Tab bar screens
    index.tsx             ← First tab (Home)
    explore.tsx           ← Second tab
    _layout.tsx           ← Tab bar configuration
  _layout.tsx             ← Root layout (wraps everything)
  +not-found.tsx          ← Screen shown when navigating to missing route
components/               ← Reusable pieces (buttons, cards, headers)
constants/                ← Colors, sizes, config values
hooks/                    ← Shared logic
utils/
  supabase.ts             ← Database connection
assets/
  images/                 ← App images
  fonts/                  ← Custom fonts
app.json                  ← App name, icon, splash screen, permissions
.env                      ← Secret settings (database keys)
```

## Key Conventions

### No HTML — Use React Native Components

Mobile apps don't use HTML. Map web concepts to mobile:

| Web (HTML) | Mobile (React Native) | Notes |
|---|---|---|
| `<div>` | `<View>` | Container — like a box |
| `<p>`, `<span>` | `<Text>` | All text MUST be in `<Text>` |
| `<img>` | `<Image>` | Images |
| `<button>` | `<Pressable>` | Tappable areas |
| `<input>` | `<TextInput>` | Text fields |
| `<ul>` + `<li>` | `<FlatList>` | Scrollable lists |
| `<a>` | `<Link>` (from expo-router) | Navigation |
| CSS classes | `StyleSheet` or inline styles | No Tailwind by default |

### Styling

No Tailwind in mobile. Use StyleSheet:

```tsx
import { StyleSheet, View, Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
  },
})
```

Alternatively, install NativeWind for Tailwind-like classes:
```bash
npx expo install nativewind tailwindcss
```

Then you can use: `<Text className="text-3xl font-bold">Welcome</Text>`

### Navigation (Expo Router)

Works like Next.js — file-based routing:
- `app/index.tsx` → Home screen
- `app/profile.tsx` → Profile screen
- `app/(tabs)/` → Tab bar navigation
- `app/[id].tsx` → Dynamic screen (e.g., product detail)

Navigate between screens:
```tsx
import { Link } from 'expo-router'

<Link href="/profile">Go to Profile</Link>
```

Or programmatically:
```tsx
import { router } from 'expo-router'

router.push('/profile')
```

### No Server Actions

Mobile apps run entirely on the device. There's no server. Everything talks to Supabase directly:

```tsx
import { supabase } from '@/utils/supabase'

// Fetch data
const { data } = await supabase.from('bookings').select('*')

// Save data
await supabase.from('bookings').insert({ name, email, date })
```

### Images

```tsx
import { Image } from 'react-native'

// Local image
<Image source={require('@/assets/images/photo.png')} style={{ width: 200, height: 200 }} />

// Remote image (from Supabase Storage, etc.)
<Image source={{ uri: 'https://xxx.supabase.co/storage/v1/...' }} style={{ width: 200, height: 200 }} />
```

### Environment Variables

Create `.env` in project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

- `EXPO_PUBLIC_` prefix = accessible in app code
- Access with `process.env.EXPO_PUBLIC_SUPABASE_URL`

## Common Commands

| Command | What it does |
|---|---|
| `npx expo start` | Start dev server (scan QR with phone to preview) |
| `npx expo start --ios` | Open in iPhone simulator |
| `npx expo start --android` | Open in Android emulator |
| `eas build --platform ios` | Build for App Store |
| `eas build --platform android` | Build for Play Store |
| `eas submit` | Submit to App Store / Play Store |

## Prerequisites

The designer needs:
1. **Expo Go app** on their phone (free, from App Store / Play Store) — for live preview
2. **Expo account** (free) — `npx expo login`
3. For publishing: **Apple Developer** ($99/year) or **Google Play Developer** ($25 one-time)

> "Download the Expo Go app on your phone. That's how you'll preview your app while we build."

## Packages to Install as Needed

| When | Package | Install |
|---|---|---|
| Database/Auth/Storage | Supabase | `npx expo install @supabase/supabase-js` |
| Secure token storage | SecureStore | `npx expo install expo-secure-store` |
| Image picker | ImagePicker | `npx expo install expo-image-picker` |
| Camera | Camera | `npx expo install expo-camera` |
| Icons | Expo Vector Icons | Built-in with Expo |
| Animations | Reanimated | `npx expo install react-native-reanimated` |
| Tailwind-like styling | NativeWind | `npx expo install nativewind tailwindcss` |

Use `npx expo install` instead of `npm install` — it picks compatible versions.

## Supabase Setup (One Time)

Same as web:
1. Go to supabase.com and create a free project
2. Go to Settings → API
3. Copy the URL and anon key
4. Create `.env` with those values

## Supabase Client

```typescript
// utils/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

## Limitations vs Web

Tell the designer upfront:
- "Phone apps take longer to publish — Apple reviews apps, which can take a day or two"
- "You can test instantly on your phone though, using Expo Go"
- "Emails can't be sent from the app directly — we'd use a server function or Supabase Edge Function for that"

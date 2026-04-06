# Platform Routing Reference

## Decision Table

| Signal words | Platform | Default stack |
|---|---|---|
| website, landing page, portfolio, personal site | Web | Next.js + Tailwind + Supabase + Vercel |
| web app, tool, SaaS, dashboard, admin | Web | Next.js + Tailwind + Supabase + Vercel |
| booking, scheduling, appointments | Web | Next.js + Tailwind + Supabase + Vercel |
| app, iPhone, Android, mobile, phone | Mobile | Expo (React Native) + Supabase + EAS |
| store, shop, sell, products, e-commerce, marketplace | Shopify | Shopify CLI + Liquid |
| blog, CMS, content, magazine, news, articles | WordPress | Block themes + WP REST API |
| Figma plugin, extend Figma, Figma tool | Figma Plugin | TypeScript + Figma Plugin API |
| email, newsletter, email template | Email | MJML + Resend |
| desktop app, Mac app, Windows app | Desktop | Electron + Vite + React |
| art, generative, creative, animation, 3D | Creative | p5.js / Three.js / Canvas |
| game, interactive, playful | Creative | p5.js / Pixi.js |
| physical, hardware, Arduino, sensor | Hardware | Python / Arduino C++ |
| AI tool, automation, script | Utility | Python + API calls |

## Disambiguation

If multiple signals conflict, ask ONE question:

> "Sounds cool! Quick question — will people use this on their phone, in a browser, or on their desktop?"

Do NOT ask about technology choices (React vs Vue, PostgreSQL vs MongoDB). The platform decision determines the stack automatically.

## Per-Platform Scaffold Commands

### Web (Next.js)
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### Mobile (Expo)
```bash
npx create-expo-app@latest . --template tabs
```

### Shopify
```bash
npm init @shopify/theme@latest
```

### WordPress
```bash
npx @wordpress/create-block@latest theme-starter
```

### Email (MJML)
```bash
npm init -y && npm install mjml
```

### Desktop (Electron)
```bash
npm create electron-vite@latest . -- --template react-ts
```

### Creative (p5.js)
```bash
npm init -y && npm install p5
```

For v1, only **Web (Next.js)** has full skill support. Other platforms can be scaffolded but won't have outcome skills (save-data, add-login, etc.) customized for them yet.

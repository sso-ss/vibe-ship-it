# Tailwind CSS Quick Reference

Common patterns for designers. Organized by what you want to achieve, not by CSS property name.

## Spacing

| Want | Class | What it does |
|---|---|---|
| Space between sections | `space-y-4` / `space-y-8` | Vertical gap between children |
| Space inside a box | `p-4` / `p-8` / `px-4 py-8` | Padding (inside cushion) |
| Space outside a box | `m-4` / `mx-auto` | Margin (outside spacing) |
| Page side margins | `px-4 md:px-8` | Horizontal padding, wider on desktop |
| Center content | `max-w-7xl mx-auto` | Max width + auto horizontal margins |
| Section breathing room | `py-16 md:py-24` | Generous vertical padding |

## Typography

| Want | Class |
|---|---|
| Giant headline | `text-5xl md:text-7xl font-bold tracking-tight` |
| Section heading | `text-3xl font-semibold` |
| Subheading | `text-xl font-medium text-gray-600` |
| Body text | `text-base leading-relaxed` |
| Large body | `text-lg leading-relaxed` |
| Small/caption | `text-sm text-gray-500` |
| Light text | `text-gray-400` |
| Bold | `font-bold` or `font-semibold` |

## Layout

| Want | Class |
|---|---|
| Side by side (2 cols) | `grid grid-cols-1 md:grid-cols-2 gap-8` |
| Three columns | `grid grid-cols-1 md:grid-cols-3 gap-6` |
| Flexbox row | `flex items-center gap-4` |
| Flexbox column | `flex flex-col gap-4` |
| Full screen height | `min-h-screen` |
| Full width | `w-full` |
| Centered everything | `flex items-center justify-center min-h-screen` |
| Sticky header | `sticky top-0 z-50 bg-white/80 backdrop-blur` |

## Colors

| Want | Class |
|---|---|
| Background | `bg-white` / `bg-gray-50` / `bg-black` |
| Text color | `text-gray-900` / `text-white` / `text-blue-600` |
| Accent background | `bg-blue-500` / `bg-indigo-600` (adjust hue) |
| Subtle card bg | `bg-gray-50` or `bg-white` |
| Dark section | `bg-gray-900 text-white` |

## Cards & Containers

| Want | Class |
|---|---|
| Basic card | `bg-white rounded-xl p-6 shadow-sm border` |
| Elevated card | `bg-white rounded-2xl p-8 shadow-lg` |
| Glass effect | `bg-white/80 backdrop-blur rounded-xl border border-white/20` |
| Outlined card | `border rounded-xl p-6` |

## Buttons

| Want | Class |
|---|---|
| Primary | `bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors` |
| Secondary | `border px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors` |
| With hover lift | Add `hover:scale-[1.02] hover:shadow-lg transition-all` |
| Disabled | Add `disabled:opacity-50 disabled:cursor-not-allowed` |

## Images

| Want | Class |
|---|---|
| Rounded | `rounded-lg` or `rounded-2xl` |
| Circle (profile) | `rounded-full w-12 h-12 object-cover` |
| Cover container | `w-full h-64 object-cover` |
| Aspect ratio | `aspect-square` / `aspect-video` / `aspect-[4/3]` |

## Responsive

All classes can be prefixed for different screen sizes:
- No prefix = mobile (default)
- `md:` = tablet and up (768px+)
- `lg:` = desktop (1024px+)

Example: `text-2xl md:text-4xl lg:text-6xl` — heading grows on bigger screens.

## Animation

| Want | Class |
|---|---|
| Smooth transitions | `transition-all duration-300` |
| Hover scale | `hover:scale-105 transition-transform` |
| Hover lift | `hover:-translate-y-1 hover:shadow-xl transition-all` |
| Fade in (custom) | See make-it-wow skill |
| Spin | `animate-spin` (for loading indicators) |
| Pulse | `animate-pulse` (for skeleton loading) |

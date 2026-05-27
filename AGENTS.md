<!-- BEGIN:nextjs-agent-rules -->
# Agent Rules — Next E-commerce v1.1

## ⚠️ Next.js Version Warning

This project uses **Next.js 16.2.6** — this is NOT the version in your training data.
APIs, conventions, and file structure may differ significantly.

**Before writing any code:**
1. Read the relevant guide in `node_modules/next/dist/docs/`
2. Heed all deprecation notices
3. Do not assume behavior from older Next.js versions

---

## Project Overview

Full-stack e-commerce platform built with:
- **Next.js 16.2.6** App Router
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS v4** (new `@import "tailwindcss"` syntax — no `tailwind.config.js`)
- **Supabase** (PostgreSQL + Row Level Security)
- **NextAuth.js v4**
- **Zustand v5**
- **pnpm** (package manager — do NOT use npm or yarn)

---

## Architecture Rules

### Routing
- All routes use **App Router** (`app/` directory)
- Route groups: `(auth)` for login/register, `(shop)` for customer-facing shop pages
- Admin routes under `app/admin/` with shared layout in `app/admin/layout.tsx`
- API routes under `app/api/` as Route Handlers (`route.ts`)

### Auth
- Auth is handled by **NextAuth.js** via `app/api/auth/[...nextauth]/route.ts`
- Session access: use `useSession()` (client) or `getServerSession()` (server)
- Do NOT use middleware for auth — use Proxy-aware patterns per `next.config.ts`
- User registration: `app/api/auth/register/route.ts` (bcryptjs hashing)

### Styling
- Tailwind CSS v4 — uses `@import "tailwindcss"` in `globals.css`, no config file
- CSS variables for theming: `--primary`, `--secondary`, `--radius`, `--background`, `--foreground`
- Use `style={{ color: 'var(--primary)' }}` for dynamic theme colors, not hardcoded Tailwind color classes
- Theme classes: `theme-cyberpunk`, `theme-minimal`, `theme-warm` applied to `<html>` element via `ThemePreviewManager`
- Custom theme files: `styles/themes/cyberpunk.css`, `styles/themes/minimal.css`, `styles/themes/warm.css`
- Theme CSS is imported **only** in `app/(shop)/layout.tsx` — admin is NOT affected by shop themes

#### Tailwind CSS v4 — สิ่งที่เปลี่ยนไปจาก v3 (สำคัญ)

| เรื่อง | v3 | v4 |
|---|---|---|
| Config file | `tailwind.config.js` | ❌ ไม่มี — ใช้ CSS แทน |
| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Bundler integration | `postcss-loader` | `@tailwindcss/postcss` (หรือ `@tailwindcss/webpack`) |
| Custom theme | `theme.extend` ใน config | `@theme` block ใน CSS |
| Custom utilities | `plugin()` | `@utility` ใน CSS |
| Custom variants | `addVariant()` | `@variant` ใน CSS |

#### Tailwind CSS v4.2–v4.3 Features (ล่าสุด ณ พฤษภาคม 2026)

**v4.2:**
- `@tailwindcss/webpack` loader — เร็วกว่า `@tailwindcss/postcss` ถึง 2x ในโปรเจกต์ webpack ขนาดใหญ่
  - โปรเจกต์นี้ยังใช้ `@tailwindcss/postcss` อยู่ — สามารถ upgrade ได้ถ้าต้องการ performance
- สีใหม่: `mauve`, `olive`, `mist`, `taupe` palettes
- Logical property utilities: `mbs-*`, `mbe-*`, `pbs-*`, `pbe-*`, `inset-s-*`, `inset-e-*`
- `font-features-*` utility สำหรับ OpenType features

**v4.3:**
- `scrollbar-thin`, `scrollbar-none`, `scrollbar-auto` — style scrollbar ได้โดยตรง
- `scrollbar-thumb-*`, `scrollbar-track-*` — สี scrollbar
- `scrollbar-gutter-stable` — ป้องกัน layout shift เมื่อ scrollbar ปรากฏ
- `zoom-*` utilities — CSS zoom property
- `tab-*` utilities — ควบคุมความกว้าง tab character
- `@container-size` — size container สำหรับ container queries ที่ต้องการ height
- Stacked + compound `@variant` support ใน CSS

### State Management
- Cart state: Zustand store at `store/useCartStore.ts`
- Cart syncs to Supabase via `app/api/cart/sync/route.ts` on login

### Database
- **Current (Active):** Supabase PostgreSQL with RLS policies
  - All DB access via `lib/supabaseClient.ts`
  - Schema defined in `supabase-schema.sql`
  - Tables: `users`, `products`, `orders`, `order_items`, `license_keys`, `site_config`, `live_streams`
  - All tables have Row Level Security (RLS) enabled
  - Fallback data in `lib/products.ts` for when Supabase is unavailable

- **Future (Prepared, Not Active):** Prisma ORM for potential migration
  - Prisma schema prepared in `prisma/schema.prisma` (ready if needed)
  - Supports database portability (PostgreSQL → MySQL → SQLite)
  - Migration guide: See `PRISMA_STATUS.md` (~20-30 hours effort)
  - Decision: Keep Supabase unless vendor lock-in becomes critical issue

#### Database Decision (May 27, 2026)
✅ **DECISION:** Continue using Supabase (stable, working, RLS optimized)  
📋 **PREPARED:** Prisma schema ready for future migration if needed  
⏳ **REVIEW:** Consider Prisma migration only if:
  - Need to switch database platforms
  - Performance issues arise
  - Vendor lock-in becomes business-critical

```bash
# Supabase (Current)
pnpm install @supabase/supabase-js @supabase/ssr

NEXT_PUBLIC_SUPABASE_URL=https://mculatbcnsowekoryzcy.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_QHNa-oKfUvYgmBaYm0zUqA_nS71jA-n

# Optional for future Prisma migration
# (Do NOT use yet - prepared for future)
# pnpm add prisma @prisma/client @next-auth/prisma-adapter
# npx prisma generate
```

### Site Config / Theme Engine
- Site config (theme, colors, store name, payment info, social links) stored in `site_config` table
- Fetched server-side in `app/(shop)/layout.tsx` via `lib/siteConfig.ts` — **shop only**
- Client-side fallback reads from `localStorage` key `site_config_fallback`
- Admin layout (`app/admin/layout.tsx`) uses hardcoded slate colors — NOT affected by theme engine

---

## File Conventions

### Layout Hierarchy (สำคัญมาก)

| Layout | ไฟล์ | ครอบอะไร | Header/Footer | Theme |
|---|---|---|---|---|
| Root | `app/layout.tsx` | ทุกอย่าง | ❌ | ❌ |
| Shop | `app/(shop)/layout.tsx` | shop pages เท่านั้น | ✅ | ✅ |
| Admin | `app/admin/layout.tsx` | admin pages เท่านั้น | ❌ (sidebar) | ❌ |

> ⚠️ **กฎสำคัญ:** อย่าแก้ไข `components/shop/` เมื่อทำงานกับ admin และในทางกลับกัน

### โครงสร้างไฟล์

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — bare, ครอบแค่ `<Providers>` |
| `app/(shop)/layout.tsx` | Shop layout — SiteHeader, SiteFooter, theme engine |
| `app/(shop)/page.tsx` | Homepage |
| `app/(shop)/products/` | หน้าสินค้า |
| `app/(shop)/cart/` | ตะกร้าสินค้า |
| `app/(shop)/checkout/` | Checkout |
| `app/(shop)/about/` | เกี่ยวกับเรา |
| `app/(shop)/contact/` | ติดต่อเรา |
| `app/(shop)/faq/` | FAQ |
| `app/(shop)/shipping/` | นโยบายการจัดส่ง |
| `app/(auth)/login/` | หน้า login (ไม่มี header/footer) |
| `app/(auth)/register/` | หน้า register (ไม่มี header/footer) |
| `app/admin/layout.tsx` | Admin layout — sidebar + session guard |
| `app/admin/dashboard/` | Admin dashboard |
| `app/globals.css` | Global styles + CSS variable definitions |
| `app/providers.tsx` | Client providers (SessionProvider, CartSync) |
| `styles/themes/cyberpunk.css` | Cyberpunk theme CSS |
| `styles/themes/minimal.css` | Minimal theme CSS |
| `styles/themes/warm.css` | Warm Commerce theme CSS |
| `components/shop/layout/` | SiteHeader, SiteFooter — shop เท่านั้น |
| `components/shop/modules/` | ProductCard และ shop UI components |
| `components/shop/theme/` | ThemePreviewManager |
| `components/admin/` | Admin-specific components (เตรียมไว้) |
| `components/CartSync.tsx` | Shared — ใช้ใน providers.tsx |
| `lib/` | Server-side utilities (db, auth, products, orders, siteConfig, stripe) |
| `services/` | Higher-level service abstractions |
| `store/` | Zustand stores |
| `types/` | Shared TypeScript types |

---

## Do's and Don'ts

**Do:**
- Use `"use client"` directive only when necessary (event handlers, hooks, browser APIs)
- Use Server Components by default for data fetching
- Use `next/image` for all images
- Use `next/link` for all internal navigation
- Use CSS variables (`var(--primary)`) for theme-aware colors
- Use `pnpm` for all package operations

**Don't:**
- Don't use `next/router` — use `next/navigation` (`useRouter`, `usePathname`, `redirect`)
- Don't use `getServerSideProps` or `getStaticProps` — use async Server Components
- Don't hardcode colors like `bg-slate-900` for primary actions — use `var(--primary)`
- Don't use `middleware.ts` for auth — use server-side session checks
- Don't install packages without checking if they're already available
- Don't use `npm` or `yarn` — always use `pnpm`

---

## Running the Project

```bash
pnpm dev      # development (Webpack — Turbopack is default in v16 but this project opts out via --webpack flag)
pnpm build    # production build (Webpack)
pnpm start    # production server
pnpm lint     # ESLint
```

> **หมายเหตุ Turbopack:** Next.js 16 ใช้ Turbopack เป็น default สำหรับทั้ง `dev` และ `build`
> โปรเจกต์นี้ **ตั้งใจ opt-out** ด้วย `--webpack` flag ใน `package.json`
> ถ้าต้องการเปลี่ยนไปใช้ Turbopack ให้ลบ `--webpack` ออกจาก scripts

## ⚠️ Middleware → Proxy (Breaking Change in v16.0.0)

`middleware.ts` is **deprecated**. The file convention has been renamed to `proxy.ts` and the exported function from `middleware()` to `proxy()`.

```diff
// middleware.ts → proxy.ts
- export function middleware() {
+ export function proxy() {
```

**Migration codemod:**
```bash
npx @next/codemod@latest proxy-upgrade
```

---

## proxy.ts — File Convention Reference

> Last updated: May 19, 2026

The `proxy.js|ts` file runs code on the server **before** a request is completed. Use it to rewrite, redirect, modify headers/cookies, or respond directly. It executes before routes are rendered.

**Good to know:**
- Proxy is meant to be invoked separately from render code. Do not rely on shared modules or globals.
- To pass data to your app, use headers, cookies, rewrites, redirects, or the URL.
- Place `proxy.ts` at the project root (same level as `app/` or `pages/`), or inside `src/` if applicable.

### Basic example

```ts
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

---

## Exports

### Proxy function

Must export a single function — either default export or named `proxy`. Multiple proxies from the same file are not supported.

```js
export default function proxy(request) {
  // Proxy logic
}
```

### Config object (optional)

Export a `config` object with a `matcher` to specify which paths the Proxy applies to.

> **Without a matcher**, Proxy runs on every request including `_next/static`, `_next/image`, and `public/`. Always use a negative match pattern to exclude static assets.

---

## Matcher

### Single / multiple paths

```js
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
}
```

### Exclude static assets (recommended pattern)

```js
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
}
```

### Advanced object syntax

```js
export const config = {
  matcher: [
    {
      source: '/api/:path*',
      locale: false,
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
        { type: 'query', key: 'userId', value: '123' },
      ],
      missing: [{ type: 'cookie', key: 'session', value: 'active' }],
    },
  ],
}
```

**Source path rules:**
- MUST start with `/`
- Named params: `/about/:path` → matches `/about/a`, not `/about/a/c`
- Modifiers: `:path*` (zero or more), `:path?` (zero or one), `:path+` (one or more)
- Regex: `/about/(.*)` = `/about/:path*`
- Anchored to path start: `/about` matches `/about` and `/about/team`, not `/blog/about`

**Good to know:** `matcher` values must be constants (statically analyzable at build time).

---

## Params

### `request` — `NextRequest`

```ts
// proxy.ts
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Proxy logic goes here
}
```

### `NextProxy` shorthand type

```ts
import type { NextProxy } from 'next/server'

export const proxy: NextProxy = (request, event) => {
  event.waitUntil(Promise.resolve())
  return Response.json({ pathname: request.nextUrl.pathname })
}
```

---

## NextResponse API

| Method | Purpose |
|--------|---------|
| `NextResponse.redirect(url)` | Redirect to a different URL |
| `NextResponse.rewrite(url)` | Rewrite (display given URL without changing browser URL) |
| `NextResponse.next({ request: { headers } })` | Pass modified request headers upstream |
| `response.cookies.set/delete` | Manipulate cookies |
| `response.headers.set` | Set response headers |

> For redirects, `Response.redirect` can also be used instead of `NextResponse.redirect`.

---

## Execution Order

1. `headers` from `next.config.js`
2. `redirects` from `next.config.js`
3. **Proxy** (rewrites, redirects, etc.)
4. `beforeFiles` rewrites from `next.config.js`
5. Filesystem routes (`public/`, `_next/static/`, `pages/`, `app/`, etc.)
6. `afterFiles` rewrites from `next.config.js`
7. Dynamic Routes (`/blog/[slug]`)
8. `fallback` rewrites from `next.config.js`

> **Important:** Server Functions are POST requests to their route — a Proxy matcher that excludes a path also skips Server Function calls on that path. Always verify auth inside each Server Function; do not rely on Proxy alone.

---

## Runtime

Proxy defaults to **Node.js runtime**. The `runtime` config option is **not available** in Proxy files — setting it will throw an error.

---

## Advanced Flags

### `skipTrailingSlashRedirect`

```js
// next.config.js
module.exports = { skipTrailingSlashRedirect: true }
```

Disables automatic trailing slash redirects — useful for incremental migrations.

### `skipProxyUrlNormalize`

```js
// next.config.js
module.exports = { skipProxyUrlNormalize: true }
```

Disables URL normalization — gives full control over the original URL shape (needed for custom `fetch` rewrite setups with RSC).

---

## Examples

### Conditional rewrites

```ts
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url))
  }
}
```

### Using Cookies

```ts
export function proxy(request: NextRequest) {
  let cookie = request.cookies.get('nextjs')
  request.cookies.has('nextjs')  // true
  request.cookies.delete('nextjs')

  const response = NextResponse.next()
  response.cookies.set('vercel', 'fast')
  return response
}
```

### Setting Headers

```ts
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-proxy1', 'hello')

  // ✅ Correct — makes headers available upstream
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ❌ Wrong — NextResponse.next({ headers: requestHeaders }) sends to client only

  response.headers.set('x-hello-from-proxy2', 'hello')
  return response
}
```

> Avoid setting large headers — may cause `431 Request Header Fields Too Large`.

### CORS

```ts
const allowedOrigins = ['https://acme.com', 'https://my-app.org']
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)

  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, {
      headers: {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      },
    })
  }

  const response = NextResponse.next()
  if (isAllowedOrigin) response.headers.set('Access-Control-Allow-Origin', origin)
  Object.entries(corsOptions).forEach(([k, v]) => response.headers.set(k, v))
  return response
}

export const config = { matcher: '/api/:path*' }
```

### Auth guard (produce a response)

```ts
export const config = { matcher: '/api/:function*' }

export function proxy(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return Response.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    )
  }
}
```

### Negative matching (recommended base pattern)

```js
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

> **Note:** Even when `_next/data` is excluded in a negative matcher, Proxy still runs for `_next/data` routes — intentional behavior to prevent accidentally unprotecting data routes.

### `waitUntil` — background work

```ts
export function proxy(req: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch('https://my-analytics-platform.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: req.nextUrl.pathname }),
    })
  )
  return NextResponse.next()
}
```

---

## Unit Testing (experimental, Next.js 15.1+)

```js
import { unstable_doesProxyMatch, isRewrite, getRewrittenUrl } from 'next/experimental/testing/server'

// Test matcher
expect(unstable_doesProxyMatch({ config, nextConfig, url: '/test' })).toEqual(false)

// Test proxy function
const request = new NextRequest('https://nextjs.org/docs')
const response = await proxy(request)
expect(isRewrite(response)).toEqual(true)
expect(getRewrittenUrl(response)).toEqual('https://other-domain.com/docs')
```

---

## Platform Support

| Deployment | Supported |
|------------|-----------|
| Node.js server | ✅ Yes |
| Docker container | ✅ Yes |
| Static export | ❌ No |
| Adapters | Platform-specific |

---

## Version History

| Version | Change |
|---------|--------|
| `v16.0.0` | `middleware` deprecated → renamed to `proxy` |
| `v15.5.0` | Node.js runtime stable |
| `v15.2.0` | Node.js runtime experimental |
| `v13.1.0` | Advanced flags added |
| `v13.0.0` | Can modify request/response headers and send responses |
| `v12.2.0` | Middleware stable |
| `v12.0.0` | Middleware (Beta) |

---

## Stripe

```
npx skills add https://docs.stripe.com --yes
```

<!-- END:nextjs-agent-rules -->

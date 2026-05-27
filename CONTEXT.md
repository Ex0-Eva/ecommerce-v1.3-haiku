# Project Context – ecommerce‑v1.3‑haiku

## 📦 Repository
- **Path:** `C:\Users\User\Documents\GitHub\NeuralLink\ecommerce-v1.3-haiku`
- **Version:** `v1.3‑haiku` (previously `v1.2‑kiro`)

## 🛠️ Technology Stack
| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | **16.2.6** |
| **UI** | React | **19.2.4** |
| **Language** | TypeScript | **5** |
| **Styling** | Tailwind CSS | **v4** (no `tailwind.config.js`, use `@import "tailwindcss"` in `globals.css`) |
| **Auth** | NextAuth.js | **v4** (session via `useSession()` / `getServerSession()`) |
| **Database** | Supabase (PostgreSQL + RLS) | – |
| **Database Client** | `@supabase/supabase-js` | **2.106.2** |
| **State** | Zustand | **v5** |
| **Package Manager** | pnpm | – |

## 📂 Directory Layout (App Router)
```
app/
├─ layout.tsx                # Root layout (Providers only)
├─ (shop)/
│   ├─ layout.tsx           # Shop layout – SiteHeader, SiteFooter, theme engine
│   ├─ page.tsx             # Home
│   ├─ products/            # Product pages
│   ├─ cart/                # Cart UI
│   ├─ checkout/            # Checkout flow
│   └─ … (about, contact, faq, shipping)
├─ (auth)/
│   ├─ login/page.tsx       # Login (no header/footer)
│   └─ register/page.tsx    # Register (no header/footer)
├─ admin/
│   ├─ layout.tsx           # Admin layout – sidebar + session guard
│   └─ dashboard/…          # Admin pages
├─ api/
│   ├─ auth/[...nextauth]/
│   │   └─ route.ts          # NextAuth.js handlers (sign‑in, sign‑out, callbacks)
│   ├─ auth/register/route.ts # Custom register (bcryptjs hashing)
│   ├─ cart/sync/route.ts   # Cart sync with Supabase
│   └─ admin/products/…      # CRUD API routes via Supabase client
└─ …
```

## 🎨 Theme Engine (Shop only)
- Themes live in `styles/themes/`:
  - `cyberpunk.css`
  - `minimal.css`
  - `warm.css`
- Theme CSS is imported **only** in `app/(shop)/layout.tsx` via `ThemePreviewManager` which toggles the `<html>` class (`theme‑cyberpunk`, `theme‑minimal`, `theme‑warm`).
- CSS variables (`--primary`, `--secondary`, `--background`, `--foreground`, `--radius`) are used throughout components; avoid hard‑coded Tailwind color classes.

## 🔐 Authentication Flow
1. **User sign‑in** → NextAuth.js creates a session cookie.
2. `useSession()` (client) or `getServerSession()` (server) provides `session.user`.
3. **Admin‑only API routes** validate the session and a `role` field (`admin`).
4. **Database access** uses the Supabase client via `lib/supabaseClient.ts` with Row Level Security (RLS) policies

## 📦 Database & Client Library
- **Supabase PostgreSQL** (https://supabase.com) — managed PostgreSQL with Row Level Security (RLS)
- Supabase client (`@supabase/supabase-js`) handles direct queries
- No ORM in use yet (future: consider Prisma migration)
- Schema defined in `supabase-schema.sql` with RLS policies for users, products, orders, license_keys, site_config, live_streams
- Connection via `lib/supabaseClient.ts` (all DB access routes through here)
- Fallback data in `lib/products.ts` for when Supabase is unavailable

## ⚡ Development Commands (pnpm)
```bash
pnpm dev      # Run dev server (Webpack – project opts‑out of Turbopack)
pnpm build    # Production build (Webpack)
pnpm start    # Production server
pnpm lint     # Run ESLint
```

## 🧭 Important Rules from `AGENTS.md`
- **Routing:** All routes must use the App Router (`app/`).
- **Auth:** No middleware; use Proxy (`proxy.ts`) only for low‑level rewrites.
- **Styling:** Tailwind v4, no `tailwind.config.js`. Use `@import "tailwindcss"` in `globals.css`.
- **Package Manager:** Always use `pnpm`.
- **State:** Zustand v5 for cart; avoid using React Context for global state.
- **Component Separation:** `components/shop/` vs `components/admin/` – never mix.

## 📄 How to Use This Context File
- The AI (and any new contributor) should read `CONTEXT.md` first to understand the project’s architectural decisions, version, and tooling choices.
- When adding new features, respect the layout hierarchy, theme system, and auth guard patterns described above.
- Keep this file up‑to‑date whenever major changes (e.g., new DB, version bump) occur.

---

*Created automatically by Antigravity on 2026‑05‑27.*

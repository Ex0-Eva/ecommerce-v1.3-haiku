# Theme Engine — แนวทางสร้างธีมร้านค้า (Shop)

เอกสารนี้อธิบายวิธีเพิ่ม/แก้ **preset theme** สำหรับหน้าร้าน (`app/(shop)/`) โดยไม่กระทบ Admin

**เทมเพลตนี้ (008):** ธีมเริ่มต้น = `luxury` (ทอง · เครื่องประดับ/น้ำหอม)  
**เทมเพลต 007:** ธีมเริ่มต้น = `cyberpunk` (neon tech)

---

## สถาปัตยกรรมสั้น ๆ

```
v12_site_config (Supabase)
        ↓
getSiteConfig()  →  theme_name, primary_color, ...
        ↓
resolveShopTheme()  →  แมป "modern" → preset เริ่มต้นของเทมเพลต
        ↓
app/(shop)/layout.tsx  →  CSS variables + class บน .shop-shell
        ↓
styles/themes/{name}.css  →  override สี/ฟอนต์/animation
        ↓
ThemePreviewManager (client)  →  live preview จาก localStorage (admin)
```

| ชั้น | ไฟล์ | หน้าที่ |
|------|------|--------|
| Config | `lib/siteConfig.ts` | ค่า default + อ่าน/เขียน DB |
| Resolve | `lib/resolveShopTheme.ts` | แมป `modern` → preset, คืน `theme-{name}` |
| Layout | `app/(shop)/layout.tsx` | import CSS, ใส่ `shop-shell theme-X` |
| Preset CSS | `styles/themes/*.css` | สไตล์เต็มรูปแบบ (high-specificity) |
| Preview | `components/shop/theme/theme-preview-manager.tsx` | sync class + CSS vars ฝั่ง client |
| Ambient (optional) | `components/shop/theme/*-ambient.tsx` | เอฟเฟกต์พื้นหลัง (client only) |
| Admin | `app/admin/settings/page.tsx` | เลือก theme + บันทึก DB |

---

## กฎสำคัญ (อ่านก่อนเขียนโค้ด)

1. **ธีมมีผลเฉพาะ Shop** — import theme CSS ใน `app/(shop)/layout.tsx` เท่านั้น  
   Admin ใช้ slate คงที่ ไม่ใช้ theme engine

2. **อย่าแก้ `components/shop/` ตอนทำ admin** และในทางกลับกัน

3. **Class ธีมใส่ที่ `.shop-shell`** ไม่ใส่บน `<html>` ด้วย inline script  
   - ป้องกัน React hydration mismatch  
   - Selector ใน CSS ต้องมีทั้ง `html.theme-X` และ `.shop-shell.theme-X`

4. **อย่า `cookies().delete()` ใน Server Component** (layout)  
   - ลบ session cookie ได้ที่ Route Handler เท่านั้น เช่น `/api/auth/clear-session`

5. **สีหลักใช้ CSS variables** — `var(--primary)`, `var(--secondary)`  
   อย่า hardcode `bg-blue-600` สำหรับปุ่มหลัก

6. **Mobile-first** — สไตล์ฐานสำหรับมือถือ แล้วค่อย `sm:` / `md:` / `lg:`

7. **`prefers-reduced-motion`** — ลด/ปิด animation ในไฟล์ theme

---

## Checklist: เพิ่มธีมใหม่ชื่อ `{name}`

### 1. สร้างไฟล์ CSS

`styles/themes/{name}.css`

```css
/* ตัวแปรธีม — ครอบทั้ง html และ .shop-shell */
html.theme-{name},
:root.theme-{name},
.shop-shell.theme-{name} {
  --primary: #...;
  --secondary: #...;
  --background: #...;
  --foreground: #...;
  --radius: ...;
}

/* Base */
html.theme-{name} body,
.shop-shell.theme-{name} {
  background-color: var(--background) !important;
  color: var(--foreground) !important;
}

/* Override Tailwind utility classes ที่ใช้บ่อย */
html.theme-{name} .bg-white,
.shop-shell.theme-{name} .bg-white { ... }

html.theme-{name} .text-slate-900,
.shop-shell.theme-{name} .text-slate-900 { ... }

/* ปุ่ม, input, header, footer, cards ... */
```

**เคล็ดลับ:** คัดลอกจาก `luxury.css` หรือ `cyberpunk.css` แล้วเปลี่ยนสี/animation

**Semantic classes (แนะนำ):** ใส่ class เฉพาะธีมใน component แทน override กว้าง ๆ

| Class | ใช้กับ |
|-------|--------|
| `{name}-hero` | Hero section |
| `{name}-card` | การ์ดสินค้า/ฟีเจอร์ |
| `{name}-btn-primary` | ปุ่มหลัก |
| `{name}-btn-outline` | ปุ่มรอง |
| `{name}-gradient-text` | หัวข้อไล่สี |
| `{name}-section-title` | หัวข้อ section |

### 2. ลงทะเบียน preset

**`lib/resolveShopTheme.ts`**

```ts
export const SHOP_THEME_PRESETS = ["luxury", "minimal", "warm", "cyberpunk", "{name}"] as const;
// ถ้าเป็น default ของเทมเพลต: if (name === "modern") return "{name}";
```

**`app/(shop)/layout.tsx`** — import CSS + `THEME_VARS`:

```ts
import "@/styles/themes/{name}.css";

const THEME_VARS = {
  {name}: {
    "--primary": "#...",
    "--secondary": "#...",
    "--background": "#...",
    "--foreground": "#...",
    "--radius": "...",
  },
  // ...
};
```

**`components/shop/theme/theme-preview-manager.tsx`** — เพิ่ม preset เดียวกันใน `THEME_PRESETS` และ `ALL_THEME_CLASSES` มาจาก `SHOP_THEME_PRESETS`

**`app/admin/settings/page.tsx`**

```ts
const THEME_PRESETS = {
  {name}: { primary_color: "...", secondary_color: "...", border_radius: "..." },
};
const ALL_THEME_CLASSES = [..., "theme-{name}"];
// เพิ่มการ์ดเลือก theme ใน UI
```

### 3. (Optional) Ambient / Hero

| ไฟล์ | เมื่อไหร่ใช้ |
|------|----------------|
| `components/shop/modules/{name}-hero.tsx` | หน้าแรกเฉพาะสไตล์ |
| `components/shop/theme/{name}-ambient.tsx` | เอฟเฟกต์ client (particles, vignette) |

ใน `layout.tsx`:

```tsx
import {Name}Ambient from "@/components/shop/theme/{name}-ambient";
// ...
<{Name}Ambient />
```

Ambient ตรวจ `document.querySelector(".shop-shell.theme-{name}")` ก่อน render

### 4. ค่าเริ่มต้น

**`lib/siteConfig.ts`**

```ts
export const defaultSettings = {
  theme_name: "{name}",
  primary_color: "#...",
  secondary_color: "#...",
  // ...
};
```

### 5. ทดสอบ

```bash
pnpm dev
```

- [ ] หน้าแรก / products / cart สีถูกต้อง  
- [ ] Mobile (375px) ไม่ล้นจอ  
- [ ] Admin → Settings เปลี่ยน theme แล้ว preview ได้  
- [ ] Hard refresh ไม่มี hydration error  
- [ ] `pnpm build` ผ่าน  

---

## การแมป `modern`

`theme_name: "modern"` ใน DB = ไม่มีไฟล์ CSS ของตัวเอง

| เทมเพลต | `resolveShopTheme("modern")` |
|---------|------------------------------|
| 007 | `cyberpunk` |
| 008 | `luxury` |

แก้ default ได้ที่ `lib/resolveShopTheme.ts` บรรทัด `if (name === "modern") return "..."`

---

## DB & localStorage

**Supabase**

```sql
UPDATE v12_site_config
SET theme_name = 'luxury',
    primary_color = '#c9a962',
    secondary_color = '#b76e79',
    border_radius = '0.25rem',
    store_name = 'Maison Aurum';
```

**localStorage** (live preview จาก admin)

- Key: `site_config_fallback`  
- ถ้า preview ค้าง: ลบ key ใน DevTools แล้ว refresh  

---

## Auth ที่เกี่ยวกับ theme

- ใช้ `getSafeServerSession()` ใน layout ไม่ใช่ `getServerSession()` ตรง ๆ  
- ตั้ง `NEXTAUTH_SECRET` ใน `.env.local` ให้คงที่  
- Cookie session เสีย: เปิด `/api/auth/clear-session`  

---

## ตัวอย่างธีมใน repo

| Theme | ไฟล์ | ลักษณะ | เทมเพลต |
|-------|------|--------|---------|
| `luxury` | `luxury.css` | ทอง, serif, เครื่องประดับ/น้ำหอม | **008** (default) |
| `cyberpunk` | `cyberpunk.css` | Neon, grid, glitch | **007** (default) |
| `minimal` | `minimal.css` | ขาว clean | ทั้งคู่ |
| `warm` | `warm.css` | ส้มอุ่น | ทั้งคู่ |

---

## สิ่งที่ไม่ควรทำ

| ❌ อย่าทำ | ✅ ทำแทน |
|----------|---------|
| ใส่ `theme-*` บน `<html>` ด้วย script ก่อน hydrate | ใส่บน `.shop-shell` จาก server |
| Import theme CSS ใน `app/layout.tsx` | Import เฉพาะ `(shop)/layout.tsx` |
| ใช้ `bg-slate-900` ทุกปุ่ม | `var(--primary)` หรือ class ใน theme CSS |
| ลบ cookie ใน `RootLayout` | `/api/auth/clear-session` |
| Animation หนักบน mobile | ลด particles ใน `@media (max-width: 639px)` |

---

## อ้างอิงไฟล์ (008 — Luxury)

```
styles/themes/luxury.css
lib/resolveShopTheme.ts
app/(shop)/layout.tsx
components/shop/modules/luxury-hero.tsx
components/shop/theme/luxury-ambient.tsx
components/shop/theme/theme-preview-manager.tsx
lib/siteConfig.ts
app/admin/settings/page.tsx
```

---

*อัปเดตล่าสุด: พฤษภาคม 2026 — Next.js 16.2.6, Tailwind v4*

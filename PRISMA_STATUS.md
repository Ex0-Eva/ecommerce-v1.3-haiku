# Why Prisma is NOT Currently in Use

**Status:** ⏳ **Planned but Not Implemented**  
**Last Updated:** May 27, 2026  
**Current Architecture:** 100% Supabase direct client

---

## 📊 Quick Comparison

| Aspect | Current (Supabase) | Planned (Prisma) |
|--------|-------------------|-----------------|
| **ORM** | ❌ None — Direct client | ✅ Prisma ORM |
| **Database** | ✅ Supabase PostgreSQL | 📋 Vercel PostgreSQL |
| **Access Layer** | `@supabase/supabase-js` | `@prisma/client` |
| **Status** | 🟢 **ACTIVE & WORKING** | 🔴 **NOT IMPLEMENTED** |

---

## 🔍 Evidence That Prisma Is NOT Used

### 1. **No Prisma Code in Actual Application**

Every database query uses **Supabase client**, not Prisma:

```typescript
// ✅ ACTUAL CODE (lib/products.ts)
import { supabaseClient } from "./supabaseClient";

export async function getAllProducts() {
  const { data, error } = await supabaseClient
    .from('v12_products')
    .select('*, v12_product_variants(*)');
  // ↑ Supabase client method
}

// ❌ NEVER SEEN (this would be Prisma):
// import { prisma } from "@/lib/prisma";
// const products = await prisma.product.findMany();
```

### 2. **Prisma ORM Is Not Configured**

- ✅ `package.json` lists `prisma` dependency (v7.8.0)
- ❌ **BUT:** No `prisma/schema.prisma` file defined
- ❌ No `prisma/` folder with schema configuration
- ❌ No Prisma client initialization

### 3. **lib/db.ts Is Just a Stub**

```typescript
// lib/db.ts - INCOMPLETE PLACEHOLDER
export const db = {
  async $transaction(callback: (tx: any) => Promise<any>) {
    return callback(this);
  },
  async product() {
    return null;  // ← Returns null, not implemented
  },
};
```

This file was created but **never completed** — it's a placeholder for future Prisma integration.

---

## 💡 Why Was Prisma Planned?

### Problem: Vendor Lock-in Risk

**Current Supabase setup:**
```
Supabase RLS Policies (Supabase-specific)
    ↓
    ├─ Can only be exported/imported into Supabase
    └─ Changing to other DB = losing all RLS policies
```

**Supabase-specific features that can't be ported:**
- Row Level Security (RLS) policies (PostgreSQL + Supabase-specific auth)
- Supabase real-time subscriptions
- Supabase vector search
- Supabase auth integration

### Solution: Use Prisma ORM

**With Prisma:**
```
Prisma ORM (database-agnostic)
    ↓
    ├─ PostgreSQL (Vercel, AWS RDS, DigitalOcean, etc.)
    ├─ MySQL
    ├─ SQLite
    └─ MongoDB
    
→ Swap database = Change DATABASE_URL, done ✅
→ Move code = No refactoring needed ✅
```

**Prisma Benefits:**
1. **Type-safe queries** — auto-generated from schema
2. **Portable code** — swap database without refactoring
3. **Better control** — manage permissions at app layer, not DB
4. **ORM migrations** — `npx prisma migrate` instead of SQL files

---

## ⏳ Why Wasn't It Implemented?

### 1. **Current Supabase Works Well**

The current Supabase setup is stable:
- RLS policies are working fine
- Cart, orders, products all functional
- No urgent need to refactor

### 2. **High Refactoring Effort**

Migrating from Supabase → Prisma requires:
- Rewrite all database queries (all `lib/*.ts` files)
- Remove RLS policies, add app-level auth checks
- Update all API routes (`app/api/**/*.ts`)
- Test all features after migration
- **Estimate:** 20-30 hours of work

### 3. **No Clear Business Driver**

The project works. Refactoring only makes sense if:
- ✅ Performance issues exist (❌ They don't)
- ✅ Need to switch databases (❌ Not planned)
- ✅ Team prefers ORMs (🤔 Undecided)

### 4. **Decision Still Pending**

See [implementation_plan.md](implementation_plan.md) for details, but the core question remains:

> **"Should we trade the stability of Supabase for the portability of Prisma?"**

---

## 📋 What Would Migration Look Like?

If the decision is made to proceed, here's the rough plan:

### Phase 1: Setup (2-3 hours)
```bash
pnpm add prisma @prisma/client @next-auth/prisma-adapter
npx prisma init --datasource-provider postgresql
```

### Phase 2: Schema (3-4 hours)
```prisma
// prisma/schema.prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  price         Decimal  @db.Decimal(10, 2)
  stock         Int
  isActive      Boolean  @default(true)
  variants      ProductVariant[]
  orders        OrderItem[]
}

model ProductVariant {
  id       String  @id @default(cuid())
  product  Product @relation(fields: [productId], references: [id])
  productId String
  label    String
  price    Decimal @db.Decimal(10, 2)
  stock    Int
}
```

### Phase 3: Code Migration (15-20 hours)
**Before (Supabase):**
```typescript
const { data } = await supabaseClient
  .from('products')
  .select('*')
  .eq('id', productId);
```

**After (Prisma):**
```typescript
const data = await prisma.product.findUnique({
  where: { id: productId }
});
```

### Phase 4: Auth & Permissions (5-7 hours)
Move permission checks from RLS policies → application code:
```typescript
// Before: RLS policy handles this
// After: Check explicitly in API
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 🎯 Recommendation

**Current Status:** ✅ Keep Supabase as-is

**Reasons:**
1. System is working well
2. Supabase RLS is a feature, not a limitation
3. Refactoring effort is high for low return
4. Can always migrate later if needed

**Only migrate to Prisma if:**
- You need to switch databases (unlikely)
- Performance issues arise (unlikely with Supabase)
- Team strongly prefers ORM patterns
- Hiring new devs who know Prisma better than Supabase

---

## 📚 Related Files

- [AGENTS.md](AGENTS.md) — Current architecture docs (Supabase)
- [CONTEXT.md](CONTEXT.md) — Tech stack confirmation (Supabase ✅)
- [implementation_plan.md](implementation_plan.md) — Future migration proposal (not active)
- [DATABASE_SETUP.md](DATABASE_SETUP.md) — Marked as "Future Migration Plan"
- [DOCUMENTATION_STATUS.md](DOCUMENTATION_STATUS.md) — Overview of current vs. planned docs

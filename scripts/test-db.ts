import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  console.log("🔌 Testing Prisma Postgres connection...\n");

  // 1. Raw query — check connected DB
  const versionResult = await db.$queryRaw<[{ version: string }]>`SELECT version()`;
  console.log("✅ Connected:", (versionResult as any)[0].version.split(" ").slice(0, 2).join(" "));

  // 2. Check tables exist
  const tables = await db.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log("\n📋 Tables in DB:");
  (tables as any[]).forEach((t) => console.log("  -", t.table_name));

  // 3. Test each model
  const productCount = await db.product.count();
  const orderCount = await db.order.count();
  const userCount = await db.user.count();
  const siteConfigCount = await db.siteConfig.count();

  console.log("\n📊 Row counts:");
  console.log("  products:", productCount);
  console.log("  orders:", orderCount);
  console.log("  users:", userCount);
  console.log("  site_config:", siteConfigCount);

  console.log("\n✅ All checks passed — Prisma Postgres is working!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

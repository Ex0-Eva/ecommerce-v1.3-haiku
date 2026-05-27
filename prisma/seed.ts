import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Admin User ───
  const adminEmail = "admin@example.com";
  const adminExists = await db.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    await db.user.create({
      data: {
        id: "admin1",
        name: "Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash("admin1234", 10),
        role: "admin",
      },
    });
    console.log("✅ Admin user created");
    console.log("   email:    admin@example.com");
    console.log("   password: admin1234");
  } else {
    console.log("⏭️  Admin user already exists");
  }

  // ─── Demo User ───
  const demoEmail = "demo@example.com";
  const demoExists = await db.user.findUnique({ where: { email: demoEmail } });

  if (!demoExists) {
    await db.user.create({
      data: {
        id: "demo1",
        name: "Demo User",
        email: demoEmail,
        passwordHash: await bcrypt.hash("demo1234", 10),
        role: "user",
      },
    });
    console.log("✅ Demo user created");
    console.log("   email:    demo@example.com");
    console.log("   password: demo1234");
  } else {
    console.log("⏭️  Demo user already exists");
  }

  // ─── Site Config ───
  const configExists = await db.siteConfig.findFirst();
  if (!configExists) {
    await db.siteConfig.create({
      data: {
        storeName: "Next E-commerce",
        themeName: "modern",
        primaryColor: "#0f172a",
        secondaryColor: "#64748b",
        fontFamily: "Inter, sans-serif",
        borderRadius: "1.5rem",
        faqContent: "ยังไม่มีข้อมูล FAQ",
        shippingContent: "ยังไม่มีข้อมูลนโยบายการจัดส่ง",
        contactContent: "ยังไม่มีข้อมูลติดต่อเรา",
      },
    });
    console.log("✅ Site config created");
  } else {
    console.log("⏭️  Site config already exists");
  }

  // ─── Sample Products ───
  const productCount = await db.product.count();
  if (productCount === 0) {
    await db.product.createMany({
      data: [
        {
          name: "สินค้าสำหรับลองระบบ",
          description: "คำอธิบายสินค้าเบื้องต้น",
          price: 1290,
          stock: 12,
          productType: "physical",
        },
        {
          name: "สินค้าแนะนำ",
          description: "สินค้าที่ลูกค้าชื่นชอบมากที่สุด",
          price: 1890,
          stock: 4,
          productType: "physical",
        },
        {
          name: "E-commerce Template",
          description: "Next.js Template สำหรับทำเว็บขายของ",
          price: 4900,
          stock: 999,
          productType: "digital",
          digitalFileUrl: "https://example.com/download/template.zip",
        },
      ],
    });
    console.log("✅ Sample products created (3)");
  } else {
    console.log(`⏭️  Products already exist (${productCount})`);
  }

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
try {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) in .env before seeding.",
    );
  const passwordHash = await argon2.hash(password);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, active: true },
    create: { email, passwordHash },
  });
  await prisma.businessSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  const existing = await prisma.product.count();
  if (!existing)
    await prisma.product.create({
      data: {
        id: "prod-dgold-chali-500",
        name: "D GOLD Premium Chali Cut Supari",
        tagline: "Premium taste. Pure satisfaction.",
        description:
          "Selected premium arecanuts, hygienically processed and precision chali-cut into uniform pieces.",
        highlights: [
          "100% Natural Arecanut",
          "No Added Preservatives",
          "No Artificial Flavours",
          "Hygienically Processed",
          "FSSAI Lic. 21226172000535",
        ],
        available: true,
        packs: {
          create: [
            {
              id: "pack-500",
              label: "500 g Pouch",
              grams: 500,
              price: null,
              trackStock: false,
              stock: 0,
            },
          ],
        },
      },
    });
  console.log("D GOLD seed completed.");
} finally {
  await prisma.$disconnect();
}

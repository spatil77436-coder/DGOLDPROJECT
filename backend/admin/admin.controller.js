import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/ApiResponse.js";
import { prisma } from "../config/database.js";
export const dashboard = asyncHandler(async (_req, res) => {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "main" },
  });
  const threshold = settings?.lowStockThreshold ?? 10;
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalProducts,
    totalRetailers,
    lowStock,
    orders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.product.count({ where: { available: true } }),
    prisma.retailer.count(),
    prisma.productPack.findMany({
      where: { trackStock: true, stock: { lte: threshold } },
      include: { product: true },
    }),
    prisma.order.findMany({
      where: { status: "delivered", total: { not: null } },
      select: { total: true },
    }),
  ]);
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  ok(res, {
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalProducts,
    totalRetailers,
    revenue,
    lowStock,
  });
});

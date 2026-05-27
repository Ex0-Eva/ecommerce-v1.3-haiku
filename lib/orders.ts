import { db } from "./db";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product_type?: "physical" | "digital";
  digital_file_url?: string;
  license_key?: string;
  variantId?: string;
  variantLabel?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: ShippingAddress;
};

// ---------------------------------------------------------------------------
// Create Order
// ---------------------------------------------------------------------------

export async function createOrder(payload: {
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  userId?: string;
  shippingAddress?: ShippingAddress;
  status?: "pending" | "paid";
  stripeSessionId?: string;
  openNodeChargeId?: string;
  lnbitsCheckingId?: string;
}): Promise<Order> {
  const total = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const status = payload.status ?? "paid";

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: payload.userId ?? null,
        customerName: payload.customerName ?? null,
        customerEmail: payload.customerEmail ?? null,
        shippingAddress: payload.shippingAddress ?? undefined,
        total,
        status,
        stripeSessionId: payload.stripeSessionId ?? null,
        opennodeChargeId: payload.openNodeChargeId ?? null,
        lnbitsCheckingId: payload.lnbitsCheckingId ?? null,
      },
    });

    const orderItemsData = await Promise.all(
      payload.items.map(async (item) => {
        let licenseKey: string | null = null;

        if (status === "paid" && item.product_type === "digital" && !item.license_key) {
          const key = await tx.licenseKey.findFirst({
            where: { productId: item.id, isUsed: false },
          });
          if (key) {
            await tx.licenseKey.update({
              where: { id: key.id },
              data: { isUsed: true, orderId: newOrder.id },
            });
            licenseKey = key.keyValue;
          }
        }

        return {
          orderId: newOrder.id,
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          quantity: item.quantity,
          licenseKey: licenseKey ?? item.license_key ?? null,
          variantId: item.variantId ?? null,
          variantLabel: item.variantLabel ?? null,
        };
      })
    );

    await tx.orderItem.createMany({ data: orderItemsData });

    // Decrement stock for paid orders
    if (status === "paid") {
      for (const item of payload.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else if (item.product_type !== "digital") {
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    return newOrder;
  });

  return {
    id: order.id,
    items: payload.items,
    total,
    status: order.status as Order["status"],
    createdAt: order.createdAt.toISOString(),
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    shippingAddress: payload.shippingAddress,
  };
}

// ---------------------------------------------------------------------------
// Get Order by ID
// ---------------------------------------------------------------------------

export async function getOrderById(orderId: string): Promise<Order | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) return null;

  return {
    id: order.id,
    items: order.orderItems.map((item) => ({
      id: item.productId ?? "",
      name: item.productName,
      price: Number(item.productPrice),
      quantity: item.quantity,
      license_key: item.licenseKey ?? undefined,
      variantId: item.variantId ?? undefined,
      variantLabel: item.variantLabel ?? undefined,
    })),
    total: Number(order.total),
    status: order.status as Order["status"],
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName ?? undefined,
    customerEmail: order.customerEmail ?? undefined,
    shippingAddress: order.shippingAddress as ShippingAddress | undefined,
  };
}

// ---------------------------------------------------------------------------
// Get All Orders
// ---------------------------------------------------------------------------

export async function getAllOrders(): Promise<Order[]> {
  const orders = await db.order.findMany({
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    items: order.orderItems.map((item) => ({
      id: item.productId ?? "",
      name: item.productName,
      price: Number(item.productPrice),
      quantity: item.quantity,
      license_key: item.licenseKey ?? undefined,
      variantId: item.variantId ?? undefined,
      variantLabel: item.variantLabel ?? undefined,
    })),
    total: Number(order.total),
    status: order.status as Order["status"],
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName ?? undefined,
    customerEmail: order.customerEmail ?? undefined,
    shippingAddress: order.shippingAddress as ShippingAddress | undefined,
  }));
}

// ---------------------------------------------------------------------------
// Shared fulfillment logic
// ---------------------------------------------------------------------------

async function _fulfillOrderItems(orderId: string) {
  const orderItems = await db.orderItem.findMany({ where: { orderId } });

  for (const item of orderItems) {
    if (!item.productId) continue;

    const product = await db.product.findUnique({
      where: { id: item.productId },
      select: { productType: true, licenseKeyRequired: true },
    });

    if (product?.productType === "digital" && product?.licenseKeyRequired) {
      const key = await db.licenseKey.findFirst({
        where: { productId: item.productId, isUsed: false },
      });
      if (key) {
        await db.licenseKey.update({
          where: { id: key.id },
          data: { isUsed: true, orderId },
        });
        await db.orderItem.update({
          where: { id: item.id },
          data: { licenseKey: key.keyValue },
        });
      }
    }

    if (item.variantId) {
      await db.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    } else if (product?.productType !== "digital") {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }
}

export async function fulfillOrder(stripeSessionId: string) {
  const order = await db.order.findFirst({ where: { stripeSessionId } });
  if (!order) throw new Error(`Order not found for Stripe session: ${stripeSessionId}`);
  if (order.status === "paid") return { id: order.id, alreadyFulfilled: true };

  await _fulfillOrderItems(order.id);
  await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
  return { id: order.id, alreadyFulfilled: false };
}

export async function fulfillOrderByOpenNode(openNodeChargeId: string) {
  const order = await db.order.findFirst({ where: { opennodeChargeId: openNodeChargeId } });
  if (!order) throw new Error(`Order not found for OpenNode charge: ${openNodeChargeId}`);
  if (order.status === "paid") return { id: order.id, alreadyFulfilled: true };

  await _fulfillOrderItems(order.id);
  await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
  return { id: order.id, alreadyFulfilled: false };
}

export async function fulfillOrderByLNbits(lnbitsCheckingId: string) {
  const order = await db.order.findFirst({ where: { lnbitsCheckingId } });
  if (!order) throw new Error(`Order not found for LNbits checking_id: ${lnbitsCheckingId}`);
  if (order.status === "paid") return { id: order.id, alreadyFulfilled: true };

  await _fulfillOrderItems(order.id);
  await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
  return { id: order.id, alreadyFulfilled: false };
}

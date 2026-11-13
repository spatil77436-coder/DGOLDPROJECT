import { apiRequest } from "./api";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface Pack {
  id: string;
  label: string;
  grams: number;
  price: number | null;
  trackStock: boolean;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  image: string | null;
  available: boolean;
  packs: Pack[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  packId: string;
  packLabel: string;
  grams: number;
  unitPrice: number | null;
  qty: number;
}

export interface Order {
  id: string;
  backendId?: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    area: string;
    address: string;
    pin: string;
  };
  item: OrderItem;
  deliveryDate: string;
  slot: string;
  instructions?: string;
  total: number | null;
  history: { status: OrderStatus; at: string }[];
}

export interface Settings {
  phone: string;
  whatsapp: string;
  email: string;
  unitAddress: string;
  slots: string[];
  lowStockThreshold: number;
  deliveryNote: string;
  extraPins: string[];
  blockedPins: string[];
}

export interface AdminRecord {
  email: string;
}

export interface StockLog {
  id: string;
  at: string;
  productId: string;
  productName: string;
  packLabel: string;
  delta: number;
  balance: number;
  note: string;
}

export const DEFAULT_SETTINGS: Settings = {
  phone: "6366745687",
  whatsapp: "6366745687",
  email: "dgoldsupari@gmail.com",
  unitAddress:
    "Keregundi Road, Nehru Nagar, New Market Yard, Sirsi, Uttara Kannada, Karnataka - 581402",
  slots: ["10 AM - 1 PM", "1 PM - 4 PM", "4 PM - 8 PM"],
  lowStockThreshold: 10,
  deliveryNote:
    "Direct doorstep delivery to your pan shop, anywhere within Bengaluru. Outside Bengaluru we cannot deliver yet.",
  extraPins: [],
  blockedPins: [],
};

type BackendProduct = Omit<Product, "createdAt"> & { createdAt: string };
type BackendOrder = {
  id?: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string;
  slot: string;
  productName: string;
  packLabel: string;
  grams: number;
  quantity: number;
  total: number | null;
  instructions?: string | null;
  retailer?: Order["customer"];
  history: { status: OrderStatus; createdAt: string }[];
};

function mapProduct(product: BackendProduct): Product {
  return { ...product, createdAt: new Date(product.createdAt).toISOString() };
}

function mapOrder(order: BackendOrder, fallback?: Partial<Order>): Order {
  return {
    id: order.orderNumber,
    backendId: order.id,
    createdAt: order.createdAt,
    status: order.status,
    customer: order.retailer ?? fallback?.customer ?? {
      name: "",
      phone: "",
      area: "",
      address: "",
      pin: "",
    },
    item: {
      productId: fallback?.item?.productId ?? "",
      productName: order.productName,
      packId: fallback?.item?.packId ?? "",
      packLabel: order.packLabel,
      grams: order.grams,
      unitPrice: fallback?.item?.unitPrice ?? null,
      qty: order.quantity,
    },
    deliveryDate: order.deliveryDate,
    slot: order.slot,
    instructions: order.instructions ?? fallback?.instructions,
    total: order.total,
    history: order.history.map((entry) => ({
      status: entry.status,
      at: entry.createdAt,
    })),
  };
}

const listeners = new Set<() => void>();
export function onDataChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function notify() {
  listeners.forEach((listener) => listener());
}

export function initDb(): Promise<void> {
  return Promise.resolve();
}

export const db = {
  async getSettings(): Promise<Settings> {
    const settings = await apiRequest<Settings>("/settings/public");
    return { ...DEFAULT_SETTINGS, ...settings };
  },
  async saveSettings(settings: Settings) {
    await apiRequest<Settings>("/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
    notify();
  },

  async getProducts(): Promise<Product[]> {
    const products = await apiRequest<BackendProduct[]>("/products");
    return products.map(mapProduct);
  },
  async saveProduct(product: Product) {
    const { createdAt, ...data } = product;
    await apiRequest(`/products${product.id ? `/${encodeURIComponent(product.id)}` : ""}`, {
      method: product.id ? "PATCH" : "POST",
      body: JSON.stringify({ ...data, ...(product.id ? {} : { createdAt }) }),
    });
    notify();
  },
  async deleteProduct(id: string) {
    await apiRequest(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    notify();
  },

  async getOrders(): Promise<Order[]> {
    const result = await apiRequest<{ items: BackendOrder[] }>("/orders?limit=100");
    return result.items.map((order) => mapOrder(order));
  },
  async getOrder(orderNumber: string, phone?: string): Promise<Order | null> {
    if (!phone) return null;
    try {
      const order = await apiRequest<BackendOrder>(
        `/orders/track/${encodeURIComponent(orderNumber.toUpperCase())}?phone=${encodeURIComponent(phone)}`
      );
      return mapOrder(order);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Order not found")) return null;
      throw error;
    }
  },
  async addOrder(order: Order): Promise<Order> {
    const created = await apiRequest<BackendOrder & { trackingToken: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        customer: order.customer,
        item: order.item,
        deliveryDate: order.deliveryDate,
        slot: order.slot,
        instructions: order.instructions,
      }),
    });
    const saved = mapOrder(created, order);
    notify();
    return saved;
  },
  async updateOrder(order: Order) {
    await apiRequest(`/orders/${encodeURIComponent(order.backendId ?? order.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: order.status,
        note: order.history.at(-1)?.status === order.status ? "Updated by admin" : undefined,
      }),
    });
    notify();
  },

  async getStockLogs(): Promise<StockLog[]> {
    const logs = await apiRequest<Array<{
      id: string;
      createdAt: string;
      productId: string;
      packId: string;
      delta: number;
      balance: number;
      note: string;
      product: { name: string };
      pack?: { label: string };
    }>>("/inventory/movements?limit=60");
    return logs.map((log) => ({
      id: log.id,
      at: log.createdAt,
      productId: log.productId,
      productName: log.product.name,
      packLabel: log.pack?.label ?? log.packId,
      delta: log.delta,
      balance: log.balance,
      note: log.note,
    }));
  },
  async addStockLog(_log: StockLog) {
    // Stock logs are created transactionally by the backend booking/adjustment APIs.
    notify();
  },

  async getAdmin(): Promise<AdminRecord | null> {
    try {
      const result = await apiRequest<{ admin: AdminRecord }>("/auth/me");
      return result.admin;
    } catch {
      return null;
    }
  },
  async createAdmin(): Promise<void> {
    throw new Error("Create the admin account with prisma/seed.js and ADMIN_EMAIL/ADMIN_PASSWORD.");
  },
  async verifyAdmin(email: string, password: string): Promise<boolean> {
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return true;
    } catch {
      return false;
    }
  },
  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    await apiRequest("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return true;
  },
};

const SESSION_KEY = "dgold_admin_session";
export function startSession() {
  sessionStorage.setItem(SESSION_KEY, "active");
}
export function hasSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "active";
}
export function endSession() {
  sessionStorage.removeItem(SESSION_KEY);
  void apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
}

export function uid(prefix = ""): string {
  return prefix + crypto.randomUUID();
}

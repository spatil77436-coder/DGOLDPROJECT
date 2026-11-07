/* ------------------------------------------------------------------
   D GOLD data layer.
   Persistence: IndexedDB (with localStorage fallback) so the storefront
   and the admin dashboard read/write the SAME database in this browser.
   A hosted server API is not available in this environment — this module
   is the single swap-point for a real backend later.
------------------------------------------------------------------- */

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
  price: number | null; // null => price confirmed on call (never invented)
  trackStock: boolean;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  image: string | null; // real photo (data URL) uploaded by admin
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
  salt: string;
  hash: string;
  iterations: number;
  createdAt: string;
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

/* ----------------------------- engine ----------------------------- */

const DB_NAME = "dgold_store_v2";
const DB_VERSION = 1;
const STORES = ["kv", "products", "orders", "stockLogs"] as const;
type StoreName = (typeof STORES)[number];

let idb: IDBDatabase | null = null;
let idbFailed = false;

function openIdb(): Promise<IDBDatabase | null> {
  if (idb) return Promise.resolve(idb);
  if (idbFailed || typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        STORES.forEach((s) => {
          if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: "id" });
        });
      };
      req.onsuccess = () => {
        idb = req.result;
        resolve(idb);
      };
      req.onerror = () => {
        idbFailed = true;
        resolve(null);
      };
    } catch {
      idbFailed = true;
      resolve(null);
    }
  });
}

function lsKey(store: StoreName) {
  return `${DB_NAME}:${store}`;
}
function lsRead(store: StoreName): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(lsKey(store)) || "[]");
  } catch {
    return [];
  }
}
function lsWrite(store: StoreName, rows: Record<string, unknown>[]) {
  try {
    localStorage.setItem(lsKey(store), JSON.stringify(rows));
  } catch {
    /* quota — ignore */
  }
}

async function put(store: StoreName, value: { id: string }): Promise<void> {
  const d = await openIdb();
  if (!d) {
    const rows = lsRead(store).filter((r) => r.id !== value.id);
    rows.push(value as unknown as Record<string, unknown>);
    lsWrite(store, rows);
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAll<T>(store: StoreName): Promise<T[]> {
  const d = await openIdb();
  if (!d) return lsRead(store) as T[];
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function getOne<T>(store: StoreName, id: string): Promise<T | null> {
  const d = await openIdb();
  if (!d) return (lsRead(store).find((r) => r.id === id) as T) ?? null;
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, "readonly").objectStore(store).get(id);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function remove(store: StoreName, id: string): Promise<void> {
  const d = await openIdb();
  if (!d) {
    lsWrite(store, lsRead(store).filter((r) => r.id !== id));
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ------------------------- change broadcast ------------------------ */

let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel("dgold-sync");
} catch {
  channel = null;
}

const localListeners = new Set<() => void>();

export function onDataChange(fn: () => void): () => void {
  localListeners.add(fn);
  const handler = () => fn();
  channel?.addEventListener("message", handler);
  return () => {
    localListeners.delete(fn);
    channel?.removeEventListener("message", handler);
  };
}

function notify() {
  /* same-page subscribers (BroadcastChannel never echoes to the sender) */
  localListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* subscriber error — keep notifying others */
    }
  });
  /* other tabs */
  try {
    channel?.postMessage("changed");
  } catch {
    /* closed */
  }
}

export function uid(prefix = ""): string {
  return (
    prefix +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

/* ------------------------------ seeds ------------------------------ */

export const DEFAULT_SETTINGS: Settings = {
  phone: "6366745687",
  whatsapp: "6366745687",
  email: "dgoldsupari@gmail.com",
  unitAddress:
    "Keregundi Road, Nehru Nagar, New Market Yard, Sirsi, Uttara Kannada, Karnataka – 581402",
  slots: ["10 AM – 1 PM", "1 PM – 4 PM", "4 PM – 8 PM"],
  lowStockThreshold: 10,
  deliveryNote:
    "Direct doorstep delivery to your pan shop, anywhere within Bengaluru. Outside Bengaluru we cannot deliver yet.",
  extraPins: [],
  blockedPins: [],
};

const SEED_PRODUCT: Product = {
  id: "prod-dgold-chali-500",
  name: "D GOLD Premium Chali Cut Supari",
  tagline: "Premium taste. Pure satisfaction.",
  description:
    "Selected premium arecanuts, hygienically processed and precision chali-cut into uniform pieces. 100% natural arecanut with no added preservatives and no artificial flavours — sealed in a freshness-locked 500g pouch.",
  highlights: [
    "100% Natural Arecanut",
    "No Added Preservatives",
    "No Artificial Flavours",
    "Hygienically Processed",
    "Best Before 6 Months",
    "FSSAI Lic. 21226172000535",
  ],
  image: null,
  available: true,
  packs: [
    {
      id: "pack-500",
      label: "500 g Pouch",
      grams: 500,
      price: null,
      trackStock: false,
      stock: 0,
    },
  ],
  createdAt: new Date().toISOString(),
};

let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const settings = await getOne<Settings & { id: string }>("kv", "settings");
      if (!settings) await put("kv", { id: "settings", ...DEFAULT_SETTINGS });
      const products = await getAll<Product>("products");
      if (products.length === 0) await put("products", { ...SEED_PRODUCT });
    })();
  }
  return initPromise;
}

/* ------------------------------- api ------------------------------- */

export const db = {
  async getSettings(): Promise<Settings> {
    await initDb();
    const s = await getOne<Settings & { id: string }>("kv", "settings");
    return { ...DEFAULT_SETTINGS, ...(s ?? {}), phone: s?.phone || DEFAULT_SETTINGS.phone };
  },
  async saveSettings(s: Settings) {
    await put("kv", { id: "settings", ...s });
    notify();
  },

  async getProducts(): Promise<Product[]> {
    await initDb();
    const list = await getAll<Product>("products");
    return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async saveProduct(p: Product) {
    await put("products", { ...p });
    notify();
  },
  async deleteProduct(id: string) {
    await remove("products", id);
    notify();
  },

  async getOrders(): Promise<Order[]> {
    await initDb();
    const list = await getAll<Order>("orders");
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrder(id: string): Promise<Order | null> {
    return getOne<Order>("orders", id.toUpperCase());
  },
  async addOrder(o: Order) {
    await put("orders", { ...o });
    notify();
  },
  async updateOrder(o: Order) {
    await put("orders", { ...o });
    notify();
  },

  async getStockLogs(): Promise<StockLog[]> {
    const list = await getAll<StockLog>("stockLogs");
    return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 60);
  },
  async addStockLog(l: StockLog) {
    await put("stockLogs", { ...l });
    notify();
  },

  /* ------------------------- admin auth ------------------------- */

  async getAdmin(): Promise<AdminRecord | null> {
    await initDb();
    return getOne<AdminRecord & { id: string }>("kv", "admin");
  },

  async createAdmin(email: string, password: string): Promise<void> {
    const salt = randomHex(16);
    const iterations = 120000;
    const hash = await pbkdf2(password, salt, iterations);
    const rec: AdminRecord & { id: string } = {
      id: "admin",
      email: email.trim().toLowerCase(),
      salt,
      hash,
      iterations,
      createdAt: new Date().toISOString(),
    };
    await put("kv", rec);
    notify();
  },

  async verifyAdmin(email: string, password: string): Promise<boolean> {
    const rec = await db.getAdmin();
    if (!rec) return false;
    if (rec.email !== email.trim().toLowerCase()) return false;
    const hash = await pbkdf2(password, rec.salt, rec.iterations);
    return timingSafeEqual(hash, rec.hash);
  },

  async changeAdminPassword(currentPw: string, newPw: string): Promise<boolean> {
    const rec = await db.getAdmin();
    if (!rec) return false;
    const ok = await db.verifyAdmin(rec.email, currentPw);
    if (!ok) return false;
    await db.createAdmin(rec.email, newPw);
    return true;
  },
};

/* --------------------------- crypto utils -------------------------- */

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(password: string, saltHex: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------- sessions ----------------------------- */

const SESSION_KEY = "dgold_admin_session";
const SESSION_HOURS = 8;

export function startSession() {
  const token = randomHex(24);
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ token, exp: Date.now() + SESSION_HOURS * 3600_000 })
  );
}

export function hasSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw) as { token: string; exp: number };
    if (!s.token || Date.now() > s.exp) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function endSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
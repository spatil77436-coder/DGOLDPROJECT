import type { Order, Settings } from "./db";

export const OUT_OF_AREA_MESSAGE =
  "Sorry! D GOLD currently delivers only within Bengaluru.";

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export function isBengaluruPin(pin: string, settings?: Pick<Settings, "extraPins" | "blockedPins">): boolean {
  const p = pin.trim();
  if (!/^\d{6}$/.test(p)) return false;
  if (settings?.blockedPins?.includes(p)) return false;
  if (settings?.extraPins?.includes(p)) return true;
  // Bengaluru Urban PIN series is 560xxx. Rural/other districts (561xxx/562xxx…) are excluded.
  return /^560\d{3}$/.test(p);
}

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function waLink(number: string, text: string): string {
  return `https://wa.me/91${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function orderWaText(order: Order): string {
  const lines = [
    `Hello D GOLD! I've placed a booking.`,
    `Order ID: ${order.id}`,
    `Product: ${order.item.productName} — ${order.item.packLabel} × ${order.item.qty}`,
    order.total != null ? `Total: ${inr(order.total)}` : `Total: to be confirmed on call`,
    `Deliver to: ${order.customer.area}, Bengaluru – ${order.customer.pin}`,
    `Preferred: ${fmtDate(order.deliveryDate)}, ${order.slot}`,
    `Please confirm my order. Thank you!`,
  ];
  return lines.join("\n");
}

export function sanitizeText(v: string, max = 400): string {
  return v.replace(/[<>]/g, "").trim().slice(0, max);
}

export function fileToDataUrl(file: File, maxDim = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file (JPG or PNG)."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Image is too large — please use a file under 8 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function exportOrdersCsv(orders: Order[]) {
  const headers = [
    "Order ID", "Placed On", "Status", "Customer", "Phone", "Area", "Address", "PIN",
    "Product", "Pack", "Qty", "Unit Price", "Total", "Delivery Date", "Slot", "Instructions",
  ];
  const esc = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = orders.map((o) =>
    [
      o.id, fmtDateTime(o.createdAt), o.status, o.customer.name, o.customer.phone,
      o.customer.area, o.customer.address, o.customer.pin, o.item.productName,
      o.item.packLabel, o.item.qty, o.item.unitPrice ?? "On call", o.total ?? "On call",
      o.deliveryDate, o.slot, o.instructions ?? "",
    ].map(esc).join(",")
  );
  const csv = [headers.map(esc).join(","), ...rows].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dgold-orders-${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
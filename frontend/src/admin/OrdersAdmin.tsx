import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, X, Phone, MessageCircle, MapPin, Calendar, StickyNote,
  ChevronRight, Package, ClipboardList, Undo2,
} from "lucide-react";
import {
  db, ORDER_FLOW, STATUS_LABEL, type Order, type OrderStatus,
} from "../lib/db";
import { inr, fmtDate, fmtDateTime, exportOrdersCsv, waLink } from "../lib/helpers";
import { StatusPill } from "../components/ui";
import { useStore } from "../context/StoreContext";
import { cn } from "../utils/cn";

const FILTERS: ("all" | OrderStatus)[] = ["all", "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

export default function OrdersAdmin({ orders, reload }: { orders: Order[]; reload: () => Promise<void> }) {
  const { toast, settings } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      const d = o.createdAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.area.toLowerCase().includes(q)
      );
    });
  }, [orders, query, filter, from, to]);

  const current = selected ? orders.find((o) => o.id === selected.id) ?? selected : null;

  const setStatus = async (o: Order, status: OrderStatus) => {
    setBusyId(o.id);
    try {
      const updated: Order = {
        ...o,
        status,
        history: [...o.history.filter((h) => h.status !== status), { status, at: new Date().toISOString() }],
      };
      await db.updateOrder(updated);
      await reload();
      toast(`Order ${o.id} → ${STATUS_LABEL[status]}`, status === "cancelled" ? "info" : "success");
    } catch {
      toast("Could not update the order.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const nextStatus = (s: OrderStatus): OrderStatus | null => {
    const i = ORDER_FLOW.indexOf(s);
    return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null;
  };

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Order ID, name, phone or area…" className="field !pl-10" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field !w-auto [color-scheme:dark] text-xs" aria-label="From date" />
          <span className="text-emerald-100/40 text-xs">→</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field !w-auto [color-scheme:dark] text-xs" aria-label="To date" />
          <button
            onClick={() => { exportOrdersCsv(filtered); toast(`Exported ${filtered.length} orders to CSV.`, "success"); }}
            disabled={filtered.length === 0}
            className="btn-gold !py-2.5 text-sm disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors",
              filter === f ? "bg-gradient-gold text-emerald-950 border-gold-400" : "border-white/10 text-emerald-100/60 hover:text-white hover:border-white/25"
            )}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
            <span className="ml-1.5 opacity-70">
              {f === "all" ? orders.length : orders.filter((o) => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-emerald-950/70 border border-white/8 py-20 text-center">
          <ClipboardList className="w-10 h-10 text-emerald-100/25 mx-auto" />
          <p className="mt-4 font-display text-xl font-bold text-white">No orders found</p>
          <p className="text-sm text-emerald-100/45 mt-1">
            {orders.length === 0 ? "Bookings from the website appear here instantly." : "Adjust your search or filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-950/70 border border-white/8 overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr_1.6fr_1fr_0.9fr_0.9fr_auto] gap-3 px-5 py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-emerald-100/40 border-b border-white/8">
            <span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span />
          </div>
          <ul className="divide-y divide-white/6">
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => setSelected(o)}
                  className="w-full grid md:grid-cols-[1.2fr_1.6fr_1fr_0.9fr_0.9fr_auto] grid-cols-2 gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors items-center"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-gold-300">{o.id}</p>
                    <p className="text-[10px] text-emerald-100/45 mt-0.5">{fmtDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-sm font-bold text-white truncate">{o.customer.name}</p>
                    <p className="text-[11px] text-emerald-100/50">{o.customer.area} · {o.customer.pin}</p>
                  </div>
                  <p className="text-xs text-emerald-100/70">{o.item.packLabel} × {o.item.qty}</p>
                  <p className="text-sm font-bold text-white text-right md:text-left">{o.total != null ? inr(o.total) : <span className="text-gold-300/90 text-xs">On call</span>}</p>
                  <div className="col-span-2 md:col-span-1"><StatusPill status={o.status} /></div>
                  <ChevronRight className="w-4 h-4 text-emerald-100/30 hidden md:block" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* detail drawer */}
      <AnimatePresence>
        {current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120]">
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-emerald-900 border-l border-gold-400/25 overflow-y-auto"
              role="dialog"
              aria-label={`Order ${current.id}`}
            >
              <div className="sticky top-0 bg-emerald-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="font-mono text-sm font-bold text-gold-300">{current.id}</p>
                  <p className="text-[11px] text-emerald-100/50">{fmtDateTime(current.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={current.status} />
                  <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-100/70 hover:text-white" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* actions */}
                <div className="flex flex-wrap gap-2">
                  {nextStatus(current.status) && current.status !== "cancelled" && (
                    <button
                      onClick={() => setStatus(current, nextStatus(current.status)!)}
                      disabled={busyId === current.id}
                      className="btn-gold !py-2.5 text-sm disabled:opacity-50"
                    >
                      Mark {STATUS_LABEL[nextStatus(current.status)!]}
                    </button>
                  )}
                  {current.status !== "cancelled" && current.status !== "delivered" && (
                    <button
                      onClick={() => setStatus(current, "cancelled")}
                      disabled={busyId === current.id}
                      className="px-4 py-2.5 rounded-xl border border-rose-400/40 text-rose-300 text-sm font-bold hover:bg-rose-400/10 transition-colors disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  {(current.status === "cancelled" || current.status === "delivered") && (
                    <button
                      onClick={() => setStatus(current, "pending")}
                      disabled={busyId === current.id}
                      className="px-4 py-2.5 rounded-xl border border-white/15 text-emerald-100/70 text-sm font-bold hover:text-white hover:border-white/30 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Undo2 className="w-4 h-4" /> Reopen as Pending
                    </button>
                  )}
                </div>

                {/* customer */}
                <section className="rounded-2xl bg-emerald-950/60 border border-white/8 p-5">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-300/80 mb-3">Customer</h4>
                  <p className="font-bold text-white">{current.customer.name}</p>
                  <a href={`tel:+91${current.customer.phone}`} className="text-sm text-emerald-100/80 hover:text-gold-300 transition-colors">+91 {current.customer.phone}</a>
                  <div className="mt-3 flex items-start gap-2 text-sm text-emerald-100/70">
                    <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>{current.customer.address}, {current.customer.area}, Bengaluru – {current.customer.pin}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <a href={`tel:+91${current.customer.phone}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-gold-400/25 transition-colors">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a
                      href={waLink(current.customer.phone, `Hello ${current.customer.name}! This is D GOLD regarding your order ${current.id} (${current.item.packLabel} × ${current.item.qty}). `)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/25 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </section>

                {/* order */}
                <section className="rounded-2xl bg-emerald-950/60 border border-white/8 p-5">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-300/80 mb-3">Order</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-emerald-950" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{current.item.productName}</p>
                      <p className="text-xs text-emerald-100/60">{current.item.packLabel} × {current.item.qty}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/[0.03] border border-white/8 px-3.5 py-2.5">
                      <p className="text-[10px] text-emerald-100/45 uppercase tracking-wider font-bold">Unit Price</p>
                      <p className="font-bold text-white mt-0.5">{current.item.unitPrice != null ? inr(current.item.unitPrice) : "On call"}</p>
                    </div>
                    <div className="rounded-xl bg-gold-400/10 border border-gold-400/30 px-3.5 py-2.5">
                      <p className="text-[10px] text-gold-300/70 uppercase tracking-wider font-bold">Total</p>
                      <p className="font-bold text-gold-300 mt-0.5">{current.total != null ? inr(current.total) : "On call"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-100/70">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    {fmtDate(current.deliveryDate)} · {current.slot}
                  </div>
                  {current.instructions && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-emerald-100/60 italic">
                      <StickyNote className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                      "{current.instructions}"
                    </div>
                  )}
                </section>

                {/* timeline */}
                <section className="rounded-2xl bg-emerald-950/60 border border-white/8 p-5">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-300/80 mb-3">History</h4>
                  <ul className="space-y-2.5">
                    {[...current.history].reverse().map((h, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 text-sm">
                        <StatusPill status={h.status} />
                        <span className="text-[11px] text-emerald-100/45">{fmtDateTime(h.at)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <p className="text-[10px] text-emerald-100/35 leading-relaxed">
                  Tip: WhatsApp opens a pre-filled message to the customer — use it to send booking updates.
                  Automated SMS is not connected. Business line: +91 {settings.phone}.
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
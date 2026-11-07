import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackageSearch, Search, MessageCircle, PhoneCall } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { db, ORDER_FLOW, STATUS_LABEL, type Order } from "../lib/db";
import { fmtDateTime, fmtDate, inr, isValidPhone, waLink } from "../lib/helpers";
import { StatusPill, Spinner } from "./ui";
import { cn } from "../utils/cn";

export default function TrackOrder() {
  const { trackOpen, setTrackOpen, settings } = useStore();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = trackOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTrackOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [trackOpen, setTrackOpen]);

  const lookup = async () => {
    setError("");
    setOrder(null);
    if (!orderId.trim() || !isValidPhone(phone)) {
      setError("Enter your Order ID and the 10-digit mobile number used at booking.");
      return;
    }
    setLoading(true);
    try {
      const o = await db.getOrder(orderId.trim().toUpperCase());
      if (!o || o.customer.phone !== phone.trim()) {
        setError("No booking found for this Order ID and mobile number combination.");
        return;
      }
      setOrder(o);
    } catch {
      setError("Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reachedIndex = order
    ? order.status === "cancelled"
      ? -1
      : ORDER_FLOW.indexOf(order.status)
    : -1;

  return (
    <AnimatePresence>
      {trackOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-5" role="dialog" aria-modal="true" aria-label="Track your order">
          <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-md" onClick={() => setTrackOpen(false)} />
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 27, stiffness: 300 }}
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-emerald-900 border border-gold-400/25 shadow-2xl"
          >
            <div className="sticky top-0 z-10 bg-emerald-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <PackageSearch className="w-5 h-5 text-emerald-950" />
                </div>
                <h2 className="font-display text-xl font-bold text-white">Track Your Order</h2>
              </div>
              <button onClick={() => setTrackOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-100/70 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-3.5">
                <div>
                  <label className="lbl">Order ID</label>
                  <input className="field font-mono uppercase tracking-wider" value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} placeholder="DG-XXXXXXXX" />
                </div>
                <div>
                  <label className="lbl">Mobile Number</label>
                  <input className="field" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Number used at booking" />
                </div>
                {error && <p className="err">{error}</p>}
                <button onClick={lookup} disabled={loading} className="btn-gold w-full py-3.5 disabled:opacity-60">
                  {loading ? <Spinner /> : <><Search className="w-4 h-4" /> Track Order</>}
                </button>
              </div>

              <AnimatePresence>
                {order && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-emerald-950/60 border border-gold-400/25 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-gold-300">{order.id}</p>
                        <p className="text-xs text-emerald-100/55 mt-0.5">Placed {fmtDateTime(order.createdAt)}</p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                    <p className="mt-3 text-sm text-emerald-100/80">
                      {order.item.productName} — {order.item.packLabel} × {order.item.qty}
                      <span className="text-gold-300 font-bold"> · {order.total != null ? inr(order.total) : "Price on call"}</span>
                    </p>
                    <p className="text-xs text-emerald-100/55 mt-1">
                      Delivery: {fmtDate(order.deliveryDate)} · {order.slot} · {order.customer.area}, Bengaluru – {order.customer.pin}
                    </p>

                    {order.status === "cancelled" ? (
                      <p className="mt-4 text-sm font-semibold text-rose-300 bg-rose-400/10 border border-rose-400/30 rounded-xl px-4 py-3">
                        This booking was cancelled. Call us to place a fresh order.
                      </p>
                    ) : (
                      <ol className="mt-5 space-y-0">
                        {ORDER_FLOW.map((s, i) => {
                          const done = i <= reachedIndex;
                          const current = i === reachedIndex;
                          const at = order.history.find((h) => h.status === s)?.at;
                          return (
                            <li key={s} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <span className={cn("w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5",
                                  done ? "bg-gold-400 border-gold-400" : "border-white/25",
                                  current && "ring-4 ring-gold-400/25")} />
                                {i < ORDER_FLOW.length - 1 && <span className={cn("w-0.5 flex-1 min-h-[22px]", i < reachedIndex ? "bg-gold-400/70" : "bg-white/10")} />}
                              </div>
                              <div className="pb-4">
                                <p className={cn("text-sm font-semibold leading-tight", done ? "text-white" : "text-emerald-100/40")}>{STATUS_LABEL[s]}</p>
                                {at && <p className="text-[11px] text-emerald-100/45 mt-0.5">{fmtDateTime(at)}</p>}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}

                    <div className="grid grid-cols-2 gap-2.5 mt-2">
                      <a href={waLink(settings.whatsapp, `Hello D GOLD! Please share an update for my order ${order.id}.`)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-emerald-950 text-sm font-bold hover:brightness-110 transition">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                      <a href={`tel:+91${settings.phone}`} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gold-400/40 text-gold-300 text-sm font-bold hover:bg-gold-400/10 transition-colors">
                        <PhoneCall className="w-4 h-4" /> Call Us
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
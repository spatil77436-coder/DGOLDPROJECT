import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Phone, MessageCircle, ChevronDown, MapPin } from "lucide-react";
import type { Order } from "../lib/db";
import { inr, fmtDate, fmtDateTime, waLink } from "../lib/helpers";
import { StatusPill } from "../components/ui";
import { cn } from "../utils/cn";

interface Customer {
  phone: string;
  name: string;
  area: string;
  pin: string;
  orders: Order[];
  spent: number;
  lastOrder: string;
}

export default function CustomersAdmin({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [openPhone, setOpenPhone] = useState<string | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    orders.forEach((o) => {
      const cur = map.get(o.customer.phone) ?? {
        phone: o.customer.phone,
        name: o.customer.name,
        area: o.customer.area,
        pin: o.customer.pin,
        orders: [],
        spent: 0,
        lastOrder: o.createdAt,
      };
      cur.orders.push(o);
      if (o.status === "delivered" && o.total != null) cur.spent += o.total;
      if (o.createdAt > cur.lastOrder) {
        cur.lastOrder = o.createdAt;
        cur.name = o.customer.name;
        cur.area = o.customer.area;
        cur.pin = o.customer.pin;
      }
      map.set(o.customer.phone, cur);
    });
    return [...map.values()].sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.area.toLowerCase().includes(q)
    );
  }, [customers, query]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/35" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers by name, phone or area…" className="field !pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-emerald-950/70 border border-white/8 py-20 text-center">
          <Users className="w-10 h-10 text-emerald-100/25 mx-auto" />
          <p className="mt-4 font-display text-xl font-bold text-white">
            {customers.length === 0 ? "No customers yet" : "No matching customers"}
          </p>
          <p className="text-sm text-emerald-100/45 mt-1">
            Customers appear automatically when they place their first booking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const open = openPhone === c.phone;
            return (
              <div key={c.phone} className="rounded-2xl bg-emerald-950/70 border border-white/8 overflow-hidden">
                <button onClick={() => setOpenPhone(open ? null : c.phone)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-emerald-950 text-sm font-bold flex-shrink-0">
                    {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-emerald-100/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.area} – {c.pin} · +91 {c.phone}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gold-300">{c.spent > 0 ? inr(c.spent) : "—"}</p>
                    <p className="text-[10px] text-emerald-100/45 uppercase tracking-wider font-bold">Delivered value</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{c.orders.length}</p>
                    <p className="text-[10px] text-emerald-100/45 uppercase tracking-wider font-bold">Orders</p>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-emerald-100/40 transition-transform", open && "rotate-180")} />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-white/6 pt-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <a href={`tel:+91${c.phone}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-gold-400/25 transition-colors">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a href={waLink(c.phone, `Hello ${c.name}! This is D GOLD Supari. `)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/25 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <span className="text-[11px] text-emerald-100/40 self-center">Last order {fmtDateTime(c.lastOrder)}</span>
                        </div>
                        <ul className="divide-y divide-white/6">
                          {c.orders.map((o) => (
                            <li key={o.id} className="py-2.5 flex flex-wrap items-center gap-3 text-sm">
                              <span className="font-mono text-xs font-bold text-gold-300">{o.id}</span>
                              <span className="text-xs text-emerald-100/60 flex-1 min-w-[140px]">
                                {o.item.packLabel} × {o.item.qty} · {fmtDate(o.createdAt)}
                              </span>
                              <span className="text-xs font-bold text-white">{o.total != null ? inr(o.total) : "On call"}</span>
                              <StatusPill status={o.status} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
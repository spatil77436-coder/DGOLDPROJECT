import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Clock, CheckCircle2, PackageCheck, Users, IndianRupee, TrendingUp, ArrowRight,
} from "lucide-react";
import { STATUS_LABEL, type Order, type OrderStatus, type Product } from "../lib/db";
import { inr, fmtDateTime } from "../lib/helpers";
import { StatusPill, STATUS_DOT } from "../components/ui";
import { cn } from "../utils/cn";

type Range = "today" | "7d" | "30d" | "all";

const RANGE_LABEL: Record<Range, string> = {
  today: "Today",
  "7d": "This Week",
  "30d": "This Month",
  all: "All Time",
};

function inRange(o: Order, range: Range): boolean {
  if (range === "all") return true;
  const t = new Date(o.createdAt).getTime();
  const now = new Date();
  if (range === "today") return new Date(o.createdAt).toDateString() === now.toDateString();
  const days = range === "7d" ? 7 : 30;
  return now.getTime() - t <= days * 86400_000;
}

export default function Overview({
  orders,
  products,
  onOpenOrders,
}: {
  orders: Order[];
  products: Product[];
  onOpenOrders: () => void;
}) {
  const [range, setRange] = useState<Range>("7d");

  const scoped = useMemo(() => orders.filter((o) => inRange(o, range)), [orders, range]);

  const stats = useMemo(() => {
    const customers = new Set(orders.map((o) => o.customer.phone)).size;
    const delivered = scoped.filter((o) => o.status === "delivered");
    const revenue = delivered.reduce((s, o) => s + (o.total ?? 0), 0);
    const unpriced = delivered.filter((o) => o.total == null).length;
    return {
      total: scoped.length,
      pending: scoped.filter((o) => o.status === "pending").length,
      confirmed: scoped.filter((o) => o.status === "confirmed" || o.status === "preparing" || o.status === "out_for_delivery").length,
      delivered: delivered.length,
      customers,
      revenue,
      unpriced,
    };
  }, [orders, scoped]);

  /* last 7 days chart */
  const days = useMemo(() => {
    const out: { label: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === key);
      out.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        count: dayOrders.length,
        revenue: dayOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + (o.total ?? 0), 0),
      });
    }
    return out;
  }, [orders]);
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  const statusCounts = useMemo(() => {
    const keys: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    return keys.map((k) => ({ status: k, count: scoped.filter((o) => o.status === k).length }));
  }, [scoped]);
  const statusTotal = Math.max(1, statusCounts.reduce((s, x) => s + x.count, 0));

  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    scoped
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const key = `${o.item.productName} · ${o.item.packLabel}`;
        const cur = map.get(key) ?? { name: key, qty: 0, revenue: 0 };
        cur.qty += o.item.qty;
        cur.revenue += o.total ?? 0;
        map.set(key, cur);
      });
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [scoped]);

  const lowStock = useMemo(
    () =>
      products.flatMap((p) =>
        p.packs
          .filter((pk) => pk.trackStock && pk.stock <= 10)
          .map((pk) => ({ product: p.name, pack: pk.label, stock: pk.stock }))
      ),
    [products]
  );

  const cards = [
    { label: "Total Orders", value: String(stats.total), icon: ClipboardList, tone: "from-emerald-500 to-emerald-700" },
    { label: "Pending", value: String(stats.pending), icon: Clock, tone: "from-amber-400 to-amber-600" },
    { label: "In Progress", value: String(stats.confirmed), icon: CheckCircle2, tone: "from-sky-400 to-blue-600" },
    { label: "Delivered", value: String(stats.delivered), icon: PackageCheck, tone: "from-emerald-400 to-teal-600" },
    { label: "Customers", value: String(stats.customers), icon: Users, tone: "from-violet-400 to-purple-600" },
    { label: "Revenue (Delivered)", value: inr(stats.revenue), icon: IndianRupee, tone: "from-gold-400 to-gold-600", sub: stats.unpriced > 0 ? `+${stats.unpriced} on-call order${stats.unpriced > 1 ? "s" : ""} not counted` : undefined },
  ];

  return (
    <div className="space-y-6">
      {/* range switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-100/60">
          Reports for <strong className="text-gold-300">{RANGE_LABEL[range]}</strong> · computed live from saved orders
        </p>
        <div className="flex gap-1.5">
          {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border",
                range === r ? "bg-gradient-gold text-emerald-950 border-gold-400" : "border-white/10 text-emerald-100/60 hover:text-white hover:border-white/25"
              )}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-emerald-950/70 border border-white/8 p-4">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.tone} flex items-center justify-center mb-3`}>
              <c.icon className="w-4 h-4 text-white" />
            </div>
            <div className="font-display text-xl font-bold text-white truncate">{c.value}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-100/50 font-bold mt-1">{c.label}</div>
            {c.sub && <div className="text-[10px] text-amber-300/80 mt-1">{c.sub}</div>}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* 7 day chart */}
        <div className="lg:col-span-3 rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" /> Orders · Last 7 Days
            </h3>
            <span className="text-[11px] text-emerald-100/45">{days.reduce((s, d) => s + d.count, 0)} orders</span>
          </div>
          <div className="flex items-end gap-2.5 h-40">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group" title={`${d.label}: ${d.count} orders · ${inr(d.revenue)} delivered revenue`}>
                <span className="text-[10px] font-bold text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.count / maxCount) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  className={cn("w-full rounded-t-lg min-h-[4px]", d.count > 0 ? "bg-gradient-to-t from-gold-600 to-gold-300" : "bg-white/8")}
                />
                <span className="text-[10px] text-emerald-100/50 font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* status distribution */}
        <div className="lg:col-span-2 rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
          <h3 className="font-display text-lg font-bold text-white mb-4">Order Status</h3>
          <div className="flex h-3 rounded-full overflow-hidden bg-white/5 mb-4">
            {statusCounts.filter((s) => s.count > 0).map((s) => (
              <div key={s.status} className={cn("h-full", STATUS_DOT[s.status])} style={{ width: `${(s.count / statusTotal) * 100}%` }} title={`${STATUS_LABEL[s.status]}: ${s.count}`} />
            ))}
          </div>
          <ul className="space-y-2.5">
            {statusCounts.map((s) => (
              <li key={s.status} className="flex items-center gap-2.5 text-sm">
                <span className={cn("w-2.5 h-2.5 rounded-full", STATUS_DOT[s.status])} />
                <span className="text-emerald-100/70 flex-1">{STATUS_LABEL[s.status]}</span>
                <span className="font-bold text-white">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* recent orders */}
        <div className="lg:col-span-3 rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white">Recent Bookings</h3>
            <button onClick={onOpenOrders} className="text-xs font-bold text-gold-300 hover:text-gold-400 inline-flex items-center gap-1">
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-emerald-100/45">
              No bookings yet. New orders from the website appear here instantly.
            </p>
          ) : (
            <ul className="divide-y divide-white/6">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-emerald-950 text-xs font-bold flex-shrink-0">
                    {o.customer.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{o.customer.name}</p>
                    <p className="text-[11px] text-emerald-100/50 truncate">
                      {o.item.packLabel} × {o.item.qty} · {fmtDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusPill status={o.status} />
                    <p className="text-[11px] text-gold-300 font-bold mt-1">{o.total != null ? inr(o.total) : "On call"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* best sellers */}
          <div className="rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
            <h3 className="font-display text-lg font-bold text-white mb-4">Best Sellers</h3>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-emerald-100/45 py-4 text-center">Sales data appears after your first orders.</p>
            ) : (
              <ul className="space-y-3">
                {bestSellers.map((b, i) => (
                  <li key={b.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gold-400/15 border border-gold-400/30 text-gold-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{b.name}</p>
                      <p className="text-[10px] text-emerald-100/50">{b.qty} pouches {b.revenue > 0 && <>· {inr(b.revenue)}</>}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* low stock */}
          <div className="rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
            <h3 className="font-display text-lg font-bold text-white mb-3">Low-Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <p className="text-sm text-emerald-100/45">No tracked packs are low on stock.</p>
            ) : (
              <ul className="space-y-2">
                {lowStock.map((l, i) => (
                  <li key={i} className={cn("flex items-center justify-between gap-2 text-xs font-semibold rounded-xl px-3 py-2.5 border", l.stock === 0 ? "bg-rose-400/10 border-rose-400/30 text-rose-300" : "bg-amber-400/10 border-amber-400/30 text-amber-300")}>
                    <span className="truncate">{l.product} · {l.pack}</span>
                    <span className="flex-shrink-0">{l.stock === 0 ? "OUT" : `${l.stock} left`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
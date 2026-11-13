import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, ClipboardList, Package, Users, Settings as SettingsIcon,
  LogOut, ArrowLeft, RefreshCw, Database,
} from "lucide-react";
import AdminAuth from "./AdminAuth";
import Overview from "./Overview";
import OrdersAdmin from "./OrdersAdmin";
import CatalogAdmin from "./CatalogAdmin";
import CustomersAdmin from "./CustomersAdmin";
import SettingsAdmin from "./SettingsAdmin";
import Logo from "../components/Logo";
import { db, DEFAULT_SETTINGS, endSession, hasSession, onDataChange, type Order, type Product, type Settings } from "../lib/db";
import { ApiRequestError } from "../lib/api";
import { useStore } from "../context/StoreContext";
import { cn } from "../utils/cn";

type Tab = "overview" | "orders" | "catalog" | "customers" | "settings";

const TABS: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "catalog", label: "Products & Stock", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminApp() {
  const { toast, refresh: refreshStore } = useStore();
  const [authed, setAuthed] = useState<boolean>(() => hasSession());
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [ordersResult, productsResult, settingsResult] = await Promise.allSettled([
      db.getOrders(),
      db.getProducts(),
      db.getSettings(),
    ]);

    if (ordersResult.status === "fulfilled") setOrders(ordersResult.value);
    if (productsResult.status === "fulfilled") setProducts(productsResult.value);
    if (settingsResult.status === "fulfilled") setSettings(settingsResult.value);

    const failed = [ordersResult, productsResult, settingsResult].filter(
      (result) => result.status === "rejected"
    ).length;
    const authFailed = [ordersResult, productsResult, settingsResult].some(
      (result) => result.status === "rejected" && result.reason instanceof ApiRequestError && result.reason.status === 401
    );
    if (authFailed) {
      endSession();
      setAuthed(false);
      toast("Your admin session expired. Please sign in again.", "error");
    } else if (failed > 0) {
      toast("Some dashboard data could not be loaded. Please refresh and try again.", "error");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!authed) return;
    reload();
    const off = onDataChange(() => {
      reload();
      refreshStore().catch(() => undefined);
    });
    return off;
  }, [authed, reload, refreshStore]);

  const logout = () => {
    endSession();
    setAuthed(false);
    toast("Signed out securely.", "info");
  };

  if (!authed) {
    return (
      <AdminAuth
        onSuccess={() => {
          setAuthed(true);
          toast("Welcome back to D GOLD Admin.", "success");
        }}
      />
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#04231a] text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:min-h-screen lg:sticky lg:top-0 flex-shrink-0 bg-emerald-950/90 border-b lg:border-b-0 lg:border-r border-gold-400/15 backdrop-blur-xl z-30">
        <div className="p-4 lg:p-6 flex lg:flex-col items-center lg:items-stretch gap-4">
          <div className="hidden lg:block"><Logo size={38} /></div>
          <span className="lg:mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-[10px] font-bold text-gold-300 tracking-[0.2em] uppercase w-fit">
            <LayoutDashboard className="w-3 h-3" /> Admin Console
          </span>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto flex-1 lg:mt-4" aria-label="Admin">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors relative",
                  tab === t.key ? "bg-gradient-gold text-emerald-950 shadow-gold" : "text-emerald-100/65 hover:text-white hover:bg-white/5"
                )}
              >
                <t.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.key === "orders" && pendingCount > 0 && (
                  <span className={cn("ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full", tab === t.key ? "bg-emerald-950/20 text-emerald-950" : "bg-amber-400/20 text-amber-300")}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="hidden lg:block mt-auto pt-6 space-y-1">
            <div className="flex items-start gap-2 text-[10px] text-emerald-100/35 leading-relaxed px-1 pb-3">
              <Database className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gold-400/50" />
              Live cloud database. Same data as the storefront.
            </div>
            <a href="#top" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-100/60 hover:text-white hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> View Website
            </a>
            <button onClick={logout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-100/60 hover:text-rose-300 hover:bg-rose-400/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
          <button onClick={logout} className="lg:hidden p-2.5 rounded-xl text-emerald-100/60 hover:text-rose-300" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-20 bg-[#04231a]/90 backdrop-blur-xl border-b border-white/8 px-4 sm:px-8 h-14 flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-white">
            {TABS.find((t) => t.key === tab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-300/80 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live
            </span>
            <button onClick={() => { reload(); toast("Dashboard refreshed.", "info"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-100/70 border border-white/10 hover:border-gold-400/40 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="py-24 text-center text-emerald-100/50 font-medium">Loading dashboard…</div>
          ) : tab === "overview" ? (
            <Overview orders={orders} products={products} onOpenOrders={() => setTab("orders")} />
          ) : tab === "orders" ? (
            <OrdersAdmin orders={orders} reload={reload} />
          ) : tab === "catalog" ? (
            <CatalogAdmin products={products} settings={settings} reload={reload} />
          ) : tab === "customers" ? (
            <CustomersAdmin orders={orders} />
          ) : (
            <SettingsAdmin settings={settings} reload={reload} />
          )}
        </div>
      </main>
    </div>
  );
}
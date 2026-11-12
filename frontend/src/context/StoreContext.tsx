import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { db, initDb, onDataChange, type Product, type Settings, DEFAULT_SETTINGS } from "../lib/db";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface BookingIntent {
  productId?: string;
  packId?: string;
}

interface StoreValue {
  ready: boolean;
  products: Product[];
  settings: Settings;
  refresh: () => Promise<void>;
  bookingOpen: boolean;
  bookingIntent: BookingIntent;
  openBooking: (intent?: BookingIntent) => void;
  closeBooking: () => void;
  trackOpen: boolean;
  setTrackOpen: (v: boolean) => void;
  toast: (message: string, kind?: ToastKind) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingIntent, setBookingIntent] = useState<BookingIntent>({});
  const [trackOpen, setTrackOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const refresh = useCallback(async () => {
    const [p, s] = await Promise.all([db.getProducts(), db.getSettings()]);
    setProducts(p);
    setSettings(s);
  }, []);

  useEffect(() => {
    let alive = true;
    initDb()
      .then(refresh)
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    const off = onDataChange(() => {
      refresh().catch(() => undefined);
    });
    return () => {
      alive = false;
      off();
    };
  }, [refresh]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const openBooking = useCallback((intent?: BookingIntent) => {
    setBookingIntent(intent ?? {});
    setBookingOpen(true);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ready,
        products,
        settings,
        refresh,
        bookingOpen,
        bookingIntent,
        openBooking,
        closeBooking: () => setBookingOpen(false),
        trackOpen,
        setTrackOpen,
        toast,
      }}
    >
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl border backdrop-blur-xl text-sm font-medium ${
                t.kind === "success"
                  ? "bg-emerald-900/95 border-emerald-400/40 text-emerald-50"
                  : t.kind === "error"
                  ? "bg-rose-950/95 border-rose-400/40 text-rose-50"
                  : "bg-emerald-950/95 border-gold-400/40 text-gold-100"
              }`}
            >
              {t.kind === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : t.kind === "error" ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-gold-400 flex-shrink-0" />
              )}
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                className="opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { STATUS_LABEL, type OrderStatus } from "../lib/db";
import { cn } from "../utils/cn";

export function Reveal({
  children,
  delay = 0,
  className,
  y = 26,
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const initialOffset = {
    up: { y, x: 0 },
    down: { y: -y, x: 0 },
    left: { x: y, y: 0 },
    right: { x: -y, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTag({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.22em] uppercase border",
        light
          ? "bg-emerald-900/5 border-emerald-900/15 text-emerald-800"
          : "glass border-gold-400/30 text-gold-300"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
      {children}
    </span>
  );
}

export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-400/15 border-amber-400/40 text-amber-300",
  confirmed: "bg-sky-400/15 border-sky-400/40 text-sky-300",
  preparing: "bg-violet-400/15 border-violet-400/40 text-violet-300",
  out_for_delivery: "bg-orange-400/15 border-orange-400/40 text-orange-300",
  delivered: "bg-emerald-400/15 border-emerald-400/40 text-emerald-300",
  cancelled: "bg-rose-400/15 border-rose-400/40 text-rose-300",
};

export const STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-sky-400",
  preparing: "bg-violet-400",
  out_for_delivery: "bg-orange-400",
  delivered: "bg-emerald-400",
  cancelled: "bg-rose-400",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap",
        STATUS_STYLE[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  dark = true,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border overflow-hidden",
        dark ? "border-emerald-300/20 bg-emerald-950/50" : "border-emerald-900/15 bg-white"
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          "w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30",
          dark ? "text-gold-300 hover:bg-white/5" : "text-emerald-800 hover:bg-emerald-900/5"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </motion.button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className={cn(
          "w-14 h-10 text-center font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          dark ? "text-white" : "text-emerald-950"
        )}
        aria-label="Quantity"
      />
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          "w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-30",
          dark ? "text-gold-300 hover:bg-white/5" : "text-emerald-800 hover:bg-emerald-900/5"
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block w-5 h-5 rounded-full border-2 border-emerald-950/30 border-t-emerald-950 animate-spin",
        className
      )}
      aria-label="Loading"
    />
  );
}
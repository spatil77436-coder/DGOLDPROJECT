import { useState } from "react";
import { motion } from "framer-motion";
import { Check, PhoneCall, PackageX, ArrowRight, Phone } from "lucide-react";
import ProductPack, { DEFAULT_PRODUCT_IMAGE } from "./ProductPack";
import { Reveal, SectionTag, QtyStepper } from "./ui";
import { useStore } from "../context/StoreContext";
import { inr } from "../lib/helpers";
import type { Pack, Product } from "../lib/db";
import { cn } from "../utils/cn";

function packSoldOut(pack: Pack): boolean {
  return pack.trackStock && pack.stock <= 0;
}

function ProductCard({ product }: { product: Product }) {
  const { openBooking, settings } = useStore();
  const firstAvailable = product.packs.find((p) => !packSoldOut(p)) ?? product.packs[0];
  const [packId, setPackId] = useState<string>(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);
  const pack = product.packs.find((p) => p.id === packId) ?? firstAvailable;
  const soldOut = !product.available || product.packs.length === 0 || product.packs.every(packSoldOut);
  const thisPackOut = pack ? packSoldOut(pack) : true;
  const maxQty = pack?.trackStock ? Math.max(1, pack.stock) : 999;
  const total = pack && pack.price != null ? pack.price * qty : null;

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Visual */}
      <Reveal className="relative">
        <div className="relative rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_30%,#12523c,#06301f_75%)] border border-gold-400/20 px-8 py-12 sm:px-14 overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-gold text-emerald-950 text-[10px] sm:text-[11px] font-extrabold tracking-[0.22em] uppercase shadow-gold whitespace-nowrap">
            Premium Chali Cut Supari
          </div>
          <div className="relative mx-auto max-w-[280px] sm:max-w-[320px] mt-6">
            <ProductPack image={product.image ?? DEFAULT_PRODUCT_IMAGE} float={false} />
          </div>
        </div>
      </Reveal>

      {/* Details */}
      <Reveal delay={0.12}>
        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-gold-600">{product.tagline}</p>
        <h3 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-emerald-950 tracking-tight">{product.name}</h3>
        <p className="mt-4 text-emerald-900/70 leading-relaxed">{product.description}</p>

        <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
          {product.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-sm font-medium text-emerald-900/80">
              <span className="w-5 h-5 rounded-full bg-emerald-700/10 border border-emerald-700/25 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-700" strokeWidth={3} />
              </span>
              {h}
            </li>
          ))}
        </ul>

        {/* Packs */}
        <div className="mt-7">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-emerald-900/50 mb-2.5">
            Available Package Sizes
          </p>
          {product.packs.length === 0 ? (
            <p className="text-sm text-emerald-900/60">Package sizes are being updated — please call us.</p>
          ) : (
            <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Package size">
              {product.packs.map((p) => {
                const out = packSoldOut(p);
                const selected = p.id === pack?.id;
                return (
                  <button
                    key={p.id}
                    role="radio"
                    aria-checked={selected}
                    disabled={out}
                    onClick={() => {
                      setPackId(p.id);
                      setQty(1);
                    }}
                    className={cn(
                      "relative px-5 py-3 rounded-2xl border text-left transition-all",
                      out
                        ? "opacity-45 cursor-not-allowed border-emerald-900/10 bg-white"
                        : selected
                        ? "border-gold-500 bg-emerald-950 text-white shadow-gold"
                        : "border-emerald-900/15 bg-white hover:border-gold-500/60"
                    )}
                  >
                    <span className={cn("block text-sm font-bold", selected && !out ? "text-gold-300" : "text-emerald-950")}>
                      {p.label}
                    </span>
                    <span className={cn("block text-xs mt-0.5", selected && !out ? "text-emerald-100/70" : "text-emerald-900/55")}>
                      {out ? "Out of stock" : p.price != null ? inr(p.price) : "Price on call"}
                    </span>
                    {selected && !out && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-gold flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-950" strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Qty + total */}
        {!soldOut && pack && !thisPackOut && (
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-emerald-900/50 mb-2">Quantity</p>
              <QtyStepper value={qty} onChange={setQty} max={maxQty} dark={false} />
            </div>
            <div className="min-w-[150px]">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-emerald-900/50 mb-2">Order Total</p>
              {total != null ? (
                <p className="font-display text-3xl font-bold text-emerald-950">{inr(total)}</p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-700 bg-gold-400/15 border border-gold-500/30 rounded-xl px-3 py-2">
                  <PhoneCall className="w-4 h-4" /> Finalised on call
                </p>
              )}
            </div>
            {pack.trackStock && pack.stock > 0 && pack.stock <= settings.lowStockThreshold && (
              <p className="text-xs font-semibold text-amber-700">Only {pack.stock} left in stock</p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {soldOut || thisPackOut ? (
            <>
              <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-900/5 border border-emerald-900/15 text-emerald-900/70 font-semibold">
                <PackageX className="w-5 h-5" /> Currently unavailable
              </div>
              <a href={`tel:+91${settings.phone}`} className="btn-gold px-7 py-4">
                <Phone className="w-4 h-4" /> Call for availability
              </a>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openBooking({ productId: product.id, packId: pack?.id })}
                className="btn-gold px-8 py-4 text-base group"
              >
                Book This Pack
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <a
                href={`tel:+91${settings.phone}`}
                className="px-7 py-4 rounded-2xl border border-emerald-900/15 text-emerald-900 font-semibold text-center hover:border-gold-500/60 hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-gold-600" /> +91 {settings.phone}
              </a>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function Products() {
  const { products, ready } = useStore();
  const visible = products.filter((p) => p.available);
  const list = visible.length > 0 ? visible : products;

  return (
    <section id="product" className="relative bg-ivory text-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute top-20 left-0 w-[380px] h-[380px] rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <SectionTag light>Our Premium Product</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            PREMIUM <span className="text-gold-600">CHALI CUT</span> SUPARI
          </h2>
          <p className="mt-5 text-lg text-emerald-900/65">
            Choose your package size and quantity — package pricing is confirmed personally on call,
            and your total is always shown before you book.
          </p>
        </Reveal>

        {!ready ? (
          <div className="py-20 text-center text-emerald-900/50 font-medium">Loading products…</div>
        ) : list.length === 0 ? (
          <div className="py-20 text-center text-emerald-900/50 font-medium">
            Products are being updated. Please call us for today's availability.
          </div>
        ) : (
          <div className="space-y-24">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
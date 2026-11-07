import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, X, ImagePlus, Check, Package, History, AlertTriangle, Save,
} from "lucide-react";
import ProductPack from "../components/ProductPack";
import { db, uid, type Product, type Pack, type Settings, type StockLog } from "../lib/db";
import { fileToDataUrl, inr, fmtDateTime, sanitizeText } from "../lib/helpers";
import { useStore } from "../context/StoreContext";
import { Spinner } from "../components/ui";
import { cn } from "../utils/cn";

function blankProduct(): Product {
  return {
    id: uid("P-"),
    name: "",
    tagline: "Premium taste. Pure satisfaction.",
    description: "",
    highlights: [],
    image: null,
    available: true,
    packs: [{ id: uid("PK-"), label: "500 g Pouch", grams: 500, price: null, trackStock: false, stock: 0 }],
    createdAt: new Date().toISOString(),
  };
}

export default function CatalogAdmin({
  products,
  settings,
  reload,
}: {
  products: Product[];
  settings: Settings;
  reload: () => Promise<void>;
}) {
  const { toast } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.getStockLogs().then(setLogs).catch(() => undefined);
  }, [products]);

  const startEdit = (p: Product) => {
    setEditing(JSON.parse(JSON.stringify(p)));
    setIsNew(false);
  };
  const startNew = () => {
    setEditing(blankProduct());
    setIsNew(true);
  };

  const patch = (partial: Partial<Product>) => setEditing((e) => (e ? { ...e, ...partial } : e));
  const patchPack = (id: string, partial: Partial<Pack>) =>
    setEditing((e) => (e ? { ...e, packs: e.packs.map((p) => (p.id === id ? { ...p, ...partial } : p)) } : e));

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const url = await fileToDataUrl(file);
      patch({ image: url });
      toast("Image ready — it will appear on the website after you save.", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Image upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (!editing) return;
    if (editing.name.trim().length < 3) {
      toast("Please enter a product name.", "error");
      return;
    }
    if (editing.packs.length === 0) {
      toast("Add at least one package size.", "error");
      return;
    }
    if (editing.packs.some((p) => !p.label.trim() || p.grams <= 0)) {
      toast("Every pack needs a label and a weight in grams.", "error");
      return;
    }
    if (editing.packs.some((p) => p.price != null && (p.price < 0 || !Number.isFinite(p.price)))) {
      toast("Pack prices must be positive numbers (or blank for on-call).", "error");
      return;
    }
    setSaving(true);
    try {
      const prev = products.find((p) => p.id === editing.id);
      const clean: Product = {
        ...editing,
        name: sanitizeText(editing.name, 90),
        tagline: sanitizeText(editing.tagline, 90),
        description: sanitizeText(editing.description, 700),
        highlights: editing.highlights.map((h) => sanitizeText(h, 60)).filter(Boolean),
      };
      await db.saveProduct(clean);
      /* stock change log */
      for (const pk of clean.packs) {
        const before = prev?.packs.find((p) => p.id === pk.id);
        if (pk.trackStock && (!before || before.stock !== pk.stock)) {
          await db.addStockLog({
            id: uid("SL-"),
            at: new Date().toISOString(),
            productId: clean.id,
            productName: clean.name,
            packLabel: pk.label,
            delta: pk.stock - (before?.stock ?? 0),
            balance: pk.stock,
            note: before ? "Manual stock update" : "Initial stock",
          });
        }
      }
      await reload();
      setEditing(null);
      toast(isNew ? "Product added — live on the website." : "Product updated.", "success");
    } catch {
      toast("Could not save the product.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? Existing orders keep their records, but the product disappears from the website.`)) return;
    try {
      await db.deleteProduct(p.id);
      await reload();
      toast("Product deleted.", "info");
    } catch {
      toast("Could not delete the product.", "error");
    }
  };

  const toggleAvailable = async (p: Product) => {
    await db.saveProduct({ ...p, available: !p.available });
    await reload();
    toast(`${p.name} is now ${!p.available ? "visible" : "hidden"} on the website.`, "info");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-100/60">
          Products, package sizes, prices, photos and stock — changes go live on the website immediately.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setShowLogs(!showLogs)} className="px-4 py-2.5 rounded-xl border border-white/15 text-sm font-bold text-emerald-100/70 hover:text-white hover:border-gold-400/40 transition-colors inline-flex items-center gap-2">
            <History className="w-4 h-4" /> Stock Log
          </button>
          <button onClick={startNew} className="btn-gold !py-2.5 text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* product cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {products.map((p) => {
          const low = p.packs.filter((pk) => pk.trackStock && pk.stock <= settings.lowStockThreshold);
          return (
            <div key={p.id} className="rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <ProductPack image={p.image} float={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-emerald-100/50 mt-0.5">{p.tagline}</p>
                    </div>
                    <button
                      onClick={() => toggleAvailable(p)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                        p.available ? "bg-emerald-500" : "bg-white/15"
                      )}
                      aria-label={p.available ? "Disable product" : "Enable product"}
                    >
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", p.available ? "left-[22px]" : "left-0.5")} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.packs.map((pk) => (
                      <span key={pk.id} className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                        pk.trackStock && pk.stock <= 0
                          ? "bg-rose-400/10 border-rose-400/40 text-rose-300"
                          : "bg-white/5 border-white/10 text-emerald-100/75"
                      )}>
                        {pk.label} · {pk.price != null ? inr(pk.price) : "on call"}
                        {pk.trackStock && <> · {pk.stock} in stock</>}
                      </span>
                    ))}
                  </div>
                  {low.length > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> {low.length} pack{low.length > 1 ? "s" : ""} low on stock
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => startEdit(p)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-gold-400/25 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => removeProduct(p)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-400/30 text-rose-300 text-xs font-bold hover:bg-rose-400/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* stock log */}
      <AnimatePresence>
        {showLogs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl bg-emerald-950/70 border border-white/8 p-5">
              <h3 className="font-display text-lg font-bold text-white mb-3">Stock Movement Log</h3>
              {logs.length === 0 ? (
                <p className="text-sm text-emerald-100/45">No stock movements yet. Orders and manual updates are recorded here.</p>
              ) : (
                <ul className="divide-y divide-white/6 max-h-72 overflow-y-auto">
                  {logs.map((l) => (
                    <li key={l.id} className="py-2.5 flex items-center gap-3 text-sm">
                      <span className={cn("font-mono font-bold text-xs w-12 text-right", l.delta >= 0 ? "text-emerald-300" : "text-rose-300")}>
                        {l.delta >= 0 ? "+" : ""}{l.delta}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-100/80 truncate text-xs font-semibold">{l.productName} · {l.packLabel}</p>
                        <p className="text-[10px] text-emerald-100/40">{l.note} · balance {l.balance}</p>
                      </div>
                      <span className="text-[10px] text-emerald-100/40 flex-shrink-0">{fmtDateTime(l.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* editor */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-5">
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-emerald-900 border border-gold-400/25 shadow-2xl"
              role="dialog"
              aria-label="Product editor"
            >
              <div className="sticky top-0 z-10 bg-emerald-900/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-[2rem]">
                <h3 className="font-display text-xl font-bold text-white">{isNew ? "Add Product" : "Edit Product"}</h3>
                <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-100/70 hover:text-white" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="lbl">Product Name *</label>
                    <input className="field" value={editing.name} onChange={(e) => patch({ name: e.target.value })} placeholder="D GOLD Premium Chali Cut Supari" />
                  </div>
                  <div>
                    <label className="lbl">Tagline</label>
                    <input className="field" value={editing.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="lbl">Description</label>
                  <textarea className="field resize-none" rows={3} value={editing.description} onChange={(e) => patch({ description: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Highlights (one per line)</label>
                  <textarea
                    className="field resize-none"
                    rows={4}
                    value={editing.highlights.join("\n")}
                    onChange={(e) => patch({ highlights: e.target.value.split("\n") })}
                    placeholder={"100% Natural Arecanut\nNo Added Preservatives"}
                  />
                </div>

                {/* image */}
                <div>
                  <label className="lbl">Product Photo (real packaging image)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 flex-shrink-0">
                      <ProductPack image={editing.image} float={false} />
                    </div>
                    <div className="flex-1">
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400/15 border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-gold-400/25 transition-colors disabled:opacity-50">
                          {uploading ? <Spinner className="w-4 h-4 border-gold-300/30 border-t-gold-300" /> : <ImagePlus className="w-4 h-4" />}
                          {editing.image ? "Replace Photo" : "Upload Photo"}
                        </button>
                        {editing.image && (
                          <button onClick={() => patch({ image: null })} className="px-4 py-2.5 rounded-xl border border-rose-400/30 text-rose-300 text-xs font-bold hover:bg-rose-400/10 transition-colors">
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] text-emerald-100/45 leading-relaxed">
                        JPG/PNG up to 8 MB. Shown full-pack, uncropped. Without a photo, the brand artwork is displayed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* packs */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="lbl !mb-0">Package Sizes & Pricing</label>
                    <button
                      onClick={() => patch({ packs: [...editing.packs, { id: uid("PK-"), label: "", grams: 250, price: null, trackStock: false, stock: 0 }] })}
                      className="text-xs font-bold text-gold-300 hover:text-gold-400 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Pack
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editing.packs.map((pk) => (
                      <div key={pk.id} className="rounded-2xl border border-white/10 p-4 bg-emerald-950/40">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="lbl !text-[9px]">Label *</label>
                            <input className="field !py-2 text-sm" value={pk.label} onChange={(e) => patchPack(pk.id, { label: e.target.value })} placeholder="500 g Pouch" />
                          </div>
                          <div>
                            <label className="lbl !text-[9px]">Grams *</label>
                            <input type="number" min={1} className="field !py-2 text-sm" value={pk.grams || ""} onChange={(e) => patchPack(pk.id, { grams: parseInt(e.target.value, 10) || 0 })} />
                          </div>
                          <div>
                            <label className="lbl !text-[9px]">Price ₹ (blank = on call)</label>
                            <input type="number" min={0} className="field !py-2 text-sm" value={pk.price ?? ""} onChange={(e) => patchPack(pk.id, { price: e.target.value === "" ? null : Math.max(0, Number(e.target.value)) })} placeholder="On call" />
                          </div>
                          <div>
                            <label className="lbl !text-[9px]">Stock (if tracked)</label>
                            <input type="number" min={0} disabled={!pk.trackStock} className="field !py-2 text-sm disabled:opacity-40" value={pk.stock} onChange={(e) => patchPack(pk.id, { stock: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-100/70">
                            <input type="checkbox" checked={pk.trackStock} onChange={(e) => patchPack(pk.id, { trackStock: e.target.checked })} className="w-4 h-4 accent-[#e8b94a]" />
                            Track stock (blocks orders at zero)
                          </label>
                          <button
                            onClick={() => patch({ packs: editing.packs.filter((x) => x.id !== pk.id) })}
                            className="text-rose-300/80 hover:text-rose-300 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove pack
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-emerald-100/80">
                  <input type="checkbox" checked={editing.available} onChange={(e) => patch({ available: e.target.checked })} className="w-4 h-4 accent-[#e8b94a]" />
                  Available for booking on the website
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setEditing(null)} className="px-5 py-3 rounded-xl border border-white/15 text-sm font-bold text-emerald-100/70 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={save} disabled={saving} className="btn-gold !py-3 text-sm disabled:opacity-50 min-w-[150px]">
                    {saving ? <Spinner /> : (<><Save className="w-4 h-4" /> Save Product</>)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {products.length === 0 && (
        <div className="rounded-2xl bg-emerald-950/70 border border-white/8 py-16 text-center">
          <Package className="w-10 h-10 text-emerald-100/25 mx-auto" />
          <p className="mt-4 font-display text-xl font-bold text-white">No products yet</p>
          <button onClick={startNew} className="btn-gold mt-5 !py-2.5 text-sm"><Check className="w-4 h-4" /> Add your first product</button>
        </div>
      )}
    </div>
  );
}
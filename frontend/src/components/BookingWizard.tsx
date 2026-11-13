import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowLeft, ArrowRight, Check, Copy, MapPin, PhoneCall,
  MessageCircle, PackageSearch, ShieldCheck, AlertTriangle, Package,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { db, uid, type Order, type Pack } from "../lib/db";
import {
  inr, isBengaluruPin, isValidPhone, sanitizeText, todayISO, fmtDate,
  waLink, orderWaText, OUT_OF_AREA_MESSAGE,
} from "../lib/helpers";
import { QtyStepper, Spinner, StatusPill } from "./ui";
import { cn } from "../utils/cn";

const STEP_TITLES = ["Product & Quantity", "Delivery Details", "Review & Confirm"];

function soldOut(p: Pack) {
  return p.trackStock && p.stock <= 0;
}

export default function BookingWizard() {
  const { bookingOpen, closeBooking, bookingIntent, products, settings, toast, refresh, setTrackOpen } = useStore();
  const available = useMemo(() => products.filter((p) => p.available && p.packs.length > 0), [products]);

  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState("");
  const [packId, setPackId] = useState("");
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", area: "", address: "", pin: "",
    deliveryDate: todayISO(1), slot: "", instructions: "",
  });
  const [pinTouched, setPinTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  /* initialise from intent each time the modal opens */
  useEffect(() => {
    if (!bookingOpen) return;
    const prod =
      available.find((p) => p.id === bookingIntent.productId) ?? available[0];
    const pk =
      prod?.packs.find((p) => p.id === bookingIntent.packId && !soldOut(p)) ??
      prod?.packs.find((p) => !soldOut(p)) ??
      prod?.packs[0];
    setProductId(prod?.id ?? "");
    setPackId(pk?.id ?? "");
    setQty(1);
    setStep(0);
    setPlaced(null);
    setAttempted(false);
    setPinTouched(false);
    setAgree(false);
    setForm((f) => ({ ...f, slot: f.slot || settings.slots[0] || "" }));
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingOpen]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [bookingOpen, closeBooking]);

  const product = available.find((p) => p.id === productId);
  const pack = product?.packs.find((p) => p.id === packId);
  const maxQty = pack?.trackStock ? Math.max(1, pack.stock) : 999;
  const total = pack && pack.price != null ? pack.price * qty : null;

  const pinOk = isBengaluruPin(form.pin, settings);
  const errors = {
    name: form.name.trim().length < 3 ? "Please enter your full name." : "",
    phone: !isValidPhone(form.phone) ? "Enter a valid 10-digit mobile number." : "",
    area: form.area.trim().length < 3 ? "Enter your area / locality in Bengaluru." : "",
    address: form.address.trim().length < 10 ? "Enter your complete shop delivery address." : "",
    pin: !/^\d{6}$/.test(form.pin)
      ? "Enter a valid 6-digit PIN code."
      : !pinOk
      ? OUT_OF_AREA_MESSAGE
      : "",
    deliveryDate: !form.deliveryDate || form.deliveryDate < todayISO() ? "Choose a valid delivery date." : "",
    slot: !form.slot ? "Choose a delivery slot." : "",
  };
  const detailsValid = Object.values(errors).every((e) => !e);
  const stepValid = step === 0 ? Boolean(product && pack && !soldOut(pack) && qty >= 1) : step === 1 ? detailsValid : agree;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!product || !pack || submitting) return;
    setSubmitting(true);
    try {
      /* re-validate against the live database before saving */
      const fresh = (await db.getProducts()).find((p) => p.id === product.id);
      const freshPack = fresh?.packs.find((p) => p.id === pack.id);
      if (!fresh || !fresh.available || !freshPack || soldOut(freshPack)) {
        toast("Sorry — this pack just went out of stock. Please choose another.", "error");
        setStep(0);
        await refresh();
        return;
      }
      if (freshPack.trackStock && qty > freshPack.stock) {
        toast(`Only ${freshPack.stock} left for this pack. Please reduce the quantity.`, "error");
        setQty(Math.max(1, freshPack.stock));
        setStep(0);
        return;
      }
      if (!isBengaluruPin(form.pin, settings)) {
        toast(OUT_OF_AREA_MESSAGE, "error");
        setStep(1);
        return;
      }

      const now = new Date().toISOString();
      const order: Order = {
        id: uid("DG-"),
        createdAt: now,
        status: "pending",
        customer: {
          name: sanitizeText(form.name, 80),
          phone: form.phone.trim(),
          area: sanitizeText(form.area, 80),
          address: sanitizeText(form.address, 300),
          pin: form.pin.trim(),
        },
        item: {
          productId: fresh.id,
          productName: fresh.name,
          packId: freshPack.id,
          packLabel: freshPack.label,
          grams: freshPack.grams,
          unitPrice: freshPack.price,
          qty,
        },
        deliveryDate: form.deliveryDate,
        slot: form.slot,
        instructions: sanitizeText(form.instructions, 300) || undefined,
        total: freshPack.price != null ? freshPack.price * qty : null,
        history: [{ status: "pending", at: now }],
      };

      const saved = await db.addOrder(order);

      if (freshPack.trackStock) {
        const balance = Math.max(0, freshPack.stock - qty);
        await db.saveProduct({
          ...fresh,
          packs: fresh.packs.map((p) => (p.id === freshPack.id ? { ...p, stock: balance } : p)),
        });
        await db.addStockLog({
          id: uid("SL-"), at: now, productId: fresh.id, productName: fresh.name,
          packLabel: freshPack.label, delta: -qty, balance, note: `Order ${saved.id}`,
        });
      }

      setPlaced(saved);
      toast("Booking saved! We'll call you shortly to confirm.", "success");
    } catch {
      toast("Could not save your booking. Please try again or call us.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    if (!placed) return;
    navigator.clipboard?.writeText(placed.id).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {bookingOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Book your order"
        >
          <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-md" onClick={closeBooking} />
          <motion.div
            initial={{ y: 90, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 90, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 27, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-emerald-900 border border-gold-400/25 shadow-2xl"
          >
            {/* header */}
            <div className="sticky top-0 z-10 bg-emerald-900/95 backdrop-blur-md border-b border-white/10 px-6 sm:px-8 py-4 flex items-center justify-between rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <Package className="w-5 h-5 text-emerald-950" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white leading-tight">
                    {placed ? "Booking Received" : "Book Your Order"}
                  </h2>
                  <p className="text-[11px] text-gold-300 font-semibold tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Bengaluru Only
                  </p>
                </div>
              </div>
              <button onClick={closeBooking} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-100/70 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6">
              {placed ? (
                /* ------------------------- SUCCESS ------------------------- */
                <div className="text-center pb-2">
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                    <Check className="w-10 h-10 text-emerald-950" strokeWidth={3} />
                  </motion.div>
                  <h3 className="mt-5 font-display text-3xl font-bold text-white">Thank you, {placed.customer.name.split(" ")[0]}!</h3>
                  <p className="mt-2 text-emerald-100/70 max-w-md mx-auto text-sm leading-relaxed">
                    Your booking is saved and <strong className="text-amber-300">pending confirmation</strong>.
                    Our team will call <strong className="text-white">+91 {placed.customer.phone}</strong> shortly
                    to confirm {placed.total != null ? `your total of ${inr(placed.total)}` : "the package price"} and your delivery slot.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-950/60 border border-gold-400/30">
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/50 font-bold">Order ID</div>
                      <div className="font-mono text-lg font-bold text-gold-300 tracking-wider">{placed.id}</div>
                    </div>
                    <button onClick={copyId} className="p-2.5 rounded-xl bg-gold-400/15 text-gold-300 hover:bg-gold-400/25 transition-colors" aria-label="Copy order ID">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-100/60">
                    <StatusPill status={placed.status} />
                    <span>→ updates appear in Track Order</span>
                  </div>

                  <div className="mt-7 grid sm:grid-cols-2 gap-3">
                    <a
                      href={waLink(settings.whatsapp, orderWaText(placed))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366] text-emerald-950 font-bold hover:brightness-110 transition"
                    >
                      <MessageCircle className="w-5 h-5" /> Send on WhatsApp
                    </a>
                    <button
                      onClick={() => { closeBooking(); setTrackOpen(true); }}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gold-400/40 text-gold-300 font-bold hover:bg-gold-400/10 transition-colors"
                    >
                      <PackageSearch className="w-5 h-5" /> Track This Order
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] text-emerald-100/45">
                    Save your Order ID — you'll need it with your mobile number to track this booking.
                  </p>
                </div>
              ) : available.length === 0 ? (
                <div className="py-10 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="mt-4 text-emerald-100/80 font-medium">Online booking is momentarily unavailable.</p>
                  <a href={`tel:+91${settings.phone}`} className="btn-gold mt-5 inline-flex px-6 py-3">
                    <PhoneCall className="w-4 h-4" /> Call +91 {settings.phone}
                  </a>
                </div>
              ) : (
                <>
                  {/* stepper */}
                  <div className="flex items-center gap-2 mb-7">
                    {STEP_TITLES.map((t, i) => (
                      <div key={t} className="flex-1">
                        <div className={cn("h-1.5 rounded-full transition-colors duration-500", i <= step ? "bg-gradient-gold" : "bg-white/10")} />
                        <p className={cn("mt-2 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase", i === step ? "text-gold-300" : "text-emerald-100/40")}>
                          {i + 1}. {t}
                        </p>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* ---------------------- STEP 1 ---------------------- */}
                    {step === 0 && (
                      <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-5">
                        {available.length > 1 && (
                          <div>
                            <label className="lbl">Product</label>
                            <select className="field" value={productId} onChange={(e) => { setProductId(e.target.value); const pr = available.find((p) => p.id === e.target.value); setPackId(pr?.packs.find((p) => !soldOut(p))?.id ?? pr?.packs[0]?.id ?? ""); setQty(1); }}>
                              {available.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="lbl">Package Size</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {product?.packs.map((p) => {
                              const out = soldOut(p);
                              const sel = p.id === packId;
                              return (
                                <button key={p.id} disabled={out} onClick={() => { setPackId(p.id); setQty(1); }}
                                  className={cn("rounded-2xl border px-4 py-3 text-left transition-all",
                                    out ? "opacity-40 cursor-not-allowed border-white/10" : sel ? "border-gold-400 bg-gold-400/10 shadow-gold" : "border-white/15 hover:border-gold-400/50")}>
                                  <span className={cn("block text-sm font-bold", sel ? "text-gold-300" : "text-white")}>{p.label}</span>
                                  <span className="block text-xs mt-0.5 text-emerald-100/60">
                                    {out ? "Out of stock" : p.price != null ? inr(p.price) : "Price on call"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-6">
                          <div>
                            <label className="lbl">Quantity (pouches)</label>
                            <QtyStepper value={qty} onChange={setQty} max={maxQty} />
                            {pack?.trackStock && <p className="mt-1.5 text-[11px] text-emerald-100/50">{pack.stock} available</p>}
                          </div>
                          <div className="flex-1 min-w-[160px] rounded-2xl bg-emerald-950/60 border border-gold-400/25 px-5 py-3.5">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/50 font-bold">Order Total</p>
                            {total != null ? (
                              <p className="font-display text-2xl font-bold text-gold-300">{inr(total)}</p>
                            ) : (
                              <p className="text-sm font-bold text-gold-300 flex items-center gap-1.5 mt-1">
                                <PhoneCall className="w-4 h-4" /> Finalised on call
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-emerald-100/45 leading-relaxed">
                          Package prices are confirmed personally by our team — no hidden charges. Your total is locked before delivery.
                        </p>
                      </motion.div>
                    )}

                    {/* ---------------------- STEP 2 ---------------------- */}
                    {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="lbl">Full Name *</label>
                            <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ramesh Naik" autoComplete="name" />
                            {attempted && errors.name && <p className="err">{errors.name}</p>}
                          </div>
                          <div>
                            <label className="lbl">Mobile Number *</label>
                            <input className="field" value={form.phone} inputMode="numeric" maxLength={10} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" autoComplete="tel" />
                            {attempted && errors.phone && <p className="err">{errors.phone}</p>}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-[1fr_150px] gap-4">
                          <div>
                            <label className="lbl">Area / Locality (Bengaluru) *</label>
                            <input className="field" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Jayanagar 4th Block" />
                            {attempted && errors.area && <p className="err">{errors.area}</p>}
                          </div>
                          <div>
                            <label className="lbl">PIN Code *</label>
                            <input
                              className={cn("field tracking-[0.15em] font-semibold", pinTouched && form.pin.length === 6 && (pinOk ? "!border-emerald-400/70" : "!border-rose-400/70"))}
                              value={form.pin}
                              inputMode="numeric"
                              maxLength={6}
                              onChange={(e) => { set("pin", e.target.value.replace(/\D/g, "").slice(0, 6)); setPinTouched(true); }}
                              onBlur={() => setPinTouched(true)}
                              placeholder="5600xx"
                            />
                          </div>
                        </div>
                        {pinTouched && form.pin.length === 6 && (
                          pinOk ? (
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                              <Check className="w-3.5 h-3.5" /> Serviceable — we deliver to {form.pin}.
                            </p>
                          ) : (
                            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 text-xs font-bold text-rose-300 bg-rose-400/10 border border-rose-400/40 rounded-xl px-3.5 py-2.5">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {OUT_OF_AREA_MESSAGE}
                            </motion.p>
                          )
                        )}
                        {attempted && errors.pin && form.pin.length !== 6 && <p className="err">{errors.pin}</p>}
                        <div>
                          <label className="lbl">Shop Delivery Address *</label>
                          <textarea className="field resize-none" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Shop name, building, street, landmark — Bengaluru" />
                          {attempted && errors.address && <p className="err">{errors.address}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="lbl">Preferred Delivery Date *</label>
                            <input type="date" className="field [color-scheme:dark]" min={todayISO()} max={todayISO(14)} value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
                            {attempted && errors.deliveryDate && <p className="err">{errors.deliveryDate}</p>}
                          </div>
                          <div>
                            <label className="lbl">Time Slot *</label>
                            <select className="field" value={form.slot} onChange={(e) => set("slot", e.target.value)}>
                              <option value="" disabled>Select slot</option>
                              {settings.slots.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {attempted && errors.slot && <p className="err">{errors.slot}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="lbl">Delivery Instructions (optional)</label>
                          <textarea className="field resize-none" rows={2} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder="Landmark, shutter timing, whom to ask for…" />
                        </div>
                      </motion.div>
                    )}

                    {/* ---------------------- STEP 3 ---------------------- */}
                    {step === 2 && product && pack && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="rounded-2xl bg-emerald-950/60 border border-gold-400/25 divide-y divide-white/8">
                          <div className="p-5 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/50 font-bold">Order</p>
                              <p className="mt-1 font-bold text-white">{product.name}</p>
                              <p className="text-sm text-emerald-100/70">{pack.label} × {qty} pouch{qty > 1 ? "es" : ""}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/50 font-bold">Total</p>
                              <p className="mt-1 font-display text-2xl font-bold text-gold-300">
                                {total != null ? inr(total) : "On call"}
                              </p>
                              {pack.price == null && <p className="text-[10px] text-emerald-100/50">confirmed by phone</p>}
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/50 font-bold">Deliver To</p>
                            <p className="mt-1 font-bold text-white">{form.name} · +91 {form.phone}</p>
                            <p className="text-sm text-emerald-100/70 leading-relaxed mt-0.5">
                              {form.address}, {form.area}, Bengaluru – {form.pin}
                            </p>
                            <p className="text-sm text-gold-300 font-semibold mt-1.5">
                              {fmtDate(form.deliveryDate)} · {form.slot}
                            </p>
                            {form.instructions && <p className="text-xs text-emerald-100/55 italic mt-1.5">"{form.instructions}"</p>}
                          </div>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-white/10 p-4 hover:border-gold-400/30 transition-colors">
                          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#e8b94a]" />
                          <span className="text-xs text-emerald-100/70 leading-relaxed">
                            I confirm my delivery address is <strong className="text-white">within Bengaluru</strong> and
                            agree to be contacted on the number above to confirm pricing and delivery.
                          </span>
                        </label>
                        <p className="flex items-center gap-2 text-[11px] text-emerald-100/45">
                          <ShieldCheck className="w-4 h-4 text-gold-400" />
                          Your booking is saved securely and appears instantly with our team.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* footer nav */}
                  <div className="mt-8 flex items-center justify-between gap-3">
                    {step > 0 ? (
                      <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-white/15 text-emerald-100/80 font-semibold hover:text-white hover:border-white/30 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : <span />}
                    {step < 2 ? (
                      <button
                        onClick={() => {
                          setAttempted(true);
                          if (stepValid) { setStep(step + 1); setAttempted(false); }
                          else if (step === 1 && form.pin.length === 6 && !pinOk) toast(OUT_OF_AREA_MESSAGE, "error");
                        }}
                        className={cn("btn-gold px-7 py-3.5", !stepValid && step === 0 && "opacity-50")}
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={submit} disabled={!agree || submitting} className="btn-gold px-7 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-[190px]">
                        {submitting ? (<><Spinner /> Saving…</>) : (<>Confirm Booking <Check className="w-4 h-4" /></>)}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
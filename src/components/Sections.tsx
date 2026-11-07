import { motion } from "framer-motion";
import { useState } from "react";
import {
  Crown, Factory, MapPin, PhoneCall, Search, CheckCircle2, XCircle,
  ClipboardList, Truck, PackageCheck, Store, Ban, Timer, MessageCircle,
} from "lucide-react";
import { Reveal, SectionTag } from "./ui";
import { useStore } from "../context/StoreContext";
import { isBengaluruPin, OUT_OF_AREA_MESSAGE, waLink } from "../lib/helpers";

/* ------------------------------ ABOUT ------------------------------ */

export function About() {
  return (
    <section id="about" className="relative bg-ivory text-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <SectionTag light>About D GOLD</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            A premium supari brand,<br />
            built for <span className="text-gold-600">pan shops.</span>
          </h2>
          <p className="mt-6 text-emerald-900/70 leading-relaxed text-lg">
            D GOLD stands for one thing — <strong>Premium Quality</strong>. Our chali cut supari is made
            from selected arecanuts, hygienically processed at our Sirsi packing unit and sealed in
            clean, freshness-locked 500g pouches.
          </p>
          <p className="mt-4 text-emerald-900/70 leading-relaxed">
            We run a simple, honest model: <strong>no retail outlets, no middlemen</strong>. Pan shops
            in Bengaluru book directly with us, and we deliver to their doorstep. That keeps quality
            consistent, pricing personal, and supply dependable.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {["Premium Quality", "Trust & Authenticity", "Clean Packaging", "Direct Delivery"].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-sm font-semibold text-emerald-900">
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative rounded-[2rem] bg-emerald-950 text-white p-8 sm:p-10 shadow-2xl overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold-400/15 blur-2xl" />
            <Crown className="w-10 h-10 text-gold-400" />
            <h3 className="mt-5 font-display text-2xl font-bold">Straight from the label</h3>
            <p className="text-emerald-100/60 text-sm mt-1">Everything we promise is printed on every pouch.</p>
            <dl className="mt-7 space-y-4">
              {[
                ["Ingredients", "Arecanut (Supari) — nothing else"],
                ["Promise", "No added preservatives · No artificial flavours"],
                ["Processing", "Hygienically processed · Perfect for every paan"],
                ["Best Before", "6 months from packaging"],
                ["Packed & Marketed by", "D GOLD SUPARI, Sirsi, Uttara Kannada – 581402"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b border-white/8 pb-3.5 last:border-0">
                  <dt className="w-32 flex-shrink-0 text-[11px] uppercase tracking-[0.16em] text-gold-300/90 font-bold pt-0.5">{k}</dt>
                  <dd className="text-sm text-emerald-50/90 leading-relaxed">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- WHY ------------------------------- */

const WHY = [
  { icon: Factory, title: "Direct From Our Unit", text: "Your stock ships straight from the D GOLD packing unit to your shop. No wholesale layers, no repacking, no tampering." },
  { icon: Ban, title: "No Middlemen, No Retail Shop", text: "We deliberately run without outlets or distributors — so quality control and accountability stay with us alone." },
  { icon: MapPin, title: "Bengaluru-Only Focus", text: "We serve one city and serve it properly. Short routes mean fresher stock and dependable delivery windows." },
  { icon: Timer, title: "Freshness You Can Verify", text: "Batch details, packing date and best-before are printed on every 500g pouch. Check it yourself, every time." },
  { icon: PhoneCall, title: "Personal Price Discussion", text: "No confusing rate cards. Tell us your requirement and we finalise a fair package price with you on one call." },
  { icon: Store, title: "Made for Pan Shop Rhythm", text: "Small first orders, quick reorders, delivery slots that suit your counter hours — built around how your shop actually runs." },
];

export function Why() {
  return (
    <section id="why" className="relative bg-gradient-luxe py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="orb w-[420px] h-[420px] bg-emerald-700/25 -top-24 -left-24" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto">
          <SectionTag>Why Choose D GOLD</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            The dependable choice for <span className="text-gradient-gold">your counter.</span>
          </h2>
          <p className="mt-5 text-lg text-emerald-100/70">
            Premium is not a tagline — it is how we source, cut, pack and deliver.
          </p>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group h-full rounded-3xl glass border-emerald-300/10 hover:border-gold-400/40 p-7 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400/25 to-gold-600/15 border border-gold-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <w.icon className="w-[22px] h-[22px] text-gold-400" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">{w.title}</h3>
                <p className="mt-2.5 text-sm text-emerald-100/65 leading-relaxed">{w.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- HOW IT WORKS --------------------------- */

const STEPS = [
  { icon: ClipboardList, title: "Book Online", text: "Pick your pack and quantity, share your Bengaluru address and preferred slot. Takes under a minute." },
  { icon: PhoneCall, title: "We Call You", text: "Our team confirms availability, finalises your package price and locks the delivery window — on one short call." },
  { icon: PackageCheck, title: "We Prepare Fresh Stock", text: "Your pouches are checked, sealed and allotted from the freshest batch at our packing unit." },
  { icon: Truck, title: "Doorstep Delivery", text: "Track your order status online. Your stock arrives at your pan shop within your chosen slot — anywhere in Bengaluru." },
];

export function HowItWorks() {
  const { openBooking } = useStore();
  return (
    <section id="how" className="relative bg-ivory text-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-emerald-700/8 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto">
          <SectionTag light>How Ordering Works</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Four steps. <span className="text-gold-600">Zero hassle.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl bg-white border border-emerald-900/8 p-7 shadow-[0_18px_45px_-20px_rgba(6,48,31,0.25)] hover:shadow-[0_24px_55px_-20px_rgba(6,48,31,0.35)] hover:-translate-y-1.5 transition-all duration-300">
                <div className="absolute top-6 right-6 font-display text-5xl font-bold text-emerald-900/8">{i + 1}</div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <s.icon className="w-[22px] h-[22px] text-emerald-950" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2.5 text-sm text-emerald-900/65 leading-relaxed">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-12 text-center">
          <button onClick={() => openBooking()} className="btn-gold px-8 py-4 text-base">
            Start Your Booking
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- DELIVERY ----------------------------- */

const AREAS = [
  "Jayanagar", "Malleshwaram", "Koramangala", "Rajajinagar", "KR Market", "Shivajinagar",
  "Indiranagar", "Yelahanka", "Whitefield", "Basavanagudi", "HSR Layout", "Vijayanagar",
  "Hebbal", "BTM Layout", "Marathahalli", "Banashankari", "Electronic City", "RT Nagar",
];

export function Delivery() {
  const { settings, openBooking } = useStore();
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<"ok" | "bad" | "invalid" | null>(null);

  const check = () => {
    if (!/^\d{6}$/.test(pin.trim())) {
      setResult("invalid");
      return;
    }
    setResult(isBengaluruPin(pin, settings) ? "ok" : "bad");
  };

  return (
    <section id="delivery" className="relative bg-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="orb w-[460px] h-[460px] bg-gold-500/12 top-0 right-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <SectionTag>Delivery Information</SectionTag>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              One city, done right.<br />
              <span className="text-gradient-gold">Bengaluru Only.</span>
            </h2>
            <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">{settings.deliveryNote}</p>
            <div className="mt-7 space-y-3.5">
              {[
                "Delivery slots: " + settings.slots.join(" · "),
                "Choose your preferred delivery date at booking",
                "Order updates: track online with your Order ID, or ping us on WhatsApp",
                "We currently do not deliver outside Bengaluru — other cities, districts and states are not serviceable",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 text-sm text-emerald-100/80">
                  <CheckCircle2 className="w-[18px] h-[18px] text-gold-400 flex-shrink-0 mt-0.5" />
                  {t}
                </div>
              ))}
            </div>
            <a
              href={waLink(settings.whatsapp, "Hello D GOLD! Is my area in Bengaluru serviceable for delivery? My PIN code is ")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#25D366] hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Ask about your area on WhatsApp
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-[2rem] glass border-gold-400/25 p-7 sm:p-9 bg-emerald-900/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <Search className="w-5 h-5 text-emerald-950" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">Check Your PIN Code</h3>
                  <p className="text-xs text-emerald-100/60">Bengaluru Urban pincodes (560xxx) are serviceable</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2.5">
                <input
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setResult(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && check()}
                  inputMode="numeric"
                  placeholder="e.g. 560041"
                  aria-label="PIN code"
                  className="field flex-1 text-lg tracking-[0.2em] font-semibold"
                />
                <button onClick={check} className="btn-gold px-6">Check</button>
              </div>

              {result === "ok" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-emerald-400/10 border border-emerald-400/40 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-300">Great news — we deliver to {pin}!</p>
                    <button onClick={() => openBooking()} className="mt-1.5 text-sm font-semibold text-gold-300 underline underline-offset-4">
                      Book your delivery now →
                    </button>
                  </div>
                </motion.div>
              )}
              {result === "bad" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-rose-400/10 border border-rose-400/40 p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-rose-200">{OUT_OF_AREA_MESSAGE}</p>
                </motion.div>
              )}
              {result === "invalid" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-amber-300 font-medium">
                  Please enter a valid 6-digit PIN code.
                </motion.p>
              )}

              <div className="mt-7 pt-6 border-t border-white/10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-300/80 font-bold mb-3">
                  Delivering daily across
                </p>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-full bg-white/5 border border-emerald-300/15 text-xs font-medium text-emerald-100/75">
                      {a}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-xs font-semibold text-gold-300">
                    + all Bengaluru Urban
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
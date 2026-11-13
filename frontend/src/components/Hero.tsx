import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle, ShieldCheck, Leaf, Timer, BadgeCheck } from "lucide-react";
import ProductPack, { DEFAULT_PRODUCT_IMAGE } from "./ProductPack";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/helpers";
import { Reveal } from "./ui";

export default function Hero() {
  const { openBooking, settings, products } = useStore();
  const hero = products.find((p) => p.available) ?? products[0];

  return (
    <section className="relative overflow-hidden bg-gradient-luxe grain pt-40 pb-16 sm:pt-44">
      <div className="orb w-[520px] h-[520px] bg-emerald-700/30 -top-40 -left-40" />
      <div className="orb w-[560px] h-[560px] bg-gold-500/15 top-1/4 -right-48" />
      <div className="absolute inset-0 dot-pattern opacity-25" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-gold-400/30"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[11px] sm:text-xs font-semibold text-gold-300 tracking-[0.18em] uppercase">
                Bengaluru Only · Direct Doorstep Delivery
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="mt-6 font-display text-[2.6rem] leading-[1.06] sm:text-6xl xl:text-[4.4rem] font-bold text-white tracking-tight"
            >
              Experience Premium Quality{" "}
              <span className="block text-gradient-gold mt-1">Chali Cut Supari</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16 }}
              className="mt-6 text-base sm:text-lg text-emerald-100/75 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              D GOLD brings hygienically processed, 100% natural chali cut supari straight from our
              packing unit to your pan shop — anywhere in Bengaluru. Book online in a minute,
              confirm the details on one call, and receive fresh stock at your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <motion.button
                onClick={() => openBooking()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-gold w-full sm:w-auto px-8 py-4 text-base group"
              >
                Book Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.a
                href="#product"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass border-emerald-300/25 text-white font-semibold text-base text-center hover:border-gold-400/40 transition-colors"
              >
                Explore Products
              </motion.a>
            </motion.div>

            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              href={waLink(settings.whatsapp, "Hello D GOLD! I'd like to know more about your Premium Chali Cut Supari (Bengaluru delivery).")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
              </span>
              Chat on WhatsApp · +91 {settings.whatsapp}
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[360px]"
          >
            <ProductPack image={hero?.image ?? DEFAULT_PRODUCT_IMAGE} />
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -right-3 sm:-right-8 top-10 glass rounded-2xl px-4 py-3 border-gold-400/30 shadow-xl"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-gold-400" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">FSSAI Licensed</div>
                  <div className="text-[10px] text-emerald-100/60">21226172000535</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
              className="absolute -left-3 sm:-left-10 bottom-16 glass rounded-2xl px-4 py-3 border-gold-400/30 shadow-xl"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-gold-400" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Doorstep Delivery</div>
                  <div className="text-[10px] text-emerald-100/60">Bengaluru Only</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Label facts — no invented statistics */}
        <Reveal delay={0.2} className="mt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden glass border-emerald-300/10">
            {[
              { icon: Leaf, title: "100% Natural", sub: "Selected premium arecanut" },
              { icon: BadgeCheck, title: "No Preservatives", sub: "No artificial flavours" },
              { icon: Timer, title: "6-Month Freshness", sub: "Sealed, moisture-locked pouch" },
              { icon: ShieldCheck, title: "Hygienically Processed", sub: "FSSAI licensed unit" },
            ].map((f, i) => (
              <div key={i} className="bg-emerald-950/50 backdrop-blur-md p-5 sm:p-6 flex items-start gap-3 hover:bg-emerald-900/50 transition-colors">
                <f.icon className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white">{f.title}</div>
                  <div className="text-xs text-emerald-100/55 mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
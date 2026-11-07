import { motion } from "framer-motion";
import { Star } from "lucide-react";

const brands = [
  "Pan Palace",
  "Tambul Wala",
  "Royal Paan",
  "Chai & Supari Co.",
  "Desi Dukaan",
  "Supari King",
  "Paan Express",
  "Mukwas Mart",
];

export default function SocialProof() {
  return (
    <section className="relative py-16 bg-emerald-950/60 border-y border-emerald-300/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
            ))}
            <span className="ml-2 text-sm font-medium text-emerald-100/80">
              4.9/5 from 2,000+ pan shop owners
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/60 font-semibold">
            Trusted by India's leading pan shops &amp; retailers
          </p>
        </motion.div>

        {/* Marquee */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-emerald-950 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-950 to-transparent z-10" />

          <div className="flex marquee gap-12 items-center">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl glass border-emerald-300/10"
              >
                <div className="w-2 h-2 rounded-full bg-gold-400" />
                <span className="font-display text-xl font-semibold text-emerald-100/70 whitespace-nowrap">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
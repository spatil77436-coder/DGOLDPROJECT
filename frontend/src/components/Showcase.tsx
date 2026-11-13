import { motion } from "framer-motion";
import { CheckCircle2, Crown, Eye, Hand } from "lucide-react";
import { useState } from "react";

export default function Showcase() {
  const [active, setActive] = useState(0);
  const steps = [
    {
      icon: Eye,
      title: "See the Quality",
      description: "Each grain cut to perfect uniform size with a golden-amber hue that signals premium arecanut.",
    },
    {
      icon: Hand,
      title: "Feel the Texture",
      description: "Crisp yet tender — the signature Chali Cutting texture that delivers the perfect bite.",
    },
    {
      icon: Crown,
      title: "Taste the Difference",
      description: "Rich, full-bodied natural flavour that transforms every paan into a premium experience.",
    },
  ];

  return (
    <section id="product" className="relative py-24 sm:py-32 overflow-hidden bg-emerald-950">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="orb w-[500px] h-[500px] bg-gold-500/10 top-1/4 -right-32" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-400/20 animate-[spin_30s_linear_infinite]" />

              {/* Inner glow */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gold-400/20 via-emerald-700/30 to-emerald-950/40 blur-2xl" />

              {/* Main showcase circle */}
              <div className="absolute inset-12 rounded-full overflow-hidden glass border-gold-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-amber-50 to-orange-100/80">
                  {/* Arecanut grains */}
                  <div className="absolute inset-0 p-8">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.015 }}
                        className="absolute rounded-full"
                        style={{
                          left: `${5 + (i * 13.7) % 90}%`,
                          top: `${5 + (i * 9.3) % 90}%`,
                          width: `${10 + (i % 4) * 4}px`,
                          height: `${8 + (i % 3) * 3}px`,
                          background: `linear-gradient(135deg, rgba(${190 + (i % 30)}, ${140 + (i % 25)}, ${70 + (i % 20)}, 0.95), rgba(${160 + (i % 20)}, ${110 + (i % 15)}, ${50 + (i % 15)}, 0.95))`,
                          transform: `rotate(${(i * 23) % 360}deg)`,
                          boxShadow: `0 2px 6px rgba(${140 + (i % 20)}, ${90 + (i % 15)}, ${30 + (i % 10)}, 0.4)`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/30 via-transparent to-white/20" />
                </div>

                {/* Center badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full bg-gradient-gold shadow-gold flex items-center justify-center text-center"
                  >
                    <div>
                      <div className="text-[10px] tracking-widest text-emerald-950 font-bold">100%</div>
                      <div className="font-display text-2xl font-bold text-emerald-950 leading-none mt-1">PURE</div>
                      <div className="text-[8px] tracking-widest text-emerald-950/80 font-bold mt-1">NATURAL</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating badges */}
              {[
                { icon: CheckCircle2, label: "FSSAI", pos: "top-4 right-4" },
                { icon: Crown, label: "Premium", pos: "bottom-4 left-4" },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                  className={`absolute ${badge.pos} glass-light rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2`}
                >
                  <badge.icon className="w-4 h-4 text-gold-600" />
                  <span className="text-xs font-bold text-emerald-900">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-gold-400/30 mb-4">
              <span className="text-xs font-medium text-gold-300 tracking-widest uppercase">
                The Product
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              A 500g pack that <br />
              <span className="text-gradient-gold">speaks luxury.</span>
            </h2>

            <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">
              Every D Gold pouch is a statement of quality. Premium-grade arecanut, precision-cut, packed within hours of processing—delivering the authentic taste your customers deserve.
            </p>

            <div className="mt-10 space-y-3">
              {steps.map((step, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                    active === i
                      ? "glass border-gold-400/40 shadow-gold"
                      : "glass border-emerald-300/10 hover:border-emerald-300/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        active === i
                          ? "bg-gradient-gold text-emerald-950"
                          : "bg-emerald-900/40 text-emerald-200"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-white">
                        {step.title}
                      </h3>
                      <p
                        className={`mt-1.5 text-sm leading-relaxed transition-all ${
                          active === i ? "text-emerald-100/80" : "text-emerald-100/50"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
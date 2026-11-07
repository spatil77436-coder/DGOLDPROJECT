import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Package } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    subtitle: "Perfect to try",
    quantity: "50 kg",
    price: "₹165",
    unit: "/ kg",
    description: "Ideal for new pan shops wanting to test premium quality.",
    features: [
      "500g retail-ready pouches",
      "Free shipping on this tier",
      "Marketing poster included",
      "Basic WhatsApp support",
      "Mixed batch sizes available",
    ],
    cta: "Start Small",
    highlighted: false,
  },
  {
    name: "Growth",
    subtitle: "Most Popular",
    quantity: "200 kg",
    price: "₹155",
    unit: "/ kg",
    description: "For established shops ready to upgrade their offering.",
    features: [
      "Everything in Starter",
      "Premium counter display",
      "Sample pouches for customers",
      "Priority dispatch (24hr)",
      "Dedicated relationship manager",
      "Free replacement guarantee",
    ],
    cta: "Scale Up",
    highlighted: true,
  },
  {
    name: "Distributor",
    subtitle: "Bulk Wholesale",
    quantity: "1000 kg+",
    price: "Custom",
    unit: "pricing",
    description: "For distributors and large retail chains.",
    features: [
      "Everything in Growth",
      "Territory exclusivity options",
      "Co-branded packaging",
      "White-label available",
      "Direct factory pricing",
      "Quarterly business planning",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-luxe">
      <div className="orb w-[400px] h-[400px] bg-emerald-700/20 bottom-0 right-0" />
      <div className="orb w-[400px] h-[400px] bg-gold-500/10 top-20 left-1/3" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-gold-400/30 mb-4">
            <Package className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium text-gold-300 tracking-widest uppercase">
              Wholesale Plans
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Premium quality, <br />
            <span className="text-gradient-gold">fair pricing.</span>
          </h2>
          <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">
            Flexible wholesale plans for every size of pan shop—from a single counter to multi-city distribution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`relative ${plan.highlighted ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-gold text-emerald-950 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-gold">
                    <Crown className="w-3.5 h-3.5" />
                    Best Value
                  </div>
                </div>
              )}

              <div
                className={`relative h-full rounded-3xl p-8 transition-all duration-500 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 border-2 border-gold-400/50 shadow-gold"
                    : "glass border-emerald-300/10 hover:border-gold-400/30"
                } ${hovered === i ? "scale-[1.02]" : ""}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  <span className="text-xs font-medium text-emerald-100/50 uppercase tracking-wider">
                    {plan.quantity}
                  </span>
                </div>
                <div className="text-sm text-gold-300 mb-6">{plan.subtitle}</div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-5xl font-bold text-gradient-gold">
                    {plan.price}
                  </span>
                  <span className="text-emerald-100/60 text-sm">{plan.unit}</span>
                </div>

                <p className="text-sm text-emerald-100/60 mb-8">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.highlighted ? "bg-gradient-gold" : "bg-emerald-700/40"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.highlighted ? "text-emerald-950" : "text-emerald-100"}`} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-emerald-100/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.a
                  href="#cta"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-gold text-emerald-950 shadow-gold shine-effect"
                      : "bg-white/5 text-white border border-emerald-300/20 hover:bg-white/10"
                  }`}
                >
                  <span className="relative z-10">{plan.cta}</span>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-emerald-100/50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          All prices exclusive of GST. Free shipping on orders above 100kg.
        </motion.p>
      </div>
    </section>
  );
}
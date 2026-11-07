import { motion } from "framer-motion";
import { TrendingUp, Users, Package, DollarSign, Clock, Repeat } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Higher Repeat Orders",
    description: "Premium taste = loyal customers. Pan shops report up to 40% increase in repeat paan orders.",
    stat: "40%",
    statLabel: "Repeat Lift",
  },
  {
    icon: DollarSign,
    title: "Better Margins",
    description: "Premium positioning means healthier margins per gram. Premium brands command premium prices.",
    stat: "2.5x",
    statLabel: "Higher Margin",
  },
  {
    icon: Users,
    title: "Wider Customer Base",
    description: "Attract quality-conscious customers seeking authentic, premium supari for their paan experience.",
    stat: "10x",
    statLabel: "Footfall Quality",
  },
  {
    icon: Package,
    title: "Bulk Supply Ready",
    description: "From 50kg to 5000kg orders—we scale with your business. Consistent supply, no stockouts.",
    stat: "5T",
    statLabel: "Bulk Capacity",
  },
  {
    icon: Clock,
    title: "Fast Restocking",
    description: "24-hour dispatch on reorders. Never lose a sale to 'out of stock' again.",
    stat: "24hr",
    statLabel: "Express Dispatch",
  },
  {
    icon: Repeat,
    title: "Subscription Model",
    description: "Set-and-forget recurring deliveries. Predictable inventory, predictable revenue.",
    stat: "Auto",
    statLabel: "Reorder",
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-luxe">
      <div className="orb w-[400px] h-[400px] bg-emerald-700/20 -top-20 -left-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-gold-400/30 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-medium text-gold-300 tracking-widest uppercase">
              Built for Your Business
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Numbers that <span className="text-gradient-gold">grow your shop.</span>
          </h2>
          <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">
            Stocking D Gold isn't just selling supari—it's upgrading your entire pan shop business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-3xl glass border-emerald-300/10 hover:border-gold-400/40 overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 p-6">
                  <div className="text-right">
                    <div className="font-display text-3xl font-bold text-gradient-gold leading-none">
                      {benefit.stat}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-100/40 mt-1">
                      {benefit.statLabel}
                    </div>
                  </div>
                </div>

                <div className="relative mt-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/30 mb-4">
                    <benefit.icon className="w-6 h-6 text-gold-400" />
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-emerald-100/60 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
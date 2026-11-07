import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Owner, Shree Krishna Paan Bhandar",
    location: "Patna, Bihar",
    rating: 5,
    quote: "Switched to D Gold 8 months ago—my customers instantly noticed the taste difference. Repeat orders jumped 35% in just two months. Best business decision I've made.",
    initials: "RK",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    name: "Priya Sharma",
    role: "Proprietor, Royal Tambul Corner",
    location: "Mumbai, Maharashtra",
    rating: 5,
    quote: "The packaging screams premium, the taste delivers premium. My regulars now specifically ask for 'D Gold wala supari'. It's become my signature offering.",
    initials: "PS",
    color: "from-gold-400 to-gold-600",
  },
  {
    name: "Mohammed Iqbal",
    role: "Distributor, Iqra Trading Co.",
    location: "Lucknow, UP",
    rating: 5,
    quote: "Consistent batch quality, zero complaints from retailers, and 24-hour dispatch. As a distributor, D Gold has made my entire supply chain effortless.",
    initials: "MI",
    color: "from-purple-500 to-violet-600",
  },
  {
    name: "Anil Verma",
    role: "Owner, Verma Paan Stall",
    location: "Delhi NCR",
    rating: 5,
    quote: "Earlier customers bought whichever supari was cheapest. With D Gold, they're willing to pay premium for quality. My profit per paan doubled.",
    initials: "AV",
    color: "from-rose-500 to-pink-600",
  },
  {
    name: "Suresh Patel",
    role: "Wholesale Stockist",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    quote: "Started with 50kg trial order. Within 3 months, I was ordering 500kg monthly. The demand keeps growing because the product genuinely delivers.",
    initials: "SP",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Kavita Reddy",
    role: "Owner, Reddy's Paan Palace",
    location: "Hyderabad, Telangana",
    rating: 5,
    quote: "The 6-month shelf life is a game changer. No more wastage, no more stale stock. And the freshness lock packaging keeps every grain crisp till the last bite.",
    initials: "KR",
    color: "from-amber-500 to-orange-600",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32 overflow-hidden bg-emerald-950">
      <div className="orb w-[500px] h-[500px] bg-gold-500/15 top-1/4 left-0" />
      <div className="absolute inset-0 dot-pattern opacity-15" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-gold-400/30 mb-4">
            <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
            <span className="text-xs font-medium text-gold-300 tracking-widest uppercase">
              Real Stories
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Loved by pan shop <br />
            <span className="text-gradient-gold">owners across India.</span>
          </h2>
          <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">
            Don't take our word for it. Hear from the 10,000+ retailers who've made D Gold their #1 choice.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="relative h-full p-7 rounded-3xl glass border-emerald-300/10 hover:border-gold-400/40 transition-all duration-500 overflow-hidden">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-10 h-10 text-gold-400/20 group-hover:text-gold-400/40 transition-colors" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>

                <p className="text-emerald-100/80 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-emerald-300/10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-emerald-100/50">{t.role}</div>
                    <div className="text-xs text-gold-400 mt-0.5">{t.location}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
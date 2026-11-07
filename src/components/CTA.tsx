import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Crown, Check } from "lucide-react";
import { useState } from "react";

export default function CTA() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <section id="cta" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-luxe">
      <div className="orb w-[600px] h-[600px] bg-gold-500/15 top-0 left-1/2 -translate-x-1/2" />
      <div className="orb w-[400px] h-[400px] bg-emerald-700/30 -bottom-20 -right-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-gold-400/30 mb-4">
              <Crown className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-medium text-gold-300 tracking-widest uppercase">
                Limited Distributor Slots
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Ready to upgrade <br />
              your <span className="text-gradient-gold">pan shop?</span>
            </h2>

            <p className="mt-6 text-lg text-emerald-100/70 leading-relaxed">
              Join 10,000+ retailers who transformed their business with D Gold. Get wholesale pricing, marketing support, and a dedicated partner.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Phone, label: "Call us", value: "+91 63666 74568 / +91 63666 745687" },
                { icon: Mail, label: "Email us", value: "dgoldsupari@gmail.com" },
                { icon: MapPin, label: "Visit us", value: "Koregundi Road, Nethru Nagar, New Market Vaid, Post-Sinsi, Sirsi, Uttara Kannada – 581402" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold-300/80 font-semibold">
                      {item.label}
                    </div>
                    <div className="text-emerald-100/80 mt-1">
                      {item.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {["FSSAI Certified", "ISO Standards", "Pan India Delivery", "Best Margins"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full glass border-emerald-300/20 text-xs font-medium text-emerald-100/70"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 to-emerald-600/20 blur-3xl rounded-3xl" />
              <div className="relative glass-light rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="font-display text-3xl font-bold text-emerald-950">
                    Get Wholesale Quote
                  </h3>
                  <p className="text-emerald-900/60 mt-2 text-sm">
                    Fill the form and our team will reach out within 2 hours.
                  </p>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center mb-4 shadow-gold">
                      <Check className="w-10 h-10 text-emerald-950" strokeWidth={3} />
                    </div>
                    <h4 className="font-display text-2xl font-bold text-emerald-950">
                      Request Received!
                    </h4>
                    <p className="text-emerald-900/70 mt-2">
                      Our team will contact you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 block">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your shop name"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 block">
                          Phone
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 block">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your city"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1.5 block">
                        Estimated Monthly Quantity
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-900/10 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                      >
                        <option value="">Select quantity</option>
                        <option>50 kg – 100 kg (Starter)</option>
                        <option>100 kg – 500 kg (Growth)</option>
                        <option>500 kg – 1000 kg (Bulk)</option>
                        <option>1000 kg+ (Distributor)</option>
                      </select>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full bg-gradient-gold text-emerald-950 font-bold py-4 rounded-xl shadow-gold flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Request Quote
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </motion.button>

                    <p className="text-xs text-emerald-900/50 text-center mt-3">
                      By submitting, you agree to receive business communication from D Gold.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
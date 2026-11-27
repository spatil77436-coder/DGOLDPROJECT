import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle,Lock, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/helpers";
import { Reveal } from "./ui";

export default function Footer() {
  const { settings, openBooking, setTrackOpen } = useStore();

  return (
    <footer className="relative bg-emerald-950 border-t border-gold-400/15 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-10" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-5 text-sm text-emerald-100/60 leading-relaxed max-w-sm">
                D GOLD — Premium Quality Chali Cut Supari. Packed with care in Sirsi, delivered directly
                to pan shops across <strong className="text-gold-300">Bengaluru only</strong>. No retail
                outlets, no middlemen — just honest premium supari at your doorstep.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-emerald-100/50">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                FSSAI Lic. No. 21226172000535
              </div>
              <div className="mt-5 flex gap-2.5">
                <motion.a
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  href={`tel:+91${settings.phone}`}
                  aria-label="Call D GOLD"
                  className="w-10 h-10 rounded-xl glass border-emerald-300/15 flex items-center justify-center text-emerald-100/70 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  href={waLink(settings.whatsapp, "Hello D GOLD!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp D GOLD"
                  className="w-10 h-10 rounded-xl glass border-emerald-300/15 flex items-center justify-center text-emerald-100/70 hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  href={`mailto:${settings.email}`}
                  aria-label="Email D GOLD"
                  className="w-10 h-10 rounded-xl glass border-emerald-300/15 flex items-center justify-center text-emerald-100/70 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            <div>
              <h4 className="font-display text-base font-bold text-white mb-4">Explore</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ["About D GOLD", "#about"],
                  ["Our Premium Product", "#product"],
                  ["Why Choose Us", "#why"],
                  ["How Ordering Works", "#how"],
                  ["Delivery Information", "#delivery"],
                  ["FAQ", "#faq"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <motion.a
                      whileHover={{ x: 3 }}
                      href={href}
                      className="text-emerald-100/60 hover:text-gold-300 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold-400 scale-0 group-hover:scale-100 transition-transform" />
                      {label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-base font-bold text-white mb-4">Orders & Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <motion.button
                    whileHover={{ x: 3 }}
                    onClick={() => openBooking()}
                    className="text-emerald-100/60 hover:text-gold-300 transition-colors cursor-pointer"
                  >
                    Book an Order
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    whileHover={{ x: 3 }}
                    onClick={() => setTrackOpen(true)}
                    className="text-emerald-100/60 hover:text-gold-300 transition-colors cursor-pointer"
                  >
                    Track Your Order
                  </motion.button>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 3 }}
                    href={`tel:+91${settings.phone}`}
                    className="text-emerald-100/60 hover:text-gold-300 transition-colors inline-block"
                  >
                    +91 {settings.phone}
                  </motion.a>
                </li>
                <li>
                  <motion.a
                    whileHover={{ x: 3 }}
                    href={`mailto:${settings.email}`}
                    className="text-emerald-100/60 hover:text-gold-300 transition-colors break-all inline-block"
                  >
                    {settings.email}
                  </motion.a>
                </li>
              </ul>
              <div className="mt-5 flex items-start gap-2 text-xs text-emerald-100/50 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
                {settings.unitAddress}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 pt-7 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-emerald-100/45 text-center sm:text-left">
            © {new Date().getFullYear()} D GOLD SUPARI · Premium Quality · Serving Bengaluru Only
          </p>
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="#admin"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-100/50 hover:text-gold-300 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Admin Login
            </motion.a>
            
          </div>
        </div>

        <p className="mt-6 text-[10px] leading-relaxed text-emerald-100/30 max-w-3xl">
          Statutory note: chewing arecanut (supari) is injurious to health. Sale permitted to adults as per applicable law.
        </p>
      </div>
    </footer>
  );
}
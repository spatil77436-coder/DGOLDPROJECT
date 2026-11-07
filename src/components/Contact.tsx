import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight, Clock, Globe } from "lucide-react";
import { Reveal, SectionTag } from "./ui";
import { useStore } from "../context/StoreContext";
import { waLink } from "../lib/helpers";

export default function Contact() {
  const { settings, openBooking } = useStore();

  const cards = [
    {
      icon: Phone,
      label: "Call Us",
      value: `+91 ${settings.phone}`,
      sub: "Orders, pricing & support",
      href: `tel:+91${settings.phone}`,
      accent: "from-gold-400 to-gold-600",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `+91 ${settings.whatsapp}`,
      sub: "Quick order enquiries",
      href: waLink(settings.whatsapp, "Hello D GOLD! I run a pan shop in Bengaluru and I'd like to enquire about Premium Chali Cut Supari."),
      accent: "from-[#25D366] to-[#128C4B]",
      external: true,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      sub: "Business correspondence",
      href: `mailto:${settings.email}`,
      accent: "from-sky-500 to-blue-600",
    },
  ];

  return (
    <section id="contact" className="relative bg-gradient-luxe py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="orb w-[520px] h-[520px] bg-gold-500/12 -top-32 left-1/3" />
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto">
          <SectionTag>Contact Information</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            One call is all it takes to <span className="text-gradient-gold">go gold.</span>
          </h2>
          <p className="mt-5 text-lg text-emerald-100/70">
            Book online, or reach us directly — we're happy to talk supari.
          </p>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <motion.a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                whileHover={{ y: -6 }}
                className="block h-full rounded-3xl glass border-emerald-300/10 hover:border-gold-400/40 p-7 text-center transition-colors"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${c.accent} flex items-center justify-center shadow-lg`}>
                  <c.icon className="w-6 h-6 text-white" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-gold-300/80 font-bold">{c.label}</p>
                <p className="mt-1.5 font-bold text-white text-lg break-all">{c.value}</p>
                <p className="text-xs text-emerald-100/55 mt-1">{c.sub}</p>
              </motion.a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 rounded-3xl glass border-gold-400/25 p-7 sm:p-9 grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-300/80 font-bold">Packing Unit</p>
                <p className="mt-1.5 text-sm text-emerald-100/80 leading-relaxed">{settings.unitAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <Globe className="w-5 h-5 text-gold-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-300/80 font-bold">Service Area</p>
                <p className="mt-1.5 text-sm text-emerald-100/80 leading-relaxed">
                  <strong className="text-white">Bengaluru Only</strong> — doorstep delivery to pan shops across Bengaluru Urban (560xxx).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-gold-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold-300/80 font-bold">Delivery Slots</p>
                <p className="mt-1.5 text-sm text-emerald-100/80 leading-relaxed">{settings.slots.join(" · ")}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-12 text-center">
          <button onClick={() => openBooking()} className="btn-gold px-10 py-[18px] text-lg group">
            Book Your First Order
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs text-emerald-100/50">Free to book · Price confirmed on call · Bengaluru only</p>
        </Reveal>
      </div>
    </section>
  );
}
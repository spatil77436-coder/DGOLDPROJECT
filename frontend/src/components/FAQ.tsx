import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal, SectionTag } from "./ui";
import { useStore } from "../context/StoreContext";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { settings } = useStore();

  const faqs = [
    {
      q: "What is D GOLD Premium Chali Cut Supari?",
      a: "It is premium-quality supari made from 100% natural, selected arecanuts — hygienically processed and precision chali-cut into uniform pieces. No added preservatives, no artificial flavours. Every pouch is sealed for freshness and carries its batch and best-before details.",
    },
    {
      q: "Where do you deliver?",
      a: "Bengaluru only. We currently accept orders exclusively within Bengaluru (Bengaluru Urban, PIN codes starting 560). We do not deliver to other Karnataka cities, other districts, or other states. Your PIN code is verified during booking.",
    },
    {
      q: "Do you have a shop I can visit?",
      a: "No — D GOLD is a direct-delivery brand. We have no retail outlet or walk-in counter. You book online or on call, and fresh stock arrives at your pan shop's doorstep in your chosen slot.",
    },
    {
      q: "How is the price decided? Why is it 'on call'?",
      a: "We show pricing by package size, never per gram. Package prices are confirmed personally on a short call after you book, based on your pack and quantity — so you always get a fair, current price with no hidden charges. Your order total is locked before delivery.",
    },
    {
      q: "How do I place an order?",
      a: "Tap Book Now, choose your package size and quantity, enter your Bengaluru delivery address and PIN code, pick a date and time slot, review your order and submit. You'll get an Order ID instantly, and our team will call you to confirm.",
    },
    {
      q: "How can I track my booking?",
      a: "Use Track Order in the menu with your Order ID and mobile number. You'll see live status — Pending, Confirmed, Preparing, Out for Delivery, Delivered. You can also message us on WhatsApp at +91 " + settings.whatsapp + " for updates.",
    },
    {
      q: "What is the shelf life? How should I store it?",
      a: "Best before 6 months from packaging. Store in a cool, dry and hygienic place, away from direct sunlight. Do not refrigerate — the sealed pouch keeps the supari fresh on your shelf.",
    },
    {
      q: "Is D GOLD FSSAI licensed?",
      a: "Yes. D GOLD SUPARI is FSSAI licensed — Licence No. 21226172000535, printed on every pouch along with our Sirsi (Uttara Kannada) packing unit address.",
    },
  ];

  return (
    <section id="faq" className="relative bg-ivory text-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute top-0 right-0 w-[360px] h-[360px] rounded-full bg-gold-400/10 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-14">
          <SectionTag light>Frequently Asked Questions</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Good questions, <span className="text-gold-600">honest answers.</span>
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={Math.min(i * 0.04, 0.3)}>
              <div className={`rounded-2xl border overflow-hidden transition-all duration-300 bg-white ${open === i ? "border-gold-500/60 shadow-[0_16px_40px_-18px_rgba(184,137,43,0.4)]" : "border-emerald-900/10 hover:border-emerald-900/25"}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="font-display text-lg font-bold">{f.q}</span>
                  <motion.span
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${open === i ? "bg-gradient-gold text-emerald-950" : "bg-emerald-900/5 text-emerald-800"}`}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-emerald-900/70 leading-relaxed text-[15px]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
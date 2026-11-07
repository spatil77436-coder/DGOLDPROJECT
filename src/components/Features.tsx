import { motion } from "framer-motion";
import { Leaf, Scissors, ShieldCheck, Lock, Award, Flame } from "lucide-react";
import { Reveal, SectionTag } from "./ui";

const FEATURES = [
  {
    icon: Leaf,
    title: "100% Natural Arecanut",
    text: "Only selected premium arecanuts go into a D GOLD pouch. The ingredient list is exactly one line: Arecanut (Supari).",
    tone: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Scissors,
    title: "Precision Chali Cut",
    text: "Uniform chali cutting gives every piece the same clean bite and marbled grain — so every paan you serve is consistent.",
    tone: "from-gold-400 to-gold-600",
  },
  {
    icon: ShieldCheck,
    title: "Hygienically Processed",
    text: "Processed and packed in an FSSAI-licensed unit under strict hygiene protocols. Perfect for every paan, every day.",
    tone: "from-sky-500 to-blue-600",
  },
  {
    icon: Lock,
    title: "Freshness-Locked Pouch",
    text: "The sealed 500g pouch holds natural aroma and crunch for 6 months. Store cool and dry, away from sunlight. Do not refrigerate.",
    tone: "from-teal-500 to-cyan-600",
  },
  {
    icon: Flame,
    title: "No Artificial Anything",
    text: "No added preservatives. No artificial flavours. The rich, honest taste comes from the nut itself — nothing else.",
    tone: "from-orange-500 to-amber-600",
  },
  {
    icon: Award,
    title: "Premium Taste, Pure Satisfaction",
    text: "A full-bodied, classic supari profile your regulars will recognise from the first bite — and ask for by name.",
    tone: "from-violet-500 to-purple-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-emerald-950 py-20 sm:py-28 scroll-mt-28 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-10" />
      <div className="orb w-[420px] h-[420px] bg-emerald-700/20 bottom-0 right-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto">
          <SectionTag>Product Features</SectionTag>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            What makes it <span className="text-gradient-gold">premium.</span>
          </h2>
          <p className="mt-5 text-lg text-emerald-100/70">
            Every claim below is printed on the pack — and honoured in every batch.
          </p>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group relative h-full rounded-3xl glass border-emerald-300/10 hover:border-gold-400/40 p-7 overflow-hidden transition-colors duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-emerald-600/0 group-hover:from-gold-400/8 group-hover:to-emerald-600/8 transition-all duration-500" />
                <div className="relative">
                  <div className={`inline-flex w-[52px] h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${f.tone} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">{f.title}</h3>
                  <p className="mt-2.5 text-sm text-emerald-100/65 leading-relaxed">{f.text}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
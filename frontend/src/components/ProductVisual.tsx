import { motion } from "framer-motion";
import { Leaf, Award, Sparkles } from "lucide-react";

export default function ProductVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/30 via-emerald-800/20 to-emerald-950/40 blur-3xl rounded-full" />

      {/* Floating leaves */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -left-8 z-10 text-gold-400 opacity-80"
      >
        <Leaf className="w-12 h-12 fill-gold-400/30" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [10, -5, 10] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/4 -right-6 z-10 text-emerald-400 opacity-70"
      >
        <Leaf className="w-8 h-8 fill-emerald-400/30 rotate-45" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -left-4 z-10 text-gold-300 opacity-60"
      >
        <Leaf className="w-6 h-6 fill-gold-300/40 -rotate-12" />
      </motion.div>

      {/* Main product card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 80 }}
        className="relative h-full w-full animate-float"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-950/50 border border-gold-400/20">
          {/* Package design recreation */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d2e] via-[#0e4a36] to-[#053528]" />

          {/* Top gold band */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-gold" />

          {/* Crown + D emblem */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <svg viewBox="0 0 80 70" className="w-20 h-16">
                <defs>
                  <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f4d27a" />
                    <stop offset="100%" stopColor="#b8892b" />
                  </linearGradient>
                </defs>
                {/* Crown */}
                <path
                  d="M18 22 L24 8 L30 18 L36 4 L40 14 L44 4 L50 18 L56 8 L62 22 Z"
                  fill="url(#emblemGold)"
                />
                <circle cx="40" cy="6" r="2" fill="url(#emblemGold)" />
                <circle cx="24" cy="8" r="1.5" fill="url(#emblemGold)" />
                <circle cx="56" cy="8" r="1.5" fill="url(#emblemGold)" />
                {/* Ornamental circle */}
                <circle cx="40" cy="42" r="22" fill="none" stroke="url(#emblemGold)" strokeWidth="1.5" />
                <circle cx="40" cy="42" r="18" fill="rgba(212, 164, 55, 0.05)" />
                {/* D */}
                <text
                  x="40"
                  y="52"
                  textAnchor="middle"
                  fontFamily="Playfair Display, serif"
                  fontWeight="700"
                  fontSize="26"
                  fill="url(#emblemGold)"
                >
                  D
                </text>
                {/* Flourishes */}
                <path
                  d="M15 42 Q10 36 18 30"
                  stroke="url(#emblemGold)"
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d="M65 42 Q70 36 62 30"
                  stroke="url(#emblemGold)"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
            </motion.div>
          </div>

          {/* D GOLD text */}
          <div className="absolute top-[40%] left-0 right-0 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-display text-7xl font-bold text-gradient-gold tracking-tight leading-none"
            >
              D GOLD
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-2 text-[10px] tracking-[0.4em] text-gold-300/80 font-medium"
            >
              PREMIUM QUALITY
            </motion.div>
          </div>

          {/* Chali Cutting text */}
          <div className="absolute top-[58%] left-0 right-0 text-center px-6">
            <h3 className="font-display text-3xl font-bold text-white tracking-wide">
              CHALI CUTTING SUPARI
            </h3>
            <div className="mt-2 text-[10px] tracking-[0.3em] text-gold-300 font-medium">
              PREMIUM TASTE · PURE SATISFACTION
            </div>
          </div>

          {/* Decorative dots */}
          <div className="absolute top-[68%] left-1/2 -translate-x-1/2 flex items-center gap-2 text-gold-400">
            <span className="w-1 h-1 rounded-full bg-gold-400" />
            <span className="text-[8px] tracking-[0.3em] text-gold-300 font-medium">
              100% NATURAL ARECANUT
            </span>
            <span className="w-1 h-1 rounded-full bg-gold-400" />
          </div>

          {/* Arecanut cutting badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
            className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-dashed border-gold-400/60 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-[8px] tracking-widest text-gold-300 font-semibold">
                ARECANUT
              </div>
              <div className="text-[8px] tracking-widest text-gold-300 font-semibold">
                CUTTING
              </div>
              <Sparkles className="w-3 h-3 text-gold-400 mx-auto mt-1" />
            </div>
          </motion.div>

          {/* Window showing product */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-32 left-8 right-8 h-32 rounded-2xl overflow-hidden border-2 border-gold-400/40 shadow-inner"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-50">
              {/* Arecanut texture simulation */}
              <div className="absolute inset-0 opacity-60">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${(i * 13) % 100}%`,
                      top: `${(i * 7) % 100}%`,
                      width: `${4 + (i % 4) * 2}px`,
                      height: `${4 + (i % 4) * 2}px`,
                      background: `rgba(${180 + (i % 30)}, ${130 + (i % 20)}, ${60 + (i % 20)}, ${0.4 + (i % 5) * 0.1})`,
                      transform: `rotate(${i * 23}deg)`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-amber-200/40 via-transparent to-white/20" />
            </div>
            {/* Window frame highlight */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold-400/30" />
          </motion.div>

          {/* Net weight badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.4, type: "spring" }}
            className="absolute bottom-8 left-8 bg-gradient-gold rounded-xl p-3 shadow-lg"
          >
            <div className="text-[8px] tracking-widest text-emerald-950 font-bold">
              NET WEIGHT
            </div>
            <div className="font-display text-3xl font-bold text-emerald-950 leading-none mt-0.5">
              500g
            </div>
          </motion.div>

          {/* Quality badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
            className="absolute bottom-10 right-8 flex items-center gap-1.5 text-gold-400"
          >
            <Award className="w-4 h-4" />
            <span className="text-[8px] tracking-widest font-semibold">
              FSSAI CERTIFIED
            </span>
          </motion.div>

          {/* Bottom curve gold border */}
          <svg
            className="absolute -bottom-1 left-0 right-0 w-full"
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 Q200,0 400,40 L400,80 L0,80 Z"
              fill="url(#bottomGrad)"
            />
          </svg>
        </div>

        {/* Outer ring */}
        <div className="absolute -inset-3 rounded-[2.5rem] border border-gold-400/20 -z-10" />
      </motion.div>

      {/* Pulse rings behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-full border border-gold-400/10 pulse-ring" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square rounded-full border border-emerald-400/10 pulse-ring"
        style={{ animationDelay: "1s" }}
      />
    </div>
  );
}
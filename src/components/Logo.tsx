import { motion } from "framer-motion";

export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full leaf-glow">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4d27a" />
              <stop offset="50%" stopColor="#e8b94a" />
              <stop offset="100%" stopColor="#b8892b" />
            </linearGradient>
          </defs>
          {/* Crown */}
          <path
            d="M16 18 L20 8 L24 16 L28 6 L32 14 L36 6 L40 16 L44 8 L48 18 Z"
            fill="url(#goldGrad)"
          />
          {/* Circle border */}
          <circle cx="32" cy="38" r="20" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
          {/* Inner circle */}
          <circle cx="32" cy="38" r="16" fill="rgba(10, 61, 46, 0.4)" />
          {/* D letter */}
          <text
            x="32"
            y="46"
            textAnchor="middle"
            fontFamily="Playfair Display, serif"
            fontWeight="700"
            fontSize="22"
            fill="url(#goldGrad)"
          >
            D
          </text>
          {/* Decorative leaves */}
          <path
            d="M12 38 Q8 38 8 34 Q8 30 12 30"
            fill="url(#goldGrad)"
            opacity="0.7"
          />
          <path
            d="M52 38 Q56 38 56 34 Q56 30 52 30"
            fill="url(#goldGrad)"
            opacity="0.7"
          />
        </svg>
      </motion.div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-2xl font-bold text-gradient-gold tracking-tight">
          D Gold
        </span>
        <span className="text-[10px] tracking-[0.3em] text-emerald-300/70 font-medium uppercase mt-0.5">
          Premium Supari
        </span>
      </div>
    </div>
  );
}
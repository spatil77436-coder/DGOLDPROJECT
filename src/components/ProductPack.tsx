import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

/* Faithful reproduction of the actual D GOLD 500g pouch artwork.
   When the admin uploads the real product photograph, it replaces the
   artwork everywhere (object-contain — never cropped or stretched). */

const SHARDS: { x: number; y: number; r: number; s: number; v: number }[] = [
  { x: 18, y: 22, r: 12, s: 1.1, v: 0 }, { x: 44, y: 14, r: -18, s: 0.9, v: 1 },
  { x: 70, y: 20, r: 30, s: 1.2, v: 2 }, { x: 90, y: 16, r: -6, s: 0.85, v: 0 },
  { x: 10, y: 48, r: -24, s: 1.0, v: 1 }, { x: 34, y: 42, r: 8, s: 1.25, v: 2 },
  { x: 60, y: 46, r: -14, s: 1.0, v: 0 }, { x: 84, y: 44, r: 22, s: 1.1, v: 1 },
  { x: 20, y: 72, r: 18, s: 1.15, v: 2 }, { x: 46, y: 70, r: -8, s: 0.95, v: 0 },
  { x: 72, y: 74, r: 14, s: 1.2, v: 1 }, { x: 92, y: 68, r: -20, s: 0.9, v: 2 },
  { x: 8, y: 88, r: 6, s: 0.9, v: 0 }, { x: 32, y: 90, r: -16, s: 1.05, v: 1 },
  { x: 58, y: 92, r: 24, s: 1.1, v: 2 }, { x: 84, y: 90, r: -10, s: 1.0, v: 0 },
];

function Shard({ v }: { v: number }) {
  const faces = ["#e9d3ae", "#f1e0c2", "#dfc49b"];
  return (
    <g>
      <path d="M-11,-8 L9,-11 L13,6 L-6,11 Z" fill="#9c6a38" />
      <path d="M-10,-7 L8,-10 L11,5 L-5,9 Z" fill={faces[v]} />
      <g stroke="#8a4520" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" fill="none">
        <path d="M-6,-5 L4,3" />
        <path d="M-2,-7 L6,-1" />
        <path d="M-7,0 L0,6" />
        <path d="M2,-8 L8,2" />
        <path d="M-4,-2 L-8,4" />
      </g>
    </g>
  );
}

export default function ProductPack({
  image = null,
  className,
  float = true,
}: {
  image?: string | null;
  className?: string;
  float?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 340;
      setScale(w / 340);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* spotlight */}
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(244,210,122,0.22),rgba(10,61,46,0.0)_65%)] pointer-events-none" />
      <div ref={ref} className="relative w-full" style={{ aspectRatio: "340 / 470" }}>
        <motion.div
          animate={float ? { y: [0, -10, 0] } : undefined}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: 340, height: 470, transform: `scale(${scale})` }}
        >
          {image ? (
            /* Real uploaded product photograph — full pack, uncropped */
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={image}
                alt="D GOLD Premium Chali Cut Supari — 500g pouch"
                className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
              />
            </div>
          ) : (
            <div className="relative w-full h-full rounded-[26px] overflow-hidden border border-gold-400/30 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)]">
              {/* pouch base */}
              <div className="absolute inset-0 bg-[linear-gradient(160deg,#0d4a36_0%,#0a3d2e_45%,#06301f_100%)]" />
              {/* sheen */}
              <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.07)_45%,transparent_60%)]" />
              {/* top seal band */}
              <div className="absolute top-0 left-0 right-0 h-[14px] bg-gradient-gold" />
              <div className="absolute top-[14px] left-0 right-0 h-[3px] bg-emerald-950/40" />

              {/* veg mark */}
              <div className="absolute top-[26px] right-[20px] w-[22px] h-[22px] border-2 border-emerald-100/80 rounded-[3px] flex items-center justify-center">
                <span className="w-[10px] h-[10px] rounded-full bg-emerald-100/90" />
              </div>

              {/* crown emblem */}
              <svg viewBox="0 0 120 86" className="absolute top-[24px] left-1/2 -translate-x-1/2 w-[112px]">
                <defs>
                  <linearGradient id="ppGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6d98a" />
                    <stop offset="0.5" stopColor="#e8b94a" />
                    <stop offset="1" stopColor="#b8892b" />
                  </linearGradient>
                </defs>
                <path d="M38 24 L45 8 L52 19 L60 4 L68 19 L75 8 L82 24 Z" fill="url(#ppGold)" />
                <circle cx="60" cy="5" r="2.4" fill="url(#ppGold)" />
                <circle cx="45" cy="8" r="1.8" fill="url(#ppGold)" />
                <circle cx="75" cy="8" r="1.8" fill="url(#ppGold)" />
                <path d="M36 27 H84" stroke="url(#ppGold)" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="60" cy="56" r="26" fill="rgba(232,185,74,0.06)" stroke="url(#ppGold)" strokeWidth="2" />
                <circle cx="60" cy="56" r="21" fill="none" stroke="url(#ppGold)" strokeWidth="0.8" opacity="0.7" />
                <text x="60" y="66" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="30" fill="url(#ppGold)">D</text>
                <path d="M28 56 Q18 48 30 40 M24 62 Q14 58 20 48" stroke="url(#ppGold)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M92 56 Q102 48 90 40 M96 62 Q106 58 100 48" stroke="url(#ppGold)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>

              {/* wordmark */}
              <div className="absolute top-[112px] left-0 right-0 text-center">
                <div className="font-display text-[52px] leading-none font-bold text-gradient-gold tracking-tight">D GOLD</div>
                <div className="mt-[7px] flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-gold-400/60" />
                  <span className="text-[10px] tracking-[0.38em] text-gold-300 font-semibold">PREMIUM QUALITY</span>
                  <span className="h-px w-8 bg-gold-400/60" />
                </div>
                <div className="mt-[9px] font-display text-[21px] font-bold text-emerald-50 tracking-wide">CHALI CUTTING SUPARI</div>
                <div className="mt-[4px] text-[8.5px] tracking-[0.26em] text-gold-300/95 font-semibold">PREMIUM TASTE, PURE SATISFACTION</div>
                <div className="mt-[7px] flex items-center justify-center gap-2 text-gold-400">
                  <svg viewBox="0 0 16 10" className="w-3.5 fill-current"><path d="M8 10C4 10 1 7 0 3c4-1 7 1 8 7zM8 10c4 0 7-3 8-7-4-1-7 1-8 7z"/></svg>
                  <span className="text-[9px] tracking-[0.22em] text-emerald-50 font-bold">100% NATURAL ARECANUT</span>
                  <svg viewBox="0 0 16 10" className="w-3.5 fill-current -scale-x-100"><path d="M8 10C4 10 1 7 0 3c4-1 7 1 8 7zM8 10c4 0 7-3 8-7-4-1-7 1-8 7z"/></svg>
                </div>
              </div>

              {/* arecanut cutting seal */}
              <div className="absolute top-[252px] right-[16px] w-[74px] h-[74px] rounded-full border-[1.5px] border-dashed border-gold-400/70 flex flex-col items-center justify-center gap-[3px] bg-emerald-950/20">
                <span className="text-gold-300 text-[8px]">✦</span>
                <span className="text-[8px] tracking-[0.14em] text-gold-300 font-bold leading-tight text-center">ARECANUT<br />CUTTING</span>
                <span className="text-gold-300 text-[8px]">✦</span>
              </div>

              {/* product window with gold rim */}
              <div className="absolute left-[18px] top-[262px] w-[210px] h-[124px] rounded-[18px] p-[4px] bg-gradient-gold shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]">
                <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#123526]">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
                    <rect width="100" height="100" fill="#16402c" />
                    {SHARDS.map((sh, i) => (
                      <g key={i} transform={`translate(${sh.x} ${sh.y}) rotate(${sh.r}) scale(${sh.s})`}>
                        <Shard v={sh.v} />
                      </g>
                    ))}
                  </svg>
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_45%)]" />
                  <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.55)] rounded-[14px]" />
                </div>
              </div>

              {/* net weight */}
              <div className="absolute left-[18px] bottom-[22px] rounded-[12px] bg-gradient-gold px-4 py-2 shadow-lg">
                <div className="text-[8px] tracking-[0.22em] text-emerald-950 font-extrabold">NET WEIGHT</div>
                <div className="font-display text-[27px] leading-none font-bold text-emerald-950 mt-[2px]">500g</div>
              </div>

              {/* bottom curve */}
              <svg viewBox="0 0 340 90" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none">
                <path d="M0,64 Q170,8 340,58 L340,90 L0,90 Z" fill="#0e5c40" opacity="0.55" />
                <path d="M0,64 Q170,8 340,58" fill="none" stroke="#e8b94a" strokeWidth="3" />
              </svg>
              <div className="absolute bottom-[10px] right-[16px] text-[7px] tracking-[0.18em] text-emerald-100/70 font-semibold">FSSAI · 21226172000535</div>
            </div>
          )}
        </motion.div>
      </div>
      {/* floor shadow */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[72%] h-7 rounded-[50%] bg-black/45 blur-xl pointer-events-none" />
    </div>
  );
}
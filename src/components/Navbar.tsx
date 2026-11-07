import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Phone, PackageSearch } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../context/StoreContext";
import { cn } from "../utils/cn";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Product", href: "#product" },
  { label: "Why D GOLD", href: "#why" },
  { label: "Delivery", href: "#delivery" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const { openBooking, setTrackOpen, settings } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      {/* Bengaluru-only ribbon */}
      <div className="bg-gradient-gold text-emerald-950 text-center text-[11px] sm:text-xs font-bold tracking-wide py-1.5 px-3">
        Now delivering across Bengaluru only · Call{" "}
        <a href={`tel:+91${settings.phone}`} className="underline underline-offset-2">
          +91 {settings.phone}
        </a>
      </div>

      <div className={cn("mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 transition-all duration-300", scrolled ? "py-2" : "py-3")}>
        <div className="flex items-center justify-between rounded-2xl px-3 sm:px-5 py-2.5 bg-emerald-950/85 backdrop-blur-xl border border-gold-400/20 shadow-lg shadow-emerald-950/40">
          <a href="#top" aria-label="D GOLD home" className="flex-shrink-0">
            <Logo />
          </a>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg",
                  active === l.href ? "text-gold-300" : "text-emerald-100/75 hover:text-white"
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-gold-400 transition-all duration-300",
                    active === l.href ? "w-4 opacity-100" : "w-0 opacity-0"
                  )}
                />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a
              href={`tel:+91${settings.phone}`}
              className="p-2.5 rounded-xl text-emerald-100/80 hover:text-gold-300 hover:bg-white/5 transition-colors"
              aria-label={`Call +91 ${settings.phone}`}
            >
              <Phone className="w-[18px] h-[18px]" />
            </a>
            <button
              onClick={() => setTrackOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-100/85 border border-emerald-300/20 hover:border-gold-400/40 hover:text-white transition-colors"
            >
              <PackageSearch className="w-4 h-4 text-gold-400" />
              Track Order
            </button>
            <motion.button
              onClick={() => openBooking()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-gold text-sm px-5 py-2.5"
            >
              Book Now
            </motion.button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-emerald-300/15 text-emerald-50"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="lg:hidden mx-3 sm:mx-6 rounded-2xl bg-emerald-950/95 backdrop-blur-xl border border-gold-400/20 p-3 shadow-2xl"
            aria-label="Mobile"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active === l.href ? "text-gold-300 bg-white/5" : "text-emerald-100/80 hover:bg-white/5"
                )}
              >
                {l.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setTrackOpen(true);
                }}
                className="py-3 rounded-xl text-sm font-semibold text-emerald-50 border border-emerald-300/20"
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  openBooking();
                }}
                className="btn-gold text-sm py-3"
              >
                Book Now
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
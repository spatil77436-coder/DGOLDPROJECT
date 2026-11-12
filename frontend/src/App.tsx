import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { waLink } from "./lib/helpers";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { About, Why, HowItWorks, Delivery } from "./components/Sections";
import Products from "./components/Products";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BookingWizard from "./components/BookingWizard";
import TrackOrder from "./components/TrackOrder";
import AdminApp from "./admin/AdminApp";
import ScrolltoTop from "./components/ScrolltoTop";

function getView(): "site" | "admin" {
  return window.location.hash.startsWith("#admin") ? "admin" : "site";
}

function WhatsAppFloat() {
  const { settings } = useStore();
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
      href={waLink(settings.whatsapp, "Hello D GOLD! I'd like to enquire about Premium Chali Cut Supari (Bengaluru delivery).")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with D GOLD on WhatsApp"
      className="fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl wa-pulse hover:scale-110 transition-transform"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </motion.a>
  );
}

function Site() {
  return (
    <div id="top" className="min-h-screen bg-emerald-950 text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Products />
        <Features />
        <Why />
        <HowItWorks />
        <Delivery />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ScrolltoTop />
      <WhatsAppFloat />
      <BookingWizard />
      <TrackOrder />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"site" | "admin">(getView);

  useEffect(() => {
    const onHash = () => {
      setView(getView());
      if (getView() === "admin") window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <StoreProvider>
      {view === "admin" ? <AdminApp /> : <Site />}
    </StoreProvider>
  );
}
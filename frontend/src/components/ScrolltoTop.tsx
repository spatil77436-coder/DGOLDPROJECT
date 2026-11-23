import { useEffect, useState } from 'react'
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ScrolltoTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(()=>{
        const handlescroll = () => {
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handlescroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handlescroll);
        };

    },[]);

    const scrollToTop = () => {
       window.scrollTo({
        top:0,
        behavior:"smooth",
       })
    }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-24 right-6 z-[100] flex items-center justify-center h-12 w-12 rounded-full bg-[#D9A52E] text-[#06432F] shadow-lg hover:bg-[#F2C75C] cursor-pointer transition-colors"
        >
          <ArrowUp size={23} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrolltoTop
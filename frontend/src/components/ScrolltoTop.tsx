import {useEffect, useState } from 'react'
import { ArrowUp } from "lucide-react"

const ScrolltoTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(()=>{
        const handlescroll = () => {
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handlescroll);

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
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-24 right-6 z-[100]
        flex items-center justify-center
        h-12 w-12 rounded-full
        bg-[#D9A52E] text-[#06432F]
        shadow-lg
        hover:bg-[#F2C75C]
        cursor-pointer
        hover:-translate-y-1
        transition-all duration-300
        ${
          isVisible
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }
      `}
    >
      <ArrowUp size={23} strokeWidth={2.5} />
    </button>
  )
}

export default ScrolltoTop
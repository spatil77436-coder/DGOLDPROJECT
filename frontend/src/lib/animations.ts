import type { Variants, Transition } from "framer-motion";

export const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const TRANSITION_SMOOTH: Transition = {
  duration: 0.65,
  ease: EASE_PREMIUM,
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_SMOOTH,
  },
};

export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

export const scaleUpVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_SMOOTH,
  },
};

export const cardHoverProps = {
  whileHover: { y: -6, transition: { duration: 0.25, ease: EASE_PREMIUM } },
  whileTap: { scale: 0.98 },
};

export const buttonHoverProps = {
  whileHover: { scale: 1.025, y: -1, transition: { duration: 0.2, ease: EASE_PREMIUM } },
  whileTap: { scale: 0.97 },
};

export const iconHoverProps = {
  whileHover: { scale: 1.1, rotate: 4, transition: { duration: 0.25, ease: EASE_PREMIUM } },
};

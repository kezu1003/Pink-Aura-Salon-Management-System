export const easeOutBack = [0.22, 1, 0.36, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOutBack } },
  exit:    { opacity: 0, y: 12, transition: { duration: 0.2 } }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.24, ease: easeOutBack } },
  exit:    { opacity: 0, scale: 0.98, transition: { duration: 0.18 } }
};

export const gridStagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } }
};

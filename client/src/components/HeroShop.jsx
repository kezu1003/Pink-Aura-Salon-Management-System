import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

export default function HeroCarousel({
  slides = [],
  interval = 5000,     
  rounded = "rounded-3xl",
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  const go = (dir) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  // autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!hoverRef.current) go(+1);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [slides.length, interval]);

  if (!slides.length) return null;

  const slide = slides[index];

  return (
    <div
      className={`relative w-full overflow-hidden border shadow-silk ${rounded}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      {/* Images */}
      <div className="relative aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={slide.image}
            alt={slide.title || "Banner"}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease } }}
            exit={{ opacity: 0, scale: 1.01, transition: { duration: 0.4 } }}
          />
        </AnimatePresence>

        {/* Soft vignette + glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/30" />
        <div className="pointer-events-none absolute -inset-1 rounded-[inherit] shadow-[0_0_80px_20px_rgba(255,255,255,0.12)_inset]" />

        {/* Content */}
        <div className="absolute inset-0 grid place-items-center px-4 md:px-8 lg:px-12">
          <div className="w-full max-w-5xl text-center text-white">
            
            {slide.badge && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-12 border border-white/20 text-xs">
                {slide.badge.icon ? <span className="opacity-80">{slide.badge.icon}</span> : null}
                <span>{slide.badge.text}</span>
              </div>
            )}

            <motion.h2
              key={`title-${index}`}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight drop-shadow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
            >
              {slide.title}
            </motion.h2>

            {slide.subtitle && (
              <motion.p
                key={`sub-${index}`}
                className="mt-3 md:mt-4 text-sm md:text-lg text-white/90 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: 0.05 } }}
              >
                {slide.subtitle}
              </motion.p>
            )}

            {/* CTAs */}
            {(slide.primary || slide.secondary) && (
              <motion.div
                key={`cta-${index}`}
                className="mt-5 md:mt-7 flex items-center justify-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease, delay: 0.1 } }}
              >
                {slide.primary && (
                  <a
                    href={slide.primary.href || "#"}
                    className="px-5 py-3 rounded-full bg-white/90 text-onyx font-medium hover:bg-white transition shadow"
                  >
                    {slide.primary.label}
                  </a>
                )}
                {slide.secondary && (
                  <a
                    href={slide.secondary.href || "#"}
                    className="px-5 py-3 rounded-full bg-white/15 text-white font-medium border border-white/30 backdrop-blur-12 hover:bg-white/25 transition"
                  >
                    {slide.secondary.label}
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 text-onyx"
              onClick={() => go(-1)}
            >
              <ChevronLeft />
            </button>
            <button
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 text-onyx"
              onClick={() => go(+1)}
            >
              <ChevronRight />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition ${
                  i === index ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

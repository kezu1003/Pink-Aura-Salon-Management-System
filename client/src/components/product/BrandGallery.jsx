import React from "react";
import { motion } from "framer-motion";

export default function BrandGallery({ items = [], value = "", onChange }) {
  return (
    <section className="py-4 bg-transparent">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
          {items.map((b) => {
            const selected = value === b.value;
            return (
              <button
                key={b.value ?? "all"}
                onClick={() => onChange?.(b.value)}
                className="w-[180px] focus:outline-none group"
                aria-pressed={selected}
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`mx-auto h-[110px] w-[180px] grid place-items-center rounded-2xl bg-white
                              shadow-[0_8px_20px_rgba(0,0,0,0.06)]
                              transition-transform transition-shadow duration-200
                              group-hover:-translate-y-1.5 
                              ${selected ? "ring-2 ring-rosePrimary/35 shadow-[0_14px_32px_rgba(214,51,132,0.18)]" : ""}`}
                >
                  {b.image ? (
                    <img
                      src={b.image}
                      alt={b.label}
                      className="max-h-[72px] max-w-[150px] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">Logo</div>
                  )}
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

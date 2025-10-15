import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FancySelect({
  options = [],                 
  value,
  onChange,
  placeholder = "Select…",
  required = false,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      const max = options.length - 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHover((h) => (h < 0 ? 0 : Math.min(max, h + 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHover((h) => (h <= 0 ? 0 : h - 1));
      } else if (e.key === "Home") {
        e.preventDefault(); setHover(0);
      } else if (e.key === "End") {
        e.preventDefault(); setHover(max);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (hover >= 0 && options[hover]) {
          onChange?.(options[hover].value);
          setOpen(false);
          btnRef.current?.focus();
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hover, options, onChange]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>

      {/* Hidden input for native required validation */}
      {required && (
        <input
          tabIndex={-1}
          value={value ?? ""}
          onChange={() => {}}
          required
          className="sr-only"
        />
      )}

      {/* Button */}
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full rounded-xl border bg-white/80 backdrop-blur px-3.5 py-2.5 text-left
                    outline-none transition focus:ring-2 ring-rosePrimary/40
                    border-gray-200 focus:border-rosePrimary/60
                    disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`truncate ${selected ? "text-gray-900" : "text-gray-400"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <svg width="18" height="18" viewBox="0 0 20 20" className="shrink-0">
            <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.16 } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            className="absolute z-50 mt-2 w-full rounded-xl border bg-white/95 backdrop-blur
                       shadow-lg max-h-60 overflow-auto ring-1 ring-black/5"
            role="listbox"
          >
            {options.map((opt, i) => {
              const active = value === opt.value;
              const hovered = hover === i;
              return (
                <li
                  key={opt.value ?? opt.label}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(-1)}
                  onClick={() => { onChange?.(opt.value); setOpen(false); btnRef.current?.focus(); }}
                  className={`px-3.5 py-2 cursor-pointer select-none
                             ${hovered ? "bg-rosePrimary/10" : ""}
                             ${active ? "text-rosePrimary font-medium" : "text-gray-800"}`}
                >
                  {opt.label}
                </li>
              );
            })}

            {options.length === 0 && (
              <li className="px-3.5 py-2 text-gray-500">No options</li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

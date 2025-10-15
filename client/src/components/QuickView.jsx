import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import CountdownBadge from "./CountdownBadge";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const sheet = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.18 } },
};

export default function QuickView({ id, open, onClose }) {
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const firstFocusRef = useRef(null);

  // Fetch on open
  useEffect(() => {
    let active = true;
    if (!open || !id) return;

    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        if (!active) return;
        setP(data.product || null);
        setQty(1);
      } catch (e) {
        console.error(e);
        setP(null);
      }
    })();

    return () => (active = false);
  }, [id, open]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus first interactive element on mount
  useEffect(() => {
    if (open && firstFocusRef.current) {
      firstFocusRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (!p) return;
    addItem(p, qty);
    onClose?.();
  };

  const out =
    p && (p.stock <= 0 || (p.expiryDaysLeft !== null && p.expiryDaysLeft < 0));

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-end md:items-center md:justify-center"
          {...backdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Sheet */}
          <motion.div
            className="relative z-[1001] w-full md:max-w-3xl rounded-t-3xl md:rounded-2xl bg-white border shadow-2xl md:mx-4"
            {...sheet}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-display text-xl text-gray-900">Quick View</h2>
              <button
                ref={firstFocusRef}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close quick view"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 grid md:grid-cols-2 gap-4">
              {/* Media */}
              <div className="rounded-xl overflow-hidden bg-rose-50 border">
                <div className="aspect-[4/3]">
                  {p?.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-content-center text-gray-300">
                      Silk Placeholder
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                {p ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-2xl text-gray-900">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.category}
                        </p>
                      </div>
                      <CountdownBadge daysLeft={p.expiryDaysLeft ?? null} />
                    </div>

                    <div className="mt-3 text-2xl font-semibold">
                      LKR {p.price?.toFixed(2)}
                    </div>

                    {p.description && (
                      <p className="mt-3 text-sm text-gray-700 line-clamp-5 whitespace-pre-line">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-4 text-sm">
                      <span
                        className={`font-medium ${
                          p.stock > 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {p.stock > 0 ? `In stock: ${p.stock}` : "Out of stock"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="inline-flex items-center border rounded-xl overflow-hidden">
                        <button
                          className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="px-4 py-2 min-w-[48px] text-center">
                          {qty}
                        </div>
                        <button
                          className="px-3 py-2 hover:bg-gray-50"
                          onClick={() =>
                            setQty((q) => Math.min(p.stock || 1, q + 1))
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={handleAdd}
                        disabled={out}
                        className={`px-5 py-3 rounded-xl font-medium transition
                          ${
                            out
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-onyx text-white hover:opacity-95 active:scale-[0.99]"
                          }`}
                      >
                        {out ? "Unavailable" : `Add ${qty} to Cart`}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">Loading…</div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

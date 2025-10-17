import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import CountdownBadge from "./CountdownBadge";
import { fadeUp } from "./motion";
import { Plus } from "lucide-react";
import useFlyToCart from "../utils/useFlyToCart";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const out = product.stock <= 0 || (product.expiryDaysLeft !== null && product.expiryDaysLeft < 0);
  const imgRef = useRef(null);
  const flyToCart = useFlyToCart();

  return (
    <motion.div
      variants={fadeUp}
      className="group relative rounded-2xl border bg-white/70 backdrop-blur-12 shadow-silk hover:shadow-lg hover:shadow-rosePrimary/20 transition will-change-transform"
      whileHover={{ y: -2, transition: { duration: 0.14 } }}
    >
      {/* Top rail */}
      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
        <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-white/80 border text-gray-600 backdrop-blur">
          {product.category}
        </span>
        <div className="hidden sm:block">
          <CountdownBadge daysLeft={product.expiryDaysLeft ?? null} />
        </div>
      </div>

      {/* opens Quick View */}
      <div
        className="aspect-[4/5] bg-rose-50 rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => onQuickView?.(product._id)}
        onMouseMove={(e) => {
          const el = imgRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
          const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
          el.style.transform = `scale(1.05) translate(${dx}px, ${dy}px)`;
        }}
        onMouseLeave={() => {
          const el = imgRef.current;
          if (el) el.style.transform = "";
        }}
      >
        {product.images?.[0] ? (
          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-300">
            <span className="text-sm">Silk Placeholder</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              className="font-display text-[15px] leading-tight text-gray-900 cursor-pointer"
              onClick={() => onQuickView?.(product._id)}
            >
              {product.name}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {product.stock > 0 ? `In stock • ${product.stock}` : "Out of stock"}
            </p>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">LKR {product.price?.toFixed(2)}</div>
          </div>
        </div>

        <button
           whileTap={{ scale: out ? 1 : 0.98 }}
           onClick={() => {
          if (!out) {
            flyToCart(imgRef.current);
            addItem(product, 1);
          }
        }}
        disabled={out}
          className={`mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition
          ${out
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-onyx text-white hover:opacity-95 active:scale-[0.99]"
            }`}
          aria-live="polite"
        >
          <Plus size={16} />
          {out ? "Unavailable" : "Add to Cart"}
        </button>

        {/* Mobile countdown below button */}
        <div className="mt-2 sm:hidden">
          <CountdownBadge daysLeft={product.expiryDaysLeft ?? null} />
        </div>
      </div>
    </motion.div>
  );
}

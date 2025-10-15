import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import CountdownBadge from "../components/CountdownBadge";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fadeUp, easeOutBack } from "../components/motion";
import { Minus, Plus } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const imgRef = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setP(data.product);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!p) return <div className="max-w-5xl mx-auto px-4 py-6">Loading...</div>;

  const out = p.stock <= 0 || (p.expiryDaysLeft !== null && p.expiryDaysLeft < 0);

  const sparkle = () => {
    if (prefersReduced) return;
    const host = document.createElement("span");
    host.className = "pointer-events-none fixed inset-0 z-[9999]";
    document.body.appendChild(host);
    const el = document.createElement("span");
    el.style.position = "absolute";
    el.style.left = "50%";
    el.style.top = "60%";
    el.style.width = "6px";
    el.style.height = "6px";
    el.style.borderRadius = "9999px";
    el.style.background = "rgba(214,51,132,0.6)";
    el.style.boxShadow = "0 0 18px rgba(214,51,132,0.6)";
    el.style.transform = "translate(-50%, -50%)";
    host.appendChild(el);
    el.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -140%) scale(0.6)", opacity: 0 }
      ],
      { duration: 450, easing: "cubic-bezier(0.22,1,0.36,1)" }
    ).onfinish = () => host.remove();
  };

  const handleAdd = () => {
    addItem(p, qty);
    sparkle();

    // Optional fly-to-cart if you give your navbar cart icon id="nav-cart"
    const cart = document.getElementById("nav-cart");
    if (!cart || prefersReduced || !imgRef.current) return;

    const rectStart = imgRef.current.getBoundingClientRect();
    const rectEnd = cart.getBoundingClientRect();

    const ghost = imgRef.current.cloneNode(true);
    ghost.style.position = "fixed";
    ghost.style.left = rectStart.left + "px";
    ghost.style.top = rectStart.top + "px";
    ghost.style.width = rectStart.width + "px";
    ghost.style.height = rectStart.height + "px";
    ghost.style.borderRadius = "16px";
    ghost.style.zIndex = 9999;
    ghost.style.pointerEvents = "none";
    document.body.appendChild(ghost);

    ghost.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 0.95 },
        {
          transform: `translate(${rectEnd.left - rectStart.left}px, ${rectEnd.top - rectStart.top}px) scale(0.15)`,
          opacity: 0.2
        }
      ],
      { duration: 500, easing: "cubic-bezier(0.22,1,0.36,1)" }
    ).onfinish = () => ghost.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Media */}
      <motion.div
        {...fadeUp}
        className="rounded-2xl overflow-hidden bg-rose-50 border shadow-silk"
      >
        <div className="relative aspect-[4/3]">
          {p.images?.[0] ? (
            <img
              ref={imgRef}
              src={p.images[0]}
              alt={p.name}
              className="w-full h-full object-cover transition-transform duration-300 will-change-transform hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full grid place-content-center text-gray-300">
              Silk Placeholder
            </div>
          )}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div {...fadeUp}>
        <h1 className="font-display text-3xl text-gray-900">{p.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{p.category}</p>

        <div className="mt-4 flex items-center gap-4">
          <div className="text-3xl font-semibold text-gray-900">
            LKR {p.price?.toFixed(2)}
          </div>
          <CountdownBadge daysLeft={p.expiryDaysLeft ?? null} />
        </div>

        <p className="mt-5 text-gray-700 whitespace-pre-line leading-relaxed">
          {p.description}
        </p>

        <div className="mt-6 text-sm">
          <span className={`font-medium ${p.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {p.stock > 0 ? `In stock: ${p.stock}` : "Out of stock"}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="inline-flex items-center border rounded-xl overflow-hidden">
            <button
              className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <div className="px-4 py-2 min-w-[48px] text-center">{qty}</div>
            <button
              className="px-3 py-2 hover:bg-gray-50"
              onClick={() => setQty((q) => Math.min((p.stock || 1), q + 1))}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={out}
            className={`px-5 py-3 rounded-xl font-medium transition
              ${out ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-onyx text-white hover:opacity-95 active:scale-[0.99]"}
            `}
            aria-live="polite"
          >
            {out ? "Unavailable" : `Add ${qty} to Cart`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

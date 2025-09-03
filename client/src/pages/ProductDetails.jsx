import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import CountdownBadge from "../components/CountdownBadge";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setP(data.product);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [id]);

  if (!p) return <div className="max-w-5xl mx-auto px-4 py-6">Loading...</div>;

  const out = p.stock <= 0 || (p.expiryDaysLeft !== null && p.expiryDaysLeft < 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-400">No Image</div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="text-sm text-gray-500">{p.category}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-bold">LKR {p.price?.toFixed(2)}</span>
          <CountdownBadge daysLeft={p.expiryDaysLeft ?? null} />
        </div>

        <p className="mt-4 text-gray-700 whitespace-pre-line">{p.description}</p>

        <div className="mt-4 text-sm">
          <span className={`font-medium ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {p.stock > 0 ? `In stock: ${p.stock}` : "Out of stock"}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={p.stock || 1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value || 1), p.stock || 1)))}
            className="w-24 border rounded-lg px-3 py-2"
          />
          <button
            onClick={() => addItem(p, qty)}
            disabled={out}
            className={`px-4 py-2 rounded-lg font-medium ${
              out ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-black text-white"
            }`}
          >
            {out ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

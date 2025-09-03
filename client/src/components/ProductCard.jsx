import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CountdownBadge from "./CountdownBadge";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const out = product.stock <= 0 || (product.expiryDaysLeft !== null && product.expiryDaysLeft < 0);

  return (
    <div className="border rounded-xl p-3 flex flex-col gap-2">
      <div
        className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium leading-tight">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
        <div className="font-semibold">LKR {product.price?.toFixed(2)}</div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
          {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
        </span>
        <CountdownBadge daysLeft={product.expiryDaysLeft ?? null} />
      </div>

      <button
        onClick={() => addItem(product, 1)}
        disabled={out}
        className={`mt-1 py-2 rounded-lg text-sm font-medium ${
          out
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:opacity-90"
        }`}
      >
        {out ? "Unavailable" : "Add to Cart"}
      </button>
    </div>
  );
}

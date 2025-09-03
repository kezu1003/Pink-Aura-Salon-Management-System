import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, totals, refreshStocks } = useCart();
  const [liveStocks, setLiveStocks] = useState(new Map());

  useEffect(() => {
    (async () => {
      // optional: fetch live stocks for cart items to cap qty
      if (items.length === 0) return setLiveStocks(new Map());
      const { data } = await api.get("/api/products", {
        params: { ids: items.map((i) => i.productId).join(",") },
      });
      const map = new Map(data.products.map((p) => [p._id, p.stock]));
      setLiveStocks(map);
    })();
  }, [items]);

  if (items.length === 0)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link to="/shop" className="text-black underline">
          Continue shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Cart</h1>

      <div className="flex flex-col gap-3">
        {items.map((it) => {
          const maxStock = liveStocks.get(it.productId) ?? it.stockSnapshot ?? 1;
          return (
            <div key={it.productId} className="border rounded-xl p-3 flex items-center gap-3">
              <div className="w-20 h-16 rounded bg-gray-100 overflow-hidden">
                {it.image ? (
                  <img src={it.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-content-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-500">LKR {it.price?.toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={maxStock}
                    value={it.qty}
                    onChange={(e) => updateQty(it.productId, Number(e.target.value || 1), maxStock)}
                    className="w-24 border rounded-lg px-3 py-2"
                  />
                  <span className="text-xs text-gray-500">Max {maxStock}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  LKR {(it.qty * it.price).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(it.productId)}
                  className="mt-1 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 border rounded-xl flex items-center justify-between">
        <div className="text-gray-700">
          <div>Total Items: <span className="font-semibold">{totals.totalQty}</span></div>
          <div>Total: <span className="font-semibold">LKR {totals.totalAmount.toFixed(2)}</span></div>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="px-5 py-2 rounded-lg bg-black text-white"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

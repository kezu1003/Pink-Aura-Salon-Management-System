import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totals, clear, refreshStocks } = useCart();
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    setLoading(true);
    try {
      await refreshStocks(); // optional preflight
      const payload = { items: items.map((i) => ({ productId: i.productId, qty: i.qty })) };
      const { data } = await api.post("/api/orders/checkout", payload);
      if (data.success) {
        toast.success("Order placed!");
        clear();
        navigate("/shop");
      } else {
        toast.error(data.message || "Checkout failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-600">
        No items to checkout.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <div className="border rounded-xl p-4">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between py-2 text-sm">
            <span>{i.name} × {i.qty}</span>
            <span>LKR {(i.qty * i.price).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>LKR {totals.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={placeOrder}
        disabled={loading}
        className="mt-4 px-5 py-2 rounded-lg bg-black text-white disabled:opacity-60"
      >
        {loading ? "Placing..." : "Place Order"}
      </button>
    </div>
  );
}

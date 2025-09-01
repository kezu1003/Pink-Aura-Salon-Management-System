import { useState } from "react";
import { useCart } from "../context/CartContext";
import { checkout as apiCheckout } from "../api/checkout";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

export default function Checkout() {
  const { items, clear, subtotal } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (items.length === 0) return toast.error("Cart is empty");
    if (!form.name || !form.email) return toast.error("Enter name & email");
    setLoading(true);
    try {
      const res = await apiCheckout({ customer: form, items });
      toast.success("Order placed!");
      clear();
      nav(`/order-success/${res.orderId}`, { state: res.order });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {items.length === 0 ? (
        <p>Cart is empty. <Link className="underline" to="/shop">Go shopping</Link></p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <input className="border rounded px-3 py-2 w-full" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Order Summary</div>
            <div className="text-sm text-gray-600 mb-2">{items.length} item(s)</div>
            <div className="font-semibold">Total: Rs. {subtotal.toFixed(2)}</div>
            <button disabled={loading} onClick={placeOrder} className="mt-4 px-4 py-2 rounded bg-black text-white w-full">
              {loading ? "Placing..." : "Place order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

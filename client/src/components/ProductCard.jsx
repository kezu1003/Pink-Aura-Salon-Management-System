import CountdownBadge from "./CountdownBadge";
import { useCart } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const price = p.salePrice ?? p.price;

  return (
    <div className="rounded-xl border p-3 flex flex-col gap-2">
      <img src={p.images?.[0] || "https://via.placeholder.com/300x200?text=Product"} alt={p.name} className="w-full h-40 object-cover rounded-lg" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-xs text-gray-500">{p.brand} · {p.sku}</p>
        </div>
        {p.expiresInMs != null && <CountdownBadge expiresInMs={p.expiresInMs} />}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold">Rs. {price.toFixed(2)}</span>
        {p.salePrice && <span className="line-through text-sm text-gray-400">Rs. {p.price.toFixed(2)}</span>}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${p.inStock ? "text-green-600" : "text-red-600"}`}>
          {p.inStock ? `In stock (${p.stock})` : "Out of stock"}
        </span>
        <button
          disabled={!p.inStock}
          onClick={() => add(p, 1)}
          className={`px-3 py-1 rounded ${p.inStock ? "bg-black text-white" : "bg-gray-300 cursor-not-allowed"}`}>
          Add to cart
        </button>
      </div>
    </div>
  );
}

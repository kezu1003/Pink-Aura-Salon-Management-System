import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { fetchProduct } from "../api/products";
import { Link } from "react-router-dom";
import socket from "../realtime/socket"; // 👈 import socket.io client

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const [stockMap, setStockMap] = useState({});

  // Initial fetch of product stock/prices for items in cart
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        items.map(async (it) => {
          try {
            const p = await fetchProduct(it.productId);
            return [
              it.productId,
              {
                stock: p.stock,
                inStock: p.inStock,
                price: p.salePrice ?? p.price,
                name: p.name,
              },
            ];
          } catch {
            return [
              it.productId,
              {
                stock: 0,
                inStock: false,
                price: it.price,
                name: it.name,
              },
            ];
          }
        })
      );
      setStockMap(Object.fromEntries(entries));
    })();
  }, [items]);

  // 🔴 Realtime updates: listen for stock changes
  useEffect(() => {
    const handler = ({ productId, stock }) => {
      setStockMap((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          stock,
          inStock: stock > 0,
        },
      }));
    };
    socket.on("stock:update", handler);
    return () => socket.off("stock:update", handler);
  }, []);

  const total = items.reduce(
    (a, b) => (stockMap[b.productId]?.price ?? b.price) * b.qty + a,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p>
          Cart is empty. <Link className="underline" to="/shop">Go shopping</Link>
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((it) => {
              const info = stockMap[it.productId];
              const available = info?.stock ?? 0;
              return (
                <div
                  key={it.productId}
                  className="border rounded p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{info?.name || it.name}</div>
                    <div className="text-sm text-gray-500">SKU: {it.sku}</div>
                    <div className="text-sm">
                      {available > 0
                        ? `In stock (${available})`
                        : "Out of stock"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        setQty(it.productId, Number(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1"
                    />
                    <div className="w-24 text-right">
                      Rs. {((info?.price ?? it.price) * it.qty).toFixed(2)}
                    </div>
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => remove(it.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-lg font-semibold">
              Subtotal: Rs. {total.toFixed(2)}
            </div>
            <Link
              to="/checkout"
              className="px-4 py-2 rounded bg-black text-white"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

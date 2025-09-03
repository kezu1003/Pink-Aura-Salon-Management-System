import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "cart_v1";

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    if (!product?.stock || product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        const newQty = Math.min(next[idx].qty + qty, product.stock);
        next[idx] = { ...next[idx], qty: newQty, stockSnapshot: product.stock };
        toast.success("Updated cart");
        return next;
      }
      toast.success("Added to cart");
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          qty: Math.min(qty, product.stock),
          image: product.images?.[0],
          stockSnapshot: product.stock,
        },
      ];
    });
  };

  const updateQty = (productId, qty, maxStock) => {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId
          ? { ...it, qty: Math.min(Math.max(1, qty), maxStock ?? it.stockSnapshot) }
          : it
      )
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const totalQty = items.reduce((s, it) => s + it.qty, 0);
    const totalAmount = items.reduce((s, it) => s + it.qty * it.price, 0);
    return { totalQty, totalAmount };
  }, [items]);

  // Validate latest stock before checkout (optional preflight)
  const refreshStocks = async () => {
    if (items.length === 0) return items;
    const ids = items.map((i) => i.productId);
    const { data } = await api.get(`/api/products`, { params: { ids: ids.join(",") } }).catch(() => ({ data: null }));
    if (!data?.success) return items;
    const map = new Map(data.products.map((p) => [p._id, p.stock]));
    setItems((prev) =>
      prev.map((it) => ({ ...it, stockSnapshot: map.get(it.productId) ?? it.stockSnapshot }))
    );
    return items;
  };

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clear,
    totals,
    refreshStocks,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

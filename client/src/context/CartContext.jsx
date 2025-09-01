import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const LS_KEY = "pa_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(it => it.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(999, next[idx].qty + qty) };
        toast.success("Cart updated");
        return next;
      }
      toast.success("Added to cart");
      return [...prev, { productId: product._id, name: product.name, price: product.salePrice ?? product.price, sku: product.sku, qty }];
    });
  };

  const setQty = (productId, qty) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i));
  };

  const remove = (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clear = () => setItems([]);

  const totalQty = items.reduce((a, b) => a + b.qty, 0);
  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);

  const value = useMemo(() => ({ items, add, setQty, remove, clear, totalQty, subtotal }), [items, totalQty, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

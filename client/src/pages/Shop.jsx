import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import CategoryTabs from "../components/CategoryTabs";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import socket from "../realtime/socket"; // 👈 import socket.io client

export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [params, setParams] = useState({ sort: "newest" });

  const load = async (p = {}) => {
    try {
      const res = await fetchProducts({
        ...params,
        ...p,
        category: activeCat || undefined,
        page,
      });
      setList(res.items);
      setPages(res.pages);
      setCategories(res.categories || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    setPage(1);
  }, [activeCat, params]);

  useEffect(() => {
    load();
  }, [page]);

  // Poll every 15s as a safety net
  useEffect(() => {
    const id = setInterval(() => load(), 15000);
    return () => clearInterval(id);
  }, [activeCat, params, page]);

  // 🔴 Realtime stock updates
  useEffect(() => {
    const handler = ({ productId, stock }) => {
      setList((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, stock, inStock: stock > 0 } : p
        )
      );
    };
    socket.on("stock:update", handler);
    return () => socket.off("stock:update", handler);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Shop Products</h1>

      <CategoryTabs
        categories={categories}
        active={activeCat}
        onChange={setActiveCat}
      />
      <Filters onChange={(f) => setParams((prev) => ({ ...prev, ...f }))} />

      {list.length === 0 && <p className="text-gray-500">No products found.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {list.map((p) => (
          <ProductCard key={p._id} p={p} />
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-6">
        <button
          className="border px-3 py-1 rounded"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="px-2 py-1">
          Page {page} / {pages}
        </span>
        <button
          className="border px-3 py-1 rounded"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

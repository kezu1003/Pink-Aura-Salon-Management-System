import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CategoryTabs from "../components/CategoryTabs";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const params = useMemo(
    () => ({
      category: category || undefined,
      q: q || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      order,
      page,
      limit,
    }),
    [category, q, minPrice, maxPrice, sort, order, page]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/products", { params });
        if (!active) return;
        setRows(data.products || []);
        setTotal(data.total || 0);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">Shop</h1>

      <CategoryTabs value={category} onChange={(c) => { setCategory(c); setPage(1); }} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          placeholder="Search products..."
          className="border rounded-lg px-3 py-2"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <input
          type="number"
          placeholder="Min price"
          className="border rounded-lg px-3 py-2"
          value={minPrice}
          onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
        />
        <input
          type="number"
          placeholder="Max price"
          className="border rounded-lg px-3 py-2"
          value={maxPrice}
          onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
        />
        <div className="flex gap-2">
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No products found.</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {rows.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}


import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CategoryTabs from "../components/CategoryTabs";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const SkeletonCard = () => (
    <div className="h-72 rounded-2xl border bg-white/60 shadow-sm animate-pulse" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white">
      <Navbar />

      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Shop
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading products…" : `${total} item${total === 1 ? "" : "s"} found`}
          </p>
        </div>

        <div className="mb-4">
          <CategoryTabs
            value={category}
            onChange={(c) => {
              setCategory(c);
              setPage(1);
            }}
          />
        </div>

        {/* Filter bar with glittery pink outlines */}
        <div className="sticky top-16 z-10">
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-3 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="Search products..."
                className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-[#d63384] focus:border-[#d63384] transition-all"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
              <input
                type="number"
                placeholder="Min price"
                className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-[#d63384] focus:border-[#d63384] transition-all"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
              <input
                type="number"
                placeholder="Max price"
                className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-[#d63384] focus:border-[#d63384] transition-all"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
              <div className="flex gap-2">
                <select
                  className="border rounded-xl px-3 py-2 w-full bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-[#d63384] focus:border-[#d63384] transition-all"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                </select>
                <select
                  className="border rounded-xl px-3 py-2 w-full bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-[#d63384] focus:border-[#d63384] transition-all"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {rows.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-pink-100 mb-4 flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <p className="text-gray-600">No products found.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {rows.map((p) => (
                  <div
                    key={p._id}
                    className="group rounded-2xl border bg-white/70 backdrop-blur shadow-sm transition hover:shadow-[#d63384]/40 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#d63384] duration-200"
                  >
                    <div className="rounded-2xl overflow-hidden">
                      <ProductCard product={p} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#d63384] px-3 py-2">
                      Quick view →
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border bg-white/80 backdrop-blur shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d63384] hover:text-[#d63384] hover:shadow-md hover:-translate-y-0.5 transition"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600 px-3 py-2 rounded-lg bg-white/60 border">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border bg-white/80 backdrop-blur shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d63384] hover:text-[#d63384] hover:shadow-md hover:-translate-y-0.5 transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

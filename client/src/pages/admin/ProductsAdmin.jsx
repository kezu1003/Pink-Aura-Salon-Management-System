import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function ProductsAdmin() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [total, setTotal] = useState(0);

  const params = useMemo(
    () => ({ q: q || undefined, category: category || undefined, page, limit, order: "desc" }),
    [q, category, page]
  );

  const fetchData = async () => {
    const { data } = await api.get("/api/products", { params });
    setRows(data.products || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, [params]);

  const incDecStock = async (id, change) => {
    try {
      const { data } = await api.patch(`/api/products/${id}/stock`, { change });
      if (data.success) {
        toast.success("Stock updated");
        fetchData();
      } else toast.error(data.message || "Failed");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this product?")) return;
    try {
      const { data } = await api.delete(`/api/products/${id}`);
      if (data.success) {
        toast.success("Product deactivated");
        fetchData();
      } else toast.error(data.message || "Failed");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Products (Admin)</h1>
        <Link className="px-3 py-2 bg-black text-white rounded-lg" to="/admin/products/new">
          + New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input
          placeholder="Search by name..."
          className="border rounded-lg px-3 py-2"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          <option>Hair Care Products</option>
          <option>Nail Care Products</option>
          <option>Skincare Products</option>
          <option>Makeup Products</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Expiry</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">ID: {p._id}</div>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">LKR {p.price?.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => incDecStock(p._id, -1)}
                      className="px-2 rounded border"
                    >
                      -
                    </button>
                    <span className="font-medium">{p.stock}</span>
                    <button
                      onClick={() => incDecStock(p._id, +1)}
                      className="px-2 rounded border"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  {p.expiryDaysLeft === null
                    ? "—"
                    : p.expiryDaysLeft < 0
                    ? "Expired"
                    : `In ${p.expiryDaysLeft} days`}
                </td>
                <td className="p-3 text-right">
                  <Link to={`/admin/products/${p._id}/edit`} className="text-blue-600 mr-3">
                    Edit
                  </Link>
                  <button onClick={() => deactivate(p._id)} className="text-red-600">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 rounded border disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

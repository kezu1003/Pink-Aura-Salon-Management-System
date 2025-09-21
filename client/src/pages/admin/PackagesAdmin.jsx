import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makePackagesApi } from "../../api/packages";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PackagesAdmin() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makePackagesApi(backendUrl), [backendUrl]);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { success, packages, categories: cats, message } = await api.list({
        q,
        category: category === "All" ? "" : category,
        includeArchived: showArchived ? "true" : "false",
        activeOnly: showArchived ? "false" : "true",
        sort: "new",
        limit: 100,
      });
      if (!success) return toast.error(message || "Failed to load packages");
      setItems(packages || []);
      if (Array.isArray(cats)) setCategories(cats);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, category, showArchived]);

  const onArchive = async (id) => {
    const r = await api.archive(id);
    if (!r.success) return toast.error(r.message || "Failed");
    toast.success("Archived");
    load();
  };

  const onRestore = async (id) => {
    const r = await api.restore(id);
    if (!r.success) return toast.error(r.message || "Failed");
    toast.success("Restored");
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Permanently delete this package?")) return;
    const r = await api.remove(id, true);
    if (!r.success) return toast.error(r.message || "Delete failed");
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Packages</h2>
        <button
          onClick={() => navigate("/admin/packages/new")}
          className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
        >
          Add Package
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="px-3 py-2 rounded-lg border"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border">
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pink-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Discount</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Archived</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No packages.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="p-3">{it.name}</td>
                  <td className="p-3">{it.category}</td>
                  <td className="p-3">Rs.{it.price?.toLocaleString?.() ?? it.price}</td>
                  <td className="p-3">
                    {it.discountPrice != null ? `Rs.${it.discountPrice?.toLocaleString?.() ?? it.discountPrice}` : "—"}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${it.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {it.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">{it.isArchived ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/packages/${it._id}/edit`} className="px-3 py-1 rounded border">
                        Edit
                      </Link>
                      {!it.isArchived ? (
                        <button onClick={() => onArchive(it._id)} className="px-3 py-1 rounded border">
                          Archive
                        </button>
                      ) : (
                        <button onClick={() => onRestore(it._id)} className="px-3 py-1 rounded border">
                          Restore
                        </button>
                      )}
                      <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded border">
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
  

}

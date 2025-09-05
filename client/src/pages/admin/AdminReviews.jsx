import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios.js";
import { Download, Trash2, RefreshCcw } from "lucide-react";
import RatingStars from "../../components/RatingStars.jsx";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", category: "", staffId: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.category) qs.set("category", filters.category);
      if (filters.staffId) qs.set("staffId", filters.staffId);
      if (filters.from) qs.set("from", filters.from);
      if (filters.to) qs.set("to", filters.to);
      const { data } = await api.get(`/api/reviews?${qs.toString()}`);
      setReviews(data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/api/reviews/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const download = () => {
    const qs = new URLSearchParams();
    if (filters.from) qs.set("from", filters.from);
    if (filters.to) qs.set("to", filters.to);
    if (filters.category) qs.set("category", filters.category);
    if (filters.staffId) qs.set("staffId", filters.staffId);
    const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
    window.location.href = `${base}/api/reviews/report.csv?${qs.toString()}`;
  };

  return (
    <div className="p-4">

      {/* header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin – Reviews</h1>
          <p className="text-sm text-slate-500">Manage customer feedback across services and staff.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white hover:opacity-90"
          >
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>

      {/* filters */}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          type="date"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <input
          placeholder="Category"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Staff ID"
          className="rounded-2xl border border-rose-200 bg-white px-3 py-2"
          value={filters.staffId}
          onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
        />
        <button
          onClick={load}
          className="rounded-2xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
        >
          Apply
        </button>
      </div>

      {/* cards grid */}
      
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-rose-100 bg-white/60 animate-pulse" />
          ))
        ) : reviews.length ? (
          reviews.map((r) => (
            <div key={r._id} className="rounded-2xl border border-rose-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{r.user?.name ?? "-"}</p>
                  <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <RatingStars value={r.rating} readOnly size="text-xl" />
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
                  {r.category}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {r.staff?.name ?? "-"}
                </span>
              </div>

              {r.comment && <p className="mt-3 text-sm text-slate-800">{r.comment}</p>}

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => del(r._id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios.js";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", category: "", staffId: "" });

  const load = async () => {
    try {
      const qs = new URLSearchParams();
      if (filters.category) qs.set("category", filters.category);
      if (filters.staffId) qs.set("staffId", filters.staffId);
      const { data } = await api.get(`/api/reviews?${qs.toString()}`);
      setReviews(data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    load();
   
  }, []);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin – Reviews</h1>
        <button onClick={download} className="px-4 py-2 rounded-xl bg-black text-white">
          Download CSV
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="date"
          className="rounded-xl border p-2"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          className="rounded-xl border p-2"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <input
          placeholder="Category (optional)"
          className="rounded-xl border p-2"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Staff ID (optional)"
          className="rounded-xl border p-2"
          value={filters.staffId}
          onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Staff</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Rating</th>
              <th className="p-2 text-left">Comment</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-2">{r.user?.name}</td>
                <td className="p-2">{r.staff?.name}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2">{r.rating}</td>
                <td className="p-2 max-w-[320px] truncate" title={r.comment}>
                  {r.comment}
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => del(r._id)}
                    className="px-3 py-1 rounded-lg border text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!reviews.length && (
              <tr>
                <td className="p-2 text-sm text-gray-500" colSpan={7}>
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

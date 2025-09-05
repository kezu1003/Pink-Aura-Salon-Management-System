import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios.js";
import ReviewCard from "../../components/ReviewCard.jsx";
import { Plus, Search } from "lucide-react";

export default function Reviews() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "",
    staffId: "",
    mine: false,
    search: "",
    sort: "recent",
  });

  const fetchLists = async () => {
    try {
      const [{ data: m }, { data: s }] = await Promise.all([
        api.get("/api/public/review-categories"),
        api.get("/api/public/staff-for-reviews"),
      ]);
      setCategories(m.categories || []);
      setStaff(s.staff || []);
    } catch {
      toast.error("Failed to load filters");
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filter.category) qs.set("category", filter.category);
      if (filter.staffId) qs.set("staffId", filter.staffId);
      if (filter.mine) qs.set("mine", "1");
      if (filter.search) qs.set("search", filter.search);
      if (filter.sort) qs.set("sort", filter.sort);
      const { data } = await api.get(`/api/reviews?${qs.toString()}`);
      setReviews(data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); loadReviews(); }, []);
  useEffect(() => { loadReviews(); }, [filter.category, filter.staffId, filter.mine, filter.sort]);

  return (
    <div className="mx-auto max-w-6xl p-4">

      {/* Header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Reviews</h1>
          <p className="text-sm text-slate-500">Share your experience and browse what others say.</p>
        </div>
        <Link
          to="/reviews/add"
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-white shadow hover:opacity-90"
        >
          <Plus size={18} /> Add Review
        </Link>
      </div>

      {/* Filters bar */}

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/60 p-3">

        {/* Category */}

        <select
          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Staff */}

        <select
          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
          value={filter.staffId}
          onChange={(e) => setFilter({ ...filter, staffId: e.target.value })}
        >
          <option value="">All Staff</option>
          {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        {/* Sort */}

        <select
          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
          value={filter.sort}
          onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
        </select>

        {/* My reviews chip */}
        
        <button
          onClick={() => setFilter({ ...filter, mine: !filter.mine })}
          className={`rounded-full px-4 py-2 text-sm border ${
            filter.mine ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-700 border-rose-200"
          }`}
        >
          My Reviews
        </button>

        {/* Search */}

        <div className="ml-auto flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            placeholder="Search comments"
            className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            onClick={loadReviews}
            className="rounded-full bg-black px-3 py-1.5 text-xs text-white hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Tiles */}
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-rose-100 bg-white/60 animate-pulse" />
          ))
        ) : reviews.length ? (
          reviews.map((r) => (
            <ReviewCard
              key={r._id}
              r={r}
              canEdit={r.isOwner}
              onEdit={(rev) => navigate("/reviews/add", { state: { editing: true, review: rev } })}
              onDelete={async (rev) => {
                if (!confirm("Delete this review?")) return;
                try {
                  await api.delete(`/api/reviews/${rev._id}`);
                  toast.success("Deleted");
                  loadReviews();
                } catch {
                  toast.error("Failed to delete");
                }
              }}
            />
          ))
        ) : (
          <p className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No reviews found.
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios.js";
import ReviewCard from "../../components/ReviewCard.jsx";

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

  useEffect(() => {
    fetchLists();
    loadReviews();
    
  }, []);

  // Refetch when filters change 

  useEffect(() => {
    loadReviews();
    
  }, [filter.category, filter.staffId, filter.mine, filter.sort]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Link to="/reviews/add" className="px-4 py-2 rounded-xl bg-black text-white">
          Add Review
        </Link>
      </div>

      {/* Filters */}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          className="rounded-xl border p-2"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border p-2"
          value={filter.staffId}
          onChange={(e) => setFilter({ ...filter, staffId: e.target.value })}
        >
          <option value="">All Staff</option>
          {staff.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border p-2"
          placeholder="Search comment"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />

        <select
          className="rounded-xl border p-2"
          value={filter.sort}
          onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filter.mine}
            onChange={(e) => setFilter({ ...filter, mine: e.target.checked })}
          />
          My reviews
        </label>
      </div>

      <button onClick={loadReviews} className="mt-3 px-3 py-2 rounded-xl border">
        Apply
      </button>

      <div className="mt-4 grid gap-3">
        {loading ? (
          <p>Loading…</p>
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
          <p>No reviews found.</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios.js";
import ReviewCard from "../../components/ReviewCard.jsx";
import { Plus, Search } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

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
  useEffect(() => {
    loadReviews();
  }, [filter.category, filter.staffId, filter.mine, filter.sort]);

  return (
    <div className="min-h-screen bg-[#FEF4F1]">
      <Navbar />
      <div className="h-20" />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#FBAA99]/40 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#4D423A]">
                Customer Reviews
              </h1>
              <p className="text-sm text-slate-600">
                Your voice shapes our salon experience.
              </p>
            </div>
            <Link
              to="/reviews/add"
              className="
                inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-white shadow
                bg-gradient-to-r from-[#4D423A] to-black hover:opacity-90
              "
            >
              <Plus size={18} /> Add Review
            </Link>
          </div>

          {/* Filters */}
          <div
            className="
              mt-5 flex flex-wrap items-center gap-2 rounded-2xl
              border border-[#FBAA99]/40 bg-white/70 backdrop-blur px-3 py-3
            "
          >
            {/* Category */}
            <select
              className="rounded-full border border-[#FBAA99]/40 bg-white px-4 py-2 text-sm"
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

            {/* Staff */}
            <select
              className="rounded-full border border-[#FBAA99]/40 bg-white px-4 py-2 text-sm"
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

            {/* Sort */}
            <select
              className="rounded-full border border-[#FBAA99]/40 bg-white px-4 py-2 text-sm"
              value={filter.sort}
              onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rating</option>
            </select>

            {/* My reviews chip */}
            <button
              onClick={() => setFilter({ ...filter, mine: !filter.mine })}
              className={`rounded-full px-4 py-2 text-sm border transition ${
                filter.mine
                  ? "bg-[#FBAA99] text-white border-[#FBAA99]"
                  : "bg-white text-slate-700 border-[#FBAA99]/40"
              }`}
            >
              My Reviews
            </button>

            {/* Search */}
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[#FBAA99]/40 bg-white px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                placeholder="Search comments"
                className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                onClick={loadReviews}
                className="rounded-full bg-black px-3 py-1.5 text-xs text-white hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="
                  h-44 rounded-3xl border border-[#FBAA99]/30 bg-white/60
                  animate-pulse
                "
              />
            ))
          ) : reviews.length ? (
            reviews.map((r) => (
              <ReviewCard
                key={r._id}
                r={r}
                canEdit={r.isOwner}
                onEdit={(rev) =>
                  navigate("/reviews/add", {
                    state: { editing: true, review: rev },
                  })
                }
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
            <div className="col-span-full rounded-3xl border border-[#FBAA99]/40 bg-white/80 p-10 text-center">
              <p className="text-[#4D423A] font-semibold">
                No reviews yet — be the first to share your salon experience.
              </p>
              <Link
                to="/reviews/add"
                className="mt-4 inline-block rounded-full bg-black px-5 py-2 text-white hover:opacity-90"
              >
                Write a review
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

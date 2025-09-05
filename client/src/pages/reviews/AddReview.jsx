import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios.js";
import RatingStars from "../../components/RatingStars.jsx";

export default function AddReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.state?.editing || false;
  const existing = location.state?.review || null;

  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    category: existing?.category || "",
    staff: existing?.staff?._id || "",
    rating: existing?.rating || 0,
    comment: existing?.comment || "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: cat }, { data: sf }] = await Promise.all([
          api.get("/api/public/review-categories"),
          api.get("/api/public/staff-for-reviews"),
        ]);
        setCategories(cat.categories || []);
        setStaff(sf.staff || []);
      } catch {
        toast.error("Failed to load form data");
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.staff || !form.rating) {
      toast.error("Please select category, staff and rating");
      return;
    }
    try {
      if (editing && existing) {
        await api.patch(`/api/reviews/${existing._id}`, form);
        toast.success("Review updated");
      } else {
        await api.post("/api/reviews", form);
        toast.success("Review added");
      }
      navigate("/reviews");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="rounded-3xl border border-rose-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {editing ? "Edit Review" : "Add Review"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a category and the staff member who served you.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800">Category</label>
            <select
              className="mt-1 w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 focus:border-rose-400 focus:ring-rose-300"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">Staff Member</label>
            <select
              className="mt-1 w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 focus:border-rose-400 focus:ring-rose-300"
              value={form.staff}
              onChange={(e) => setForm({ ...form, staff: e.target.value })}
            >
              <option value="">Select staff</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">Rating</label>
            <div className="mt-1">
              <RatingStars value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Comment <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-2xl border border-rose-200 bg-white px-3 py-2 focus:border-rose-400 focus:ring-rose-300"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Tell us a bit about your experience…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-black px-6 py-2 text-white shadow hover:opacity-90"
            >
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

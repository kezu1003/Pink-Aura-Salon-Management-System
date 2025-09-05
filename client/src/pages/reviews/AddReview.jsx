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
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editing ? "Edit Review" : "Add Review"}</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            className="mt-1 w-full rounded-xl border p-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Staff Member</label>
          <select
            className="mt-1 w-full rounded-xl border p-2"
            value={form.staff}
            onChange={(e) => setForm({ ...form, staff: e.target.value })}
          >
            <option value="">Select staff</option>
            {staff.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Rating</label>
          <RatingStars
            value={form.rating}
            onChange={(v) => setForm({ ...form, rating: v })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Comment (optional)</label>
          <textarea
            className="mt-1 w-full rounded-xl border p-2"
            rows={4}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
            {editing ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

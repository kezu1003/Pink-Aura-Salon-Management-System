import React, { useEffect, useState } from "react";
import { ReviewsAPI } from "../api/reviews";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewFormModal from "../components/reviews/ReviewFormModal";
import { toast } from "react-toastify";

export default function MyReviews() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1 });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const { data } = await ReviewsAPI.listMine({ page });
      if (data.success) setData(data);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [page]);

  const doDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      const { data } = await ReviewsAPI.remove(id);
      if (data.success) {
        toast.success("Deleted");
        load();
      } else toast.error(data.message || "Failed");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My Reviews</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((r)=>(
          <div key={r._id}>
            <ReviewCard review={r} />
            <div className="flex gap-2 mt-2">
              <button onClick={()=>setEditing(r)} className="px-3 py-1 rounded border">Edit</button>
              <button onClick={()=>doDelete(r._id)} className="px-3 py-1 rounded border text-red-600 border-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
        <span className="px-2 py-1 text-sm">Page {page} / {data.totalPages}</span>
        <button disabled={page>=data.totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
      </div>

      <ReviewFormModal open={!!editing} initial={editing} onClose={()=>setEditing(null)} onSaved={()=>{ setEditing(null); load(); }} />
    </div>
  );
}

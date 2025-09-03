import React, { useEffect, useState } from "react";
import { ReviewsAPI } from "../api/reviews";
import ReviewFilters from "../components/reviews/ReviewFilters";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewFormModal from "../components/reviews/ReviewFormModal";
import { toast } from "react-toastify";

export default function Reviews() {
  const [filters, setFilters] = useState({ q: "", category: "", ratings: [], hasMedia: false, sortBy: "newest" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], totalPages: 1, totalDocs: 0 });
  const [openForm, setOpenForm] = useState(false);

  const load = async () => {
    const params = {
      page, sortBy: filters.sortBy, q: filters.q || undefined,
      category: filters.category || undefined,
      rating: filters.ratings.length ? filters.ratings.join(",") : undefined,
      hasMedia: filters.hasMedia || undefined,
    };
    try {
      const { data } = await ReviewsAPI.listPublic(params);
      if (data.success) setData(data);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Customer Reviews</h1>
        <button onClick={()=>setOpenForm(true)} className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Write a Review</button>
      </div>

      <ReviewFilters filters={filters} setFilters={setFilters} onApply={()=>{ setPage(1); load(); }} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {data.data.map(r => <ReviewCard key={r._id} review={r} />)}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
        <span className="px-2 py-1 text-sm">Page {page} / {data.totalPages}</span>
        <button disabled={page>=data.totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
      </div>

      <ReviewFormModal open={openForm} onClose={()=>setOpenForm(false)} onSaved={load} />
    </div>
  );
}

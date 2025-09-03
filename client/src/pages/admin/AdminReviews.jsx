import React, { useEffect, useState } from "react";
import { ReviewsAPI } from "../../api/reviews";
import { toast } from "react-toastify";

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [status, setStatus] = useState(""); // approved|pending|hidden or ""
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      const { data } = await ReviewsAPI.adminList({ page, status: status || undefined, q: q || undefined });
      if (data.success) { setRows(data.data); setMeta({ totalPages: data.totalPages }); }
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [page, status]);

  const setRowStatus = async (id, s) => {
    try {
      const { data } = await ReviewsAPI.adminSetStatus(id, s);
      if (data.success) { toast.success("Updated"); load(); }
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
  };

  const hardDelete = async (id) => {
    if (!confirm("Permanently delete?")) return;
    try {
      const { data } = await ReviewsAPI.remove(id, { hard: true });
      if (data.success) { toast.success("Deleted"); load(); }
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Admin • Reviews</h1>

      <div className="flex items-center gap-2 mb-3">
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
          <option value="pending">Pending</option>
        </select>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="search..." className="border rounded px-2 py-1" />
        <button onClick={()=>{ setPage(1); load(); }} className="px-3 py-1 rounded border">Apply</button>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2 text-center">{r.rating}★</td>
                <td className="px-3 py-2 text-center">{r.category}</td>
                <td className="px-3 py-2 text-center">{r.anonymous ? "Anonymous" : r.user?.name}</td>
                <td className="px-3 py-2 text-center">{r.status}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={()=>setRowStatus(r._id, "approved")} className="px-2 py-1 rounded border">Approve</button>
                    <button onClick={()=>setRowStatus(r._id, "hidden")} className="px-2 py-1 rounded border">Hide</button>
                    <button onClick={()=>hardDelete(r._id)} className="px-2 py-1 rounded border text-red-600 border-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan="6" className="px-3 py-6 text-center text-zinc-500">No reviews</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
        <span className="px-2 py-1 text-sm">Page {page} / {meta.totalPages}</span>
        <button disabled={page>=meta.totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

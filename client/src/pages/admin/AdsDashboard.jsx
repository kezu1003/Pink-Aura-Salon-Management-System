import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdvertisementForm from "../../components/AdvertisementForm";
import AdvertisementCard from "../../components/AdvertisementCard";
import { AdsAPI } from "../../api/ads";

export default function AdsDashboard() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    try {
      const stat = status === "all" ? null : status === "active";
      const { data, total } = await AdsAPI.list({ page, limit, status: stat });
      setItems(data);
      setTotal(total);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load");
    }
  };

  useEffect(() => { fetchData(); }, [page, status]); // eslint-disable-line

  const pages = Math.ceil(total / limit) || 1;

  const onDelete = async (ad) => {
    if (!confirm(`Delete "${ad.title}"?`)) return;
    try {
      await AdsAPI.remove(ad._id);
      toast.success("Deleted");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-pink-700">Advertisement Manager</h1>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg p-2">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white"
          >
            New Ad
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-2xl p-4">
            <AdvertisementForm
              advertisement={editing}
              onClose={() => setOpen(false)}
              onSuccess={fetchData}
            />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((ad) => (
          <AdvertisementCard
            key={ad._id}
            ad={ad}
            onEdit={(a) => { setEditing(a); setOpen(true); }}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border ${p === page ? "bg-pink-600 text-white" : "bg-white"}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

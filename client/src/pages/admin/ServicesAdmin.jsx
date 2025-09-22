import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import ServiceForm from "../../components/ServiceForm";

export default function ServicesAdmin() {
  const { backendUrl } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [activeOnly, setActiveOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); 
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState(["Hair", "Nails", "Makeup", "Facials", "Other"]);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "All") params.set("category", category);
      if (activeOnly) params.set("activeOnly", "true");
      const { data } = await axios.get(`${backendUrl}/api/services?${params.toString()}`);
      if (data.success) {
        setItems(data.services || []);
        if (Array.isArray(data.categories)) setCategories(["All", ...data.categories]);
      } else {
        toast.error(data.message || "Failed to load services");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); 
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, category, activeOnly]);

  const filtered = useMemo(() => items, [items]);

  const onAdd = () => { setEditing(null); setShowForm(true); };
  const onEdit = (it) => { setEditing(it); setShowForm(true); };

  const onSaved = async () => {
    setShowForm(false);
    await load();
  };

  const onDelete = async (id) => {
    if (!confirm("Soft delete this service? (It will be marked inactive)")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/services/${id}`, { withCredentials: true });
      if (data.success) {
        toast.success("Service removed");
        load();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Services</h2>
        <div className="flex gap-2">
          
          <button onClick={onAdd} className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:opacity-90">Add Service</button>
        </div>
      </header>

      {/* Filters */}

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services..."
          className="px-3 py-2 rounded-lg border"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          Active only
        </label>
      </div>

      {/* Table */}

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pink-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price (Rs.)</th>
              <th className="text-left p-3">Duration</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">No services</td></tr>
            ) : filtered.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-3">{it.name}</td>
                <td className="p-3">{it.category}</td>
                <td className="p-3">{it.price?.toLocaleString?.() ?? it.price}</td>
                <td className="p-3">{it.durationMins} mins</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${it.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                    {it.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(it)} className="px-3 py-1 rounded border">Edit</button>
                    <button onClick={() => onDelete(it._id)} className="px-3 py-1 rounded border">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer/Modal substitute */}
      
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">{editing ? "Edit Service" : "Add Service"}</h3>
              <button onClick={() => setShowForm(false)} className="text-sm">✕</button>
            </div>
            <ServiceForm
              backendUrl={backendUrl}
              initial={editing}
              onSaved={onSaved}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

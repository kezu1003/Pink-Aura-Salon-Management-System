import { useEffect, useState } from "react";
import { createProduct, deleteProduct, fetchProducts, patchStock, updateProduct } from "../api/products";
import { toast } from "react-toastify";

const empty = { name: "", sku: "", category: "", brand: "", price: "", salePrice: "", stock: 0, images: [""], expiryDate: "", status: "active", description: "" };

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await fetchProducts({ limit: 100, status: "active" });
      setList(res.items);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price || 0), salePrice: form.salePrice ? Number(form.salePrice) : undefined, stock: Number(form.stock || 0), images: form.images.filter(Boolean), expiryDate: form.expiryDate || undefined };
      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success("Updated");
      } else {
        await createProduct(payload);
        toast.success("Created");
      }
      setForm(empty);
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const edit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name, sku: p.sku, category: p.category, brand: p.brand || "", price: p.price, salePrice: p.salePrice || "",
      stock: p.stock, images: p.images?.length ? p.images : [""], expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "", status: p.status, description: p.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const bumpStock = async (id, delta) => {
    try {
      await patchStock(id, { delta });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Admin · Products</h1>

      {/* Form */}
      <div className="border rounded p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded px-2 py-1" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value.toUpperCase() })} />
          <input className="border rounded px-2 py-1" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="border rounded px-2 py-1" placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          <input className="border rounded px-2 py-1" type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="border rounded px-2 py-1" type="number" placeholder="Sale Price (optional)" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
          <input className="border rounded px-2 py-1" type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          <input className="border rounded px-2 py-1" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
          <select className="border rounded px-2 py-1" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <textarea className="border rounded px-2 py-1 w-full mt-2" rows={3} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="mt-2 flex gap-2">
          {form.images.map((url, idx) => (
            <input key={idx} className="border rounded px-2 py-1 flex-1" placeholder={`Image URL #${idx + 1}`} value={url}
                   onChange={e => setForm({ ...form, images: form.images.map((u, i) => i === idx ? e.target.value : u) })} />
          ))}
          <button className="px-3 py-1 border rounded" onClick={() => setForm(f => ({ ...f, images: [...f.images, ""] }))}>+ Image</button>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 rounded bg-black text-white" onClick={save}>{editingId ? "Update" : "Create"}</button>
          {editingId && <button className="px-3 py-1 rounded border" onClick={() => { setForm(empty); setEditing(null); }}>Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">SKU</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Expiry</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p._id} className="border-t">
                <td className="p-2 border">{p.sku}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.category}</td>
                <td className="p-2 border">Rs. {(p.salePrice ?? p.price).toFixed(2)}</td>
                <td className="p-2 border">
                  <div className="flex items-center gap-2">
                    <span>{p.stock}</span>
                    <button className="px-2 py-0.5 border rounded" onClick={() => bumpStock(p._id, +1)}>+1</button>
                    <button className="px-2 py-0.5 border rounded" onClick={() => bumpStock(p._id, -1)}>-1</button>
                  </div>
                </td>
                <td className="p-2 border">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => edit(p)}>Edit</button>
                    <button className="px-2 py-1 border rounded" onClick={() => remove(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td className="p-3 text-center" colSpan={7}>No products</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

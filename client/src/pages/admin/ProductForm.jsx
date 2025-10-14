import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const CATS = [
  "Hair Care Products",
  "Nail Care Products",
  "Skincare Products",
  "Makeup Products",
];

const SKIN_TYPES = [
  "All Skin Types",
  "Dry Skin",
  "Oily Skin", 
  "Combination Skin",
  "Sensitive Skin",
  "Normal Skin",
  "Mature Skin",
  "Acne-Prone Skin"
];

export default function ProductForm() {
  const { id } = useParams(); // undefined for create
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    description: "",
    images: [""],
    stock: "",
    expiryDate: "",
    skinType: "All Skin Types",
    isActive: true,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        const p = data.product;
        setForm({
          name: p.name ?? "",
          category: p.category ?? "",
          brand: p.brand ?? "",
          price: p.price ?? "",
          description: p.description ?? "",
          images: p.images?.length ? p.images : [""],
          stock: p.stock ?? "",
          expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0, 10) : "",
          skinType: p.skinType ?? "All Skin Types",
          isActive: p.isActive ?? true,
        });
      } catch (e) {
        toast.error("Failed to fetch product");
      }
    })();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
      };
      const { data } = id
        ? await api.put(`/api/products/${id}`, payload)
        : await api.post(`/api/products`, payload);
      if (data.success) {
        toast.success(id ? "Updated" : "Created");
        navigate("/admin/products");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? "Edit Product" : "New Product"}
      </h1>

      <form onSubmit={submit} className="grid gap-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="border rounded-lg px-3 py-2 w-full"
            value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select className="border rounded-lg px-3 py-2 w-full"
              value={form.category} onChange={(e) => set("category", e.target.value)} required>
              <option value="">Select...</option>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Brand</label>
            <input className="border rounded-lg px-3 py-2 w-full"
              value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Price (LKR)</label>
            <input type="number" min="0" step="0.01"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.price} onChange={(e) => set("price", e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Skin Type</label>
          <select className="border rounded-lg px-3 py-2 w-full"
            value={form.skinType} onChange={(e) => set("skinType", e.target.value)}>
            {SKIN_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="border rounded-lg px-3 py-2 w-full"
            rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Images (URLs)</label>
          <div className="grid gap-2">
            {form.images.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="border rounded-lg px-3 py-2 w-full"
                  value={url}
                  onChange={(e) => {
                    const copy = [...form.images];
                    copy[idx] = e.target.value;
                    set("images", copy);
                  }}
                />
                <button
                  type="button"
                  onClick={() => set("images", form.images.filter((_, i) => i !== idx))}
                  className="px-3 rounded border"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("images", [...form.images, ""])}
              className="self-start px-3 py-1 rounded border"
            >
              + Add image URL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Stock</label>
            <input type="number" min="0" className="border rounded-lg px-3 py-2 w-full"
              value={form.stock} onChange={(e) => set("stock", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Expiry Date</label>
            <input type="date" className="border rounded-lg px-3 py-2 w-full"
              value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-black text-white" type="submit">
            {id ? "Save Changes" : "Create Product"}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border"
            onClick={() => history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

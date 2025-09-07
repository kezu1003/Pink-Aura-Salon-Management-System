import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CATEGORIES = ["Hair", "Nails", "Makeup", "Facials", "Other"];

export default function ServiceForm({ backendUrl, initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMins: "",
    category: "Hair",
    isActive: true,
  });
  const isEdit = Boolean(initial?._id);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        description: initial.description || "",
        price: initial.price ?? "",
        durationMins: initial.durationMins ?? "",
        category: initial.category || "Hair",
        isActive: initial.isActive ?? true,
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        durationMins: Number(form.durationMins),
      };
      const url = isEdit
        ? `${backendUrl}/api/services/${initial._id}`
        : `${backendUrl}/api/services`;
      const method = isEdit ? "put" : "post";
      const { data } = await axios[method](url, payload, { withCredentials: true });
      if (data.success) {
        toast.success(isEdit ? "Service updated" : "Service created");
        onSaved?.(data.service || initial);
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Classic Facial"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={onChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="5000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (mins)</label>
          <input
            name="durationMins"
            type="number"
            min="10"
            max="300"
            step="5"
            value={form.durationMins}
            onChange={onChange}
            required
            className="w-full rounded-lg border px-3 py-2"
            placeholder="60"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2 resize-y"
            placeholder="Short description..."
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={onChange}
            className="rounded"
          />
          Active
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:opacity-90"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makePackagesApi } from "../../api/packages";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const EMPTY = {
  name: "",
  description: "",
  servicesIncluded: "",
  category: "Other",
  price: "",
  discountPrice: "",
  estimatedTimeMins: 60,
  image: "",
  seasonalOffer: { enabled: false, label: "" },
  isActive: true,
};

export default function PackageForm() {
  const { id } = useParams();
  const isEdit = !!id;

  const { backendUrl } = useContext(AppContext);
  const api = makePackagesApi(backendUrl);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      const { success, package: pkg, message } = await api.get(id);
      if (!success) return toast.error(message || "Failed to load package");
      setForm({
        ...EMPTY,
        ...pkg,
        servicesIncluded: (pkg.servicesIncluded || []).join(", "),
        discountPrice: pkg.discountPrice ?? "",
      });
    })();
  }, [id, isEdit]); 

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        servicesIncluded: String(form.servicesIncluded || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        price: Number(form.price),
        discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
        estimatedTimeMins: Number(form.estimatedTimeMins || 60),

      };

      const fn = isEdit ? api.update.bind(null, id) : api.create;
      const { success, message } = await fn(payload);
      if (!success) return toast.error(message || "Save failed");
      toast.success(isEdit ? "Package updated" : "Package created");
      navigate("/admin/packages");
    }  catch (e2) {
      toast.error(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select className="w-full border rounded-lg px-3 py-2" value={form.category} onChange={(e) => update("category", e.target.value)}>
            {["Other", "Hair", "Nails", "Makeup", "Facials", "Bridal", "Spa"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Services Included (comma separated)</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Haircut, Blowdry, Face cleanup…"
          value={form.servicesIncluded}
          onChange={(e) => update("servicesIncluded", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Price (Rs.)</label>
          <input
            type="number"
            min="0"
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Discount Price (optional)</label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-lg px-3 py-2"
            value={form.discountPrice}
            onChange={(e) => update("discountPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Estimated Time (mins)</label>
          <input
            type="number"
            min="10"
            className="w-full border rounded-lg px-3 py-2"
            value={form.estimatedTimeMins}
            onChange={(e) => update("estimatedTimeMins", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Image URL</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.image} onChange={(e) => update("image", e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.seasonalOffer?.enabled}
              onChange={(e) => update("seasonalOffer", { ...form.seasonalOffer, enabled: e.target.checked })}
            />
            Seasonal Offer
          </label>
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Offer label (e.g., Summer Sale)"
            value={form.seasonalOffer?.label || ""}
            onChange={(e) => update("seasonalOffer", { ...form.seasonalOffer, label: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          Active
        </label>

        <button disabled={saving} className="px-5 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">
          {saving ? "Saving…" : isEdit ? "Update Package" : "Create Package"}
        </button>
      </div>
    </form>
  );
}

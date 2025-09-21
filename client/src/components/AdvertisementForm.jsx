import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AdsAPI } from "../api/ads";

const initial = { title: "", description: "", startDate: "", endDate: "", status: true };

export default function AdvertisementForm({ advertisement = null, onClose, onSuccess }) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const isEdit = Boolean(advertisement?._id);

  useEffect(() => {
    if (advertisement) {
      const { title, description, startDate, endDate, status } = advertisement;
      setForm({
        title,
        description: description || "",
        startDate: startDate ? new Date(startDate).toISOString().slice(0, 10) : "",
        endDate: endDate ? new Date(endDate).toISOString().slice(0, 10) : "",
        status,
      });
    } else {
      setForm(initial);
      setFile(null);
    }
  }, [advertisement]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isEdit && !file) return toast.error("Please choose an image");
      const payload = { ...form };
      if (file) payload.image = file;

      isEdit ? await AdsAPI.update(advertisement._id, payload) : await AdsAPI.create(payload);
      toast.success(isEdit ? "Advertisement updated" : "Advertisement created");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 bg-white rounded-2xl shadow border max-w-xl w-full">
      <h2 className="text-xl font-semibold text-pink-700">{isEdit ? "Edit" : "New"} Advertisement</h2>

      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">Title
          <input name="title" value={form.title} onChange={onChange} className="mt-1 w-full border rounded-lg p-2" required />
        </label>
        <label className="text-sm">Description
          <textarea name="description" value={form.description} onChange={onChange} className="mt-1 w-full border rounded-lg p-2" rows={3} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Start Date
            <input type="date" name="startDate" value={form.startDate} onChange={onChange} className="mt-1 w-full border rounded-lg p-2" required />
          </label>
          <label className="text-sm">End Date
            <input type="date" name="endDate" value={form.endDate} onChange={onChange} className="mt-1 w-full border rounded-lg p-2" required />
          </label>
        </div>
        <label className="text-sm">Status
          <select
            name="status"
            value={String(form.status)}
            onChange={(e) => setForm((s) => ({ ...s, status: e.target.value === "true" }))}
            className="mt-1 w-full border rounded-lg p-2"
          >
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </select>
        </label>
        <label className="text-sm">Image
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg p-2" />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
        <button className="px-4 py-2 rounded-lg bg-pink-600 text-white">{isEdit ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}

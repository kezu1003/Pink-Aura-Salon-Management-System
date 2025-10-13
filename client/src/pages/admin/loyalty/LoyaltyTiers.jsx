import { useEffect, useState } from "react";
import { listTiers, createTier, updateTier, deleteTier } from "../../../api/loyaltyAdmin";
import { toast } from "react-hot-toast";

export default function LoyaltyTiers() {
  const [tiers, setTiers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    _id: undefined,
    name: "",
    minSpendRolling12m: 0,
    earnRate: 0.01,
    redeemRate: 1,
    maxRedeemPctPerOrder: 20,
    perks: "",
    isActive: true,
  });

  const load = async () => {
    try {
      const { data } = await listTiers();
      setTiers(data);
    } catch {
      toast.error("Failed to load tiers");
    }
  };

  useEffect(() => {
    load().catch(() => toast.error("Failed to load tiers"));
  }, []);

  const save = async () => {
    if (saving) return;
    if (!form.name?.trim()) return toast.error("Name required");

    // Coerce types right before POST (inputs can be strings)
    const payload = {
      name: String(form.name).trim(),
      minSpendRolling12m: Number(form.minSpendRolling12m ?? 0),
      earnRate: Number(form.earnRate ?? 0.01),
      redeemRate: Number(form.redeemRate ?? 1),
      maxRedeemPctPerOrder: Number(form.maxRedeemPctPerOrder ?? 20),
      perks: form.perks ?? "",
      isActive: typeof form.isActive === "boolean" ? form.isActive : String(form.isActive) === "true",
    };

    if (
      Number.isNaN(payload.minSpendRolling12m) ||
      Number.isNaN(payload.earnRate) ||
      Number.isNaN(payload.redeemRate) ||
      Number.isNaN(payload.maxRedeemPctPerOrder)
    ) {
      return toast.error("Fill required numeric fields");
    }

    setSaving(true);
    try {
      if (form._id) {
        await updateTier(form._id, payload);
        toast.success("Updated");
      } else {
        await createTier(payload);
        toast.success("Created");
      }

      setForm({
        _id: undefined,
        name: "",
        minSpendRolling12m: 0,
        earnRate: 0.01,
        redeemRate: 1,
        maxRedeemPctPerOrder: 20,
        perks: "",
        isActive: true,
      });
      await load();
    } catch (e) {
      console.error("[LOYALTY] create/update failed:", e?.response || e);
      toast.error(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const edit = (t) =>
    setForm({
      _id: t._id,
      name: t.name ?? "",
      minSpendRolling12m: t.minSpendRolling12m ?? 0,
      earnRate: t.earnRate ?? 0.01,
      redeemRate: t.redeemRate ?? 1,
      maxRedeemPctPerOrder: t.maxRedeemPctPerOrder ?? 20,
      perks: t.perks ?? "",
      isActive: typeof t.isActive === "boolean" ? t.isActive : true,
    });

  const removeTier = async (id) => {
    if (!confirm("Delete tier?")) return;
    try {
      await deleteTier(id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      console.error("[LOYALTY] delete failed:", e?.response || e);
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Loyalty Tiers</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-4 bg-white">
          <h2 className="font-medium mb-3">{form._id ? "Edit Tier" : "Create Tier"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded p-2 col-span-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="border rounded p-2"
              type="number"
              step="1"
              placeholder="Min Spend (12m)"
              value={form.minSpendRolling12m}
              onChange={(e) => setForm({ ...form, minSpendRolling12m: e.target.value })}
            />

            <input
              className="border rounded p-2"
              type="number"
              step="0.0001"
              placeholder="Earn Rate (points per LKR)"
              value={form.earnRate}
              onChange={(e) => setForm({ ...form, earnRate: e.target.value })}
            />

            <input
              className="border rounded p-2"
              type="number"
              step="0.01"
              placeholder="Redeem Rate (LKR per point)"
              value={form.redeemRate}
              onChange={(e) => setForm({ ...form, redeemRate: e.target.value })}
            />

            <input
              className="border rounded p-2"
              type="number"
              step="1"
              placeholder="Max Redeem % per order"
              value={form.maxRedeemPctPerOrder}
              onChange={(e) => setForm({ ...form, maxRedeemPctPerOrder: e.target.value })}
            />

            {/* important: select binds as string; convert in save() */}
            <select
              className="border rounded p-2"
              value={String(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.value })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <textarea
              className="border rounded p-2 col-span-2"
              placeholder="Perks"
              value={form.perks}
              onChange={(e) => setForm({ ...form, perks: e.target.value })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              onClick={save}
              disabled={saving}
            >
              {form._id ? (saving ? "Updating..." : "Update") : (saving ? "Creating..." : "Create")}
            </button>
            {form._id && (
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() =>
                  setForm({
                    _id: undefined,
                    name: "",
                    minSpendRolling12m: 0,
                    earnRate: 0.01,
                    redeemRate: 1,
                    maxRedeemPctPerOrder: 20,
                    perks: "",
                    isActive: true,
                  })
                }
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Min Spend</th>
                <th className="py-2">Earn</th>
                <th className="py-2">Redeem</th>
                <th className="py-2">Max%</th>
                <th className="py-2">Active</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="py-2">{t.name}</td>
                  <td className="py-2">
                    LKR{" "}
                    {typeof t.minSpendRolling12m === "number"
                      ? t.minSpendRolling12m.toLocaleString()
                      : t.minSpendRolling12m}
                  </td>
                  <td className="py-2">{t.earnRate}</td>
                  <td className="py-2">{t.redeemRate}</td>
                  <td className="py-2">{t.maxRedeemPctPerOrder}%</td>
                  <td className="py-2">{t.isActive ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded bg-gray-100" onClick={() => edit(t)} disabled={saving}>
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-red-100 text-red-700"
                        onClick={() => removeTier(t._id)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tiers.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={7}>
                    No tiers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

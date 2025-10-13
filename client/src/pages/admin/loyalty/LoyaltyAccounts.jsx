import { useEffect, useState } from "react";
import { searchAccounts, adjustPoints } from "../../../api/loyaltyAdmin";
import { toast } from "react-hot-toast";

export default function LoyaltyAccounts() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [adjust, setAdjust] = useState({ id: "", points: 0, note: "" });

  const load = async () => {
    const { data } = await searchAccounts(q);
    setRows(data);
  };

  useEffect(() => {
    load().catch(() => toast.error("Failed to load accounts"));
    // eslint-disable-next-line
  }, []);

  const doAdjust = async () => {
    if (!adjust.id) return toast.error("Select an account");
    try {
      await adjustPoints(adjust.id, { points: Number(adjust.points), note: adjust.note });
      toast.success("Points adjusted");
      setAdjust({ id: "", points: 0, note: "" });
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Adjust failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Loyalty Accounts</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Search name or email"
          className="border rounded p-2 w-64"
        />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={load}>Search</button>
      </div>

      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2 px-3">User</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Tier</th>
              <th className="py-2 px-3">Points</th>
              <th className="py-2 px-3">Lifetime</th>
              <th className="py-2 px-3">12m Spend</th>
              <th className="py-2 px-3">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r)=>(
              <tr key={r._id} className="border-t">
                <td className="py-2 px-3">{r.user?.name}</td>
                <td className="py-2 px-3">{r.user?.email}</td>
                <td className="py-2 px-3">{r.tier?.name || "—"}</td>
                <td className="py-2 px-3">{r.pointsBalance}</td>
                <td className="py-2 px-3">{r.lifetimePoints}</td>
                <td className="py-2 px-3">LKR {r.rolling12mSpend?.toLocaleString?.() ?? r.rolling12mSpend}</td>
                <td className="py-2 px-3">
                  <button
                    className="px-2 py-1 rounded bg-gray-100"
                    onClick={()=>setAdjust({ id: r._id, points: 0, note: "" })}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="py-3 px-3 text-gray-500" colSpan={7}>No accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust dialog (simple inline controls for now) */}
      {adjust.id && (
        <div className="mt-4 rounded-2xl border p-4 bg-white max-w-lg">
          <h3 className="font-medium mb-3">Adjust Points</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded p-2"
              type="number"
              placeholder="Points (use negative to remove)"
              value={adjust.points}
              onChange={(e)=>setAdjust({...adjust, points: e.target.value})}
            />
            <input
              className="border rounded p-2"
              placeholder="Note (optional)"
              value={adjust.note}
              onChange={(e)=>setAdjust({...adjust, note: e.target.value})}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-2 rounded bg-black text-white" onClick={doAdjust}>Save</button>
            <button className="px-4 py-2 rounded bg-gray-200" onClick={()=>setAdjust({ id: "", points: 0, note: "" })}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

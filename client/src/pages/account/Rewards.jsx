import { useEffect, useState } from "react";
import { getMyLoyalty, getMyLoyaltyTxns } from "../../api/loyalty";
import { toast } from "react-hot-toast";

export default function Rewards() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyLoyalty();
        setSummary(data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load rewards");
      }
    })();
  }, []);

  useEffect(() => {
    loadTxns(true);
   
  }, []);

  async function loadTxns(reset = false) {
    try {
      const { data } = await getMyLoyaltyTxns(
        reset ? { limit: 10 } : { limit: 10, cursor }
      );
      if (reset) setTxns(data.items);
      else setTxns((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Rewards</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl shadow p-4">
            <div className="text-sm text-gray-500">Tier</div>
            <div className="text-xl font-bold">{summary?.tier?.name || "—"}</div>
            <div className="text-xs text-gray-500">{summary?.tier?.perks}</div>
          </div>
          <div className="rounded-2xl shadow p-4">
            <div className="text-sm text-gray-500">Points Balance</div>
            <div className="text-2xl font-extrabold">{summary?.pointsBalance ?? 0}</div>
          </div>
          <div className="rounded-2xl shadow p-4">
            <div className="text-sm text-gray-500">Spend (last 12m)</div>
            <div className="text-xl font-bold">LKR {summary?.rolling12mSpend?.toLocaleString() ?? 0}</div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
      <div className="rounded-2xl shadow divide-y">
        {txns.length === 0 && !loading && (
          <div className="p-4 text-sm text-gray-500">No transactions yet.</div>
        )}
        {txns.map((t) => (
          <div key={t._id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium capitalize">{t.type}</div>
              <div className="text-xs text-gray-500">
                {new Date(t.createdAt).toLocaleString()} • {t.source}
                {t.sourceId ? ` #${String(t.sourceId).slice(-6)}` : ""}
                {t.note ? ` • ${t.note}` : ""}
              </div>
            </div>
            <div className={`font-semibold ${t.points >= 0 ? "text-green-600" : "text-red-600"}`}>
              {t.points > 0 ? `+${t.points}` : t.points}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => loadTxns(false)} className="px-4 py-2 rounded-xl shadow">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

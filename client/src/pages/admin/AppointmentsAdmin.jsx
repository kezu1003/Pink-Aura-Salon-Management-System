import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { toast } from "react-toastify";
import { format, isToday } from "date-fns";

export default function AppointmentsAdmin() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);

  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("new"); 


  const ts = (v) => {
    const d = v instanceof Date ? v : new Date(v);
    const t = d.getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const tsGroup = (key) => {
    const t = new Date(key).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  async function load() {
    const data = await api.adminGrouped("date");
    if (!data?.success) {
      toast.error(data?.message || "Failed to load appointments");
      return;
    }
    const g = data.groups || [];
    setGroups(g);

    const all = g.flatMap((x) => x.items || []);
    const today = all.filter((a) => isToday(new Date(a.startTime)));
    const counts = { total: today.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const a of today) if (counts[a.status] !== undefined) counts[a.status]++;
    setStats(counts);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const onStatusChange = async (apptId, newStatus) => {

    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: (g.items || []).map((a) => (a._id === apptId ? { ...a, status: newStatus } : a)),
      }))
    );

    const res = await api.updateStatus(apptId, newStatus);
    if (!res.success) {
      toast.error(res.message || "Failed to update status");
    }
    load();
  };

  const filterItemsByStatus = (items) => (!filterStatus ? items : items.filter((a) => a.status === filterStatus));

  const tiles = [
    { key: "total", label: "Total Today", value: stats.total, color: "#000000" },
    { key: "pending", label: "Pending", value: stats.pending, color: "#FBAA99" },
    { key: "confirmed", label: "Confirmed", value: stats.confirmed, color: "#4D423A" },
    { key: "completed", label: "Completed", value: stats.completed, color: "#4D423A" },
    { key: "cancelled", label: "Cancelled", value: stats.cancelled, color: "#D9534F" },
  ];

  const sortedGroups = [...groups].sort((a, b) => {
    const diff = tsGroup(b._id) - tsGroup(a._id);
    return sortOrder === "new" ? diff : -diff;
  });

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#FEF4F1" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#4D423A" }}>Appointments</h1>
        <div className="ml-auto flex gap-2 flex-wrap">
          {["pending", "confirmed", "completed", "cancelled"].map((k) => (
            <button
              key={k}
              onClick={() => setFilterStatus(filterStatus === k ? "" : k)}
              className="px-3 py-1.5 rounded-full border text-sm font-medium transition"
              style={{
                backgroundColor: filterStatus === k ? "#FBAA99" : "#FFFFFF",
                color: filterStatus === k ? "#FFFFFF" : "#4D423A",
                borderColor: "#4D423A",
              }}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSortOrder(sortOrder === "new" ? "old" : "new")}
            className="px-3 py-1.5 rounded-full border text-sm font-medium"
            style={{ backgroundColor: "#FFFFFF", color: "#4D423A", borderColor: "#4D423A" }}
          >
            {sortOrder === "new" ? "New → Old" : "Old → New"}
          </button>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {tiles.map((t) => (
          <div
            key={t.key}
            className="rounded-xl p-4 border-2 shadow-sm text-center transition hover:shadow-md"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#FBAA99" }}
          >
            <div className="text-sm font-semibold" style={{ color: t.color }}>{t.label}</div>
            <div className="text-3xl font-bold mt-1" style={{ color: "#4D423A" }}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Group list */}
      {sortedGroups.length === 0 ? (
        <div className="text-gray-600">No appointments.</div>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map((g) => {
            const filtered = filterItemsByStatus(g.items || []);
            const sortedItems = [...filtered].sort((a, b) => {
              const diff = ts(b.startTime) - ts(a.startTime);
              return sortOrder === "new" ? diff : -diff;
            });

            if (sortedItems.length === 0) return null;

            return (
              <section
                key={g._id}
                className="border rounded-lg shadow-sm"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#FBAA99", borderWidth: 2 }}
              >
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <div className="font-medium" style={{ color: "#4D423A" }}>
                    {g._id} <span className="ml-2 text-gray-500 text-sm">({sortedItems.length})</span>
                  </div>
                </div>
                <div className="divide-y">
                  {sortedItems.map((a) => {
                    const isCancelled = a.status === "cancelled";
                    return (
                      <div
                        key={a._id}
                        className="px-4 py-2 grid grid-cols-12 items-center gap-3"
                        style={{ backgroundColor: isCancelled ? "#FFF1F1" : "white" }}
                      >
                        <div className="col-span-3">
                          <div className="font-medium" style={{ color: "#000000" }}>
                            {format(new Date(a.startTime), "PPp")}
                          </div>
                        </div>
                        <div className="col-span-3 text-sm" style={{ color: "#4D423A" }}>
                          <div>Customer: {a.customer?.name || "-"}</div>
                          <div className="text-xs text-gray-500">{a.customer?.email || ""}</div>
                          <div className="text-xs text-gray-500">
                            Payment: {a.paymentStatus === "paid" ? "Paid" : "Not Paid"}
                          </div>
                        </div>
                        <div className="col-span-3 text-sm" style={{ color: "#4D423A" }}>
                          Services: {a.serviceNames?.join(", ") || "-"}
                        </div>
                        <div className="col-span-3">
                          <select
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={a.status}
                            disabled={isCancelled}
                            onChange={(e) => onStatusChange(a._id, e.target.value)}
                            style={{ borderColor: "#FBAA99", backgroundColor: "#FFFFFF", color: "#4D423A" }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { toast } from "react-toastify";
import { format, isToday } from "date-fns";

export default function AppointmentsAdmin() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);

  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, started: 0, completed: 0 });
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("new"); // new or old

  // Load appointments and calculate stats
  async function load() {
    const data = await api.adminGrouped("date");
    if (!data?.success) return toast.error(data?.message || "Failed to load appointments");

    setGroups(data.groups || []);

    // Calculate stats for today
    let total = 0, pending = 0, started = 0, completed = 0;
    (data.groups || []).forEach(g => {
      g.items.forEach(a => {
        if (isToday(new Date(a.startTime))) {
          total++;
          if (a.status === "pending") pending++;
          else if (a.status === "started") started++;
          else if (a.status === "completed") completed++;
        }
      });
    });
    setStats({ total, pending, started, completed });
  }

  useEffect(() => { load(); }, []);

  // Update status (live + server)
  const onStatusChange = async (apptId, newStatus) => {
    let oldStatus;
    // Optimistic update groups + stats
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        items: g.items.map(a => {
          if (a._id === apptId) {
            oldStatus = a.status; // capture old status
            // Only adjust stats for today
            if (isToday(new Date(a.startTime))) {
              setStats(prevStats => {
                const newStats = { ...prevStats };
                if (oldStatus) newStats[oldStatus]--;
                if (newStatus) newStats[newStatus]++;
                return newStats;
              });
            }
            return { ...a, status: newStatus }; // update locally
          }
          return a;
        })
      }))
    );

    // Send update to server
    const res = await api.updateStatus(apptId, newStatus);
    if (!res.success) {
      toast.error(res.message || "Failed to update status");
      load(); // reload if server fails
    }
  };

  const filterItemsByStatus = items => {
    if (!filterStatus) return items;
    return items.filter(a => a.status === filterStatus);
  };

  // Tiles config
  const tiles = [
    { label: "Total Today", value: stats.total, bg: "#FFFFFF", text: "#000000" },
    { label: "Pending", value: stats.pending, bg: "#FFFFFF", text: "#FBAA99" },
    { label: "Started", value: stats.started, bg: "#FFFFFF", text: "#4D423A" },
    { label: "Completed", value: stats.completed, bg: "#FFFFFF", text: "#4D423A" },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#FEF4F1" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#4D423A" }}>Appointments</h1>
        <div className="ml-auto flex gap-2">
          {["pending", "started", "completed"].map(k => (
            <button
              key={k}
              onClick={() => setFilterStatus(filterStatus === k ? "" : k)}
              className="px-3 py-1.5 rounded-full border transition"
              style={{
                backgroundColor: filterStatus === k ? "#FBAA99" : "#FFFFFF",
                color: filterStatus === k ? "#FFFFFF" : "#4D423A",
                borderColor: "#4D423A"
              }}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSortOrder(sortOrder === "new" ? "old" : "new")}
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#4D423A",
              borderColor: "#4D423A"
            }}
          >
            {sortOrder === "new" ? "New → Old" : "Old → New"}
          </button>
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {tiles.map((t, idx) => (
          <div
            key={idx}
            className="rounded-xl p-4 border shadow-sm"
            style={{ backgroundColor: t.bg, borderColor: "#FBAA99", borderWidth: 2 }}
          >
            <div className="text-lg font-semibold" style={{ color: t.text }}>{t.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: "#4D423A" }}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      {groups.length === 0 ? (
        <div className="text-gray-600">No appointments.</div>
      ) : (
        <div className="space-y-4">
          {groups.map(g => {
            let filteredItems = filterItemsByStatus(g.items);
            filteredItems = filteredItems.sort((a,b) =>
              sortOrder === "new" ? new Date(b.startTime) - new Date(a.startTime) : new Date(a.startTime) - new Date(b.startTime)
            );
            if(filteredItems.length === 0) return null;
            return (
              <section
                key={g._id}
                className="border rounded-lg shadow-sm"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#FBAA99", borderWidth: 2 }}
              >
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <div className="font-medium" style={{ color: "#4D423A" }}>
                    {g._id} <span className="ml-2 text-gray-500 text-sm">({filteredItems.length})</span>
                  </div>
                </div>
                <div className="divide-y">
                  {filteredItems.map(a => (
                    <div key={a._id} className="px-4 py-2 grid grid-cols-12 items-center gap-3">
                      <div className="col-span-3">
                        <div className="font-medium" style={{ color: "#000000" }}>
                          {format(new Date(a.startTime), "PPp")}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm" style={{ color: "#4D423A" }}>Customer: {a.customer?.name||"-"}</div>
                        <div className="text-xs text-gray-500">{a.customer?.email||""}</div>
                        <div className="text-xs text-gray-500">Payment: {a.isPaid?"Paid":"Not Paid"}</div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm" style={{ color: "#4D423A" }}>Services: {a.serviceNames?.join(",")||"-"}</div>
                      </div>
                      <div className="col-span-3">
                        <select
                          className="w-full border rounded px-2 py-2"
                          value={a.status}
                          onChange={e => onStatusChange(a._id, e.target.value)}
                          style={{ borderColor:"#FBAA99", backgroundColor:"#FFFFFF", color:"#4D423A" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="started">Started</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

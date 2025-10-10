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
  const [filterStatus, setFilterStatus] = useState(""); // "" = show all, "pending"/"started"/"completed" = filtered

  // Load appointments and calculate stats
  async function load() {
    const data = await api.adminGrouped("date"); // always grouped by date
    if (!data?.success) return toast.error(data?.message || "Failed to load appointments");

    setGroups(data.groups || []);

    // Calculate stats for today
    let total = 0, pending = 0, started = 0, completed = 0;
    (data.groups || []).forEach((g) => {
      g.items.forEach((a) => {
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

  const onStatusChange = async (apptId, status) => {
    const res = await api.updateStatus(apptId, status); // API endpoint must handle this
    if (!res.success) return toast.error(res.message || "Failed to update status");
    load(); // refresh stats and list
  };

  // Helper to filter items by status
  const filterItemsByStatus = (items) => {
    if (!filterStatus) return items;
    return items.filter((a) => a.status === filterStatus);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Header with Filter Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        <div className="ml-auto flex gap-2">
          {["pending", "started", "completed"].map((k) => (
            <button
              key={k}
              onClick={() => setFilterStatus(filterStatus === k ? "" : k)} // toggle filter
              className={`px-3 py-1.5 rounded-full border transition ${
                filterStatus === k
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top Tiles with Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Today", value: stats.total, color: "#333" },
          { label: "Pending", value: stats.pending, color: "#FF9900" },
          { label: "Started", value: stats.started, color: "#0077CC" },
          { label: "Completed", value: stats.completed, color: "#00AA66" },
        ].map((t, idx) => (
          <div
            key={idx}
            className="rounded-xl p-4 border shadow-sm bg-white"
          >
            <div className="text-lg font-semibold" style={{ color: t.color }}>
              {t.label}
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{t.value}</div>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      {groups.length === 0 ? (
        <div className="text-gray-600">No appointments.</div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const filteredItems = filterItemsByStatus(g.items);
            if (filteredItems.length === 0) return null; // hide group if no items after filter
            return (
              <section
                key={g._id}
                className="border rounded-lg bg-white shadow-sm"
              >
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <div className="font-medium text-gray-800">
                    {g._id} <span className="ml-2 text-gray-500 text-sm">({filteredItems.length})</span>
                  </div>
                </div>
                <div className="divide-y">
                  {filteredItems.map((a) => (
                    <div
                      key={a._id}
                      className="px-4 py-2 grid grid-cols-12 items-center gap-3"
                    >
                      {/* Date & Time */}
                      <div className="col-span-3">
                        <div className="font-medium">{format(new Date(a.startTime), "PPp")}</div>
                      </div>

                      {/* Customer Info */}
                      <div className="col-span-3">
                        <div className="text-sm">Customer: {a.customer?.name || "-"}</div>
                        <div className="text-xs text-gray-500">{a.customer?.email || ""}</div>
                        <div className="text-xs text-gray-500">
                          Payment: {a.isPaid ? "Paid" : "Not Paid"}
                        </div>
                      </div>

                      {/* Services/Package */}
                      <div className="col-span-3">
                        <div className="text-sm">
                          Services: {a.serviceNames?.join(", ") || "-"}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="col-span-3">
                        <select
                          className="w-full border rounded px-2 py-2"
                          value={a.status}
                          onChange={(e) => onStatusChange(a._id, e.target.value)}
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

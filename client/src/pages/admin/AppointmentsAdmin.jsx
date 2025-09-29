import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { toast } from "react-toastify";
import { format } from "date-fns";

const JOB_FOR_CATEGORY = {
  Hair: "Hair dresser",
  Nails: "Nail Artist",
  Makeup: "Makeup Artist",
  Facials: "Facial Artist",
  Other: "",
};

export default function AppointmentsAdmin() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);

  const [by, setBy] = useState("date"); 
  const [groups, setGroups] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  async function load() {
    const data = await api.adminGrouped(by);
    if (!data?.success) return toast.error(data?.message || "Failed to load appointments");
    setGroups(data.groups || []);

    // calculate stats
    let total = 0, completed = 0, pending = 0;
    (data.groups || []).forEach((g) => {
      g.items.forEach((a) => {
        total++;
        if (a.status === "completed") completed++;
        if (a.status === "pending") pending++;
      });
    });
    setStats({ total, completed, pending });
  }

  async function loadStaff() {
    const res = await fetch(`${backendUrl}/api/admin/staff`, { credentials: "include" });
    const data = await res.json();
    if (data.success) setStaff(data.staff || []);
  }

  useEffect(() => { loadStaff(); }, [backendUrl]);
  useEffect(() => { load(); }, [by]);

  const assignableForCategory = (category) => {
    const job = JOB_FOR_CATEGORY[category] || "";
    return staff.filter((s) => s.jobTitle === job && s.status === "active");
  };

  const onAssign = async (apptId, staffId) => {
    const r = await api.assignStaff(apptId, staffId);
    if (!r.success) return toast.error(r.message || "Assign failed");
    toast.success("Staff assigned");
    load();
  };

  return (
    <div 
      className="min-h-screen p-6" 
      style={{ 
        background: "linear-gradient(135deg, #FEF4F1, #FBAA99)", 
      }}
    >
      {/* Header with Filter Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-[#4D423A]">Appointments</h1>
        <div className="ml-auto flex gap-2">
          {["date", "type", "assignment"].map((k) => (
            <button
              key={k}
              onClick={() => setBy(k)}
              className={`px-3 py-1.5 rounded-full border transition ${
                by === k 
                  ? "bg-[#FBAA99] text-white border-[#FBAA99]" 
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              {k === "date" ? "Date" : k === "type" ? "Service Type" : "Assignment"}
            </button>
          ))}
        </div>
      </div>

      {/* Glass Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Appointments", value: stats.total, color: "#4D423A" },
          { label: "Completed", value: stats.completed, color: "#000000" },
          { label: "Pending", value: stats.pending, color: "#FBAA99" },
        ].map((t, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 shadow-lg backdrop-blur-lg border border-white/30"
            style={{
              background: "rgba(255,255,255,0.25)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
            }}
          >
            <div className="text-lg font-semibold" style={{ color: t.color }}>
              {t.label}
            </div>
            <div className="text-3xl font-bold mt-2 text-[#4D423A]">
              {t.value}
            </div>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      {groups.length === 0 ? (
        <div className="text-gray-600">No appointments.</div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g._id} className="border rounded-xl bg-white/70 backdrop-blur-md shadow-md">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-medium text-[#4D423A]">
                  {g._id} <span className="ml-2 text-gray-500 text-sm">({g.count})</span>
                </div>
              </div>
              <div className="divide-y">
                {g.items.map((a) => (
                  <div key={a._id} className="px-4 py-3 grid grid-cols-12 items-center gap-3">
                    <div className="col-span-3">
                      <div className="font-medium">{format(new Date(a.startTime), "PPp")}</div>
                      <div className="text-xs text-gray-500">{a.serviceNames?.join(", ")}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm">Customer: {a.customer?.name || "-"}</div>
                      <div className="text-xs text-gray-500">{a.customer?.email || ""}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">Type: {a.serviceCategory || "-"}</div>
                      <div className="text-xs text-gray-500">Status: {a.status}</div>
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          className="w-full border rounded-lg px-2 py-2"
                          value={a.staff?._id || ""}
                          onChange={(e) => onAssign(a._id, e.target.value)}
                        >
                          <option value="">— Assign staff —</option>
                          {assignableForCategory(a.serviceCategory).map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.jobTitle})
                            </option>
                          ))}
                        </select>
                      </div>
                      {a.staff?._id && (
                        <span className="text-xs text-gray-600">Assigned to {a.staff.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

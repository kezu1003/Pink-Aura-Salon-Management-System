import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function AdminCalendar() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [items, setItems] = useState([]);

  async function load() {
    const from = new Date(date + "T00:00:00Z").toISOString();
    const to = new Date(date + "T23:59:59Z").toISOString();
    const { success, appointments } = await api.adminList({ from, to });
    if (success) setItems(appointments || []);
  }
  useEffect(() => { load(); }, [date]);

  const markPaid = async (id) => {
    const { success, appointment, message } = await api.markPaid(id);
    if (!success) return toast.error(message || "Failed");
    toast.success("Marked paid & confirmed");
    load();
  };

  return (
    <div className="pt-28 max-w-6xl mx-auto px-4 pb-16">
      <h1 className="text-3xl font-serif mb-6">Appointments — {date}</h1>
      <div className="mb-4">
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="border rounded-lg px-3 py-2" />
      </div>
      <div className="space-y-3">
        {items.map(a => (
          <div key={a._id} className="p-4 rounded-2xl border bg-white flex items-center justify-between">
            <div>
              <div className="font-semibold">
                {format(new Date(a.startTime), "p")} – {format(new Date(a.endTime), "p")} · {a.customer?.name}
              </div>
              <div className="text-sm text-gray-600">
                {a.services?.map(s=>s.name).join(", ")} · Staff: {a.staff?.name || "Any"} · Status: {a.status} · Pay: {a.paymentStatus}
              </div>
            </div>
            {a.status === "pending" && (
              <button onClick={() => markPaid(a._id)} className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:opacity-90">
                Mark Paid & Confirm
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-gray-500">No appointments.</div>}
      </div>
    </div>
  );
}

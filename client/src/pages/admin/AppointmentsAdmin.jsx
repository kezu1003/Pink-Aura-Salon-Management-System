import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function AppointmentsAdmin() {
  const { backendUrl } = useContext(AppContext);
  const [filters, setFilters] = useState({ from: "", to: "", staffId: "", serviceId: "", status: "" });
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [sv, st] = await Promise.all([
          axios.get(`${backendUrl}/api/services`),
          axios.get(`${backendUrl}/api/admin/staff`),
        ]);
        setServices(sv.data.services || []);
        setStaff(st.data.staff || []);
      } catch {}
    })();
    load();
  }, []);

  async function load() {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    const { data } = await axios.get(`${backendUrl}/api/admin/appointments?${qs.toString()}`);
    setRows(data.appointments || []);
  }

  async function assign(id, newStaffId) {
    if (!newStaffId) return;
    await axios.patch(`${backendUrl}/api/appointments/${id}`, { staffId: newStaffId });
    toast.success("Assigned");
    load();
  }

  async function reschedule(id) {
    const iso = prompt("Enter new start ISO (e.g., 2025-12-20T11:00:00.000Z):");
    if (!iso) return;
    try {
      await axios.patch(`${backendUrl}/api/appointments/${id}`, { startTime: iso });
      toast.success("Rescheduled");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  async function cancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    await axios.delete(`${backendUrl}/api/appointments/${id}`);
    toast.success("Cancelled");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
        <div className="text-lg font-semibold mb-3">All Appointments</div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs">From</label>
            <input type="date" className="border rounded p-2" value={filters.from}
                   onChange={(e)=>setFilters({...filters, from:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs">To</label>
            <input type="date" className="border rounded p-2" value={filters.to}
                   onChange={(e)=>setFilters({...filters, to:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs">Service</label>
            <select className="border rounded p-2" value={filters.serviceId}
                    onChange={(e)=>setFilters({...filters, serviceId:e.target.value})}>
              <option value="">All</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Staff</label>
            <select className="border rounded p-2" value={filters.staffId}
                    onChange={(e)=>setFilters({...filters, staffId:e.target.value})}>
              <option value="">All</option>
              {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Status</label>
            <select className="border rounded p-2" value={filters.status}
                    onChange={(e)=>setFilters({...filters, status:e.target.value})}>
              <option value="">Any</option>
              {["booked","confirmed","rescheduled","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={load}>Apply</button>
        </div>
      </div>

      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-black/60">
            <tr>
              <th className="p-2 text-left">Date/Time</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Staff</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{new Date(r.startTime).toLocaleString()}</td>
                <td className="p-2">{r.customer?.name || r.customer?.email}</td>
                <td className="p-2">{r.service?.name}</td>
                <td className="p-2">{r.staff?.name}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 flex gap-2">
                  <select className="border rounded p-1" defaultValue="" onChange={(e)=>assign(r._id, e.target.value)}>
                    <option value="" disabled>Assign…</option>
                    {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <button className="px-3 py-1 rounded border" onClick={()=>reschedule(r._id)}>Reschedule</button>
                  <button className="px-3 py-1 rounded border text-red-600" onClick={()=>cancel(r._id)}>Cancel</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={6}>No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

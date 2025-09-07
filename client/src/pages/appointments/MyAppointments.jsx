import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function MyAppointments() {
  const { backendUrl } = useContext(AppContext);
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await axios.get(`${backendUrl}/api/appointments/me`);
    setRows(data.appointments || []);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    await axios.delete(`${backendUrl}/api/appointments/${id}`);
    toast.success("Cancelled");
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

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4">
      <div className="text-xl font-semibold mb-3">My Appointments</div>
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-black/60">
            <tr>
              <th className="p-2 text-left">Date/Time</th>
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
                <td className="p-2">{r.service?.name}</td>
                <td className="p-2">{r.staff?.name}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-3 py-1 rounded border" onClick={()=>reschedule(r._id)}>Reschedule</button>
                  <button className="px-3 py-1 rounded border text-red-600" onClick={()=>cancel(r._id)}>Cancel</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={5}>No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

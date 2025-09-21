import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4">
      <div className="text-xs text-black/60">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
    </div>
  );
}

export default function AppointmentReports() {
  const { backendUrl } = useContext(AppContext);
  const [filters, setFilters] = useState({ from: "", to: "", staffId: "", serviceId: "" });
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [st, sv] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/staff`),
          axios.get(`${backendUrl}/api/services`),
        ]);
        setStaff(st.data.staff || []);
        setServices(sv.data.services || []);
      } catch {
       
      }
    })();
  }, [backendUrl]);

  async function load() {
    try {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      const { data } = await axios.get(`${backendUrl}/api/admin/appointment-reports/overview?` + qs.toString());
      if (!data.success) throw new Error(data.message || "Failed");
      setReport(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load report");
    }
  }

  useEffect(() => { load(); }, []); // initial

  function downloadCSV() {
    if (!report) return;
    const lines = [];
    const t = report.totals || {};
    lines.push("Totals");
    lines.push("Metric,Count");
    ["total","booked","confirmed","rescheduled","completed","cancelled"].forEach(k => lines.push(`${k},${t[k] || 0}`));
    lines.push("");

    lines.push("Top Services");
    lines.push("Service,Count");
    (report.topServices || []).forEach(s => lines.push(`${s.serviceName || s.serviceId},${s.count}`));
    lines.push("");

    lines.push("By Staff");
    lines.push("Staff,Total,Booked,Confirmed,Rescheduled,Completed,Cancelled,Top Services");
    (report.byStaff || []).forEach(s => {
      const st = s.statuses || {};
      const top = (s.services || []).slice().sort((a,b)=>b.count-a.count).slice(0,3)
        .map(x => `${x.serviceName || x.serviceId} (${x.count})`).join("; ");
      lines.push(`${s.staffName || s.staffId},${s.total || 0},${st.booked || 0},${st.confirmed || 0},${st.rescheduled || 0},${st.completed || 0},${st.cancelled || 0},${top}`);
    });
    lines.push("");

    lines.push("Peak Hours");
    lines.push("Hour,Count");
    (report.peak?.hours || []).forEach(h => lines.push(`${h.hour},${h.count}`));
    lines.push("");

    lines.push("Peak Days (1=Sun..7=Sat)");
    lines.push("Day,Count");
    (report.peak?.days || []).forEach(d => lines.push(`${d.day},${d.count}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments_overview.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    try {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      const url = `${backendUrl}/api/admin/appointment-reports/overview.pdf?${qs.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "appointment_report.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error(e.message || "PDF export failed");
    }
  }

  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-lg font-semibold text-black">Appointment Reports</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-black/60">From</label>
            <input type="date" className="rounded-xl border border-black/10 p-2"
                   value={filters.from} onChange={e=>setFilters({...filters, from:e.target.value})}/>
          </div>
          <div>
            <label className="block text-xs text-black/60">To</label>
            <input type="date" className="rounded-xl border border-black/10 p-2"
                   value={filters.to} onChange={e=>setFilters({...filters, to:e.target.value})}/>
          </div>
          <div>
            <label className="block text-xs text-black/60">Service</label>
            <select className="rounded-xl border border-black/10 p-2"
                    value={filters.serviceId} onChange={e=>setFilters({...filters, serviceId:e.target.value})}>
              <option value="">All</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-black/60">Staff</label>
            <select className="rounded-xl border border-black/10 p-2"
                    value={filters.staffId} onChange={e=>setFilters({...filters, staffId:e.target.value})}>
              <option value="">All</option>
              {staff.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
            </select>
          </div>
          <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" onClick={load}>Generate</button>
          <button className="rounded-xl border border-black/10 px-4 py-2 text-black hover:bg-pink-50" onClick={downloadCSV}>Download CSV</button>
          <button className="rounded-xl border border-black/10 px-4 py-2 text-black hover:bg-pink-50" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>

      {!report ? (
        <div className="text-sm text-gray-500">No data yet.</div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <Stat label="Total"       value={report.totals.total} />
            <Stat label="Booked"      value={report.totals.booked} />
            <Stat label="Confirmed"   value={report.totals.confirmed} />
            <Stat label="Rescheduled" value={report.totals.rescheduled} />
            <Stat label="Completed"   value={report.totals.completed} />
            <Stat label="Cancelled"   value={report.totals.cancelled} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Services */}
            <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-medium text-black">Most-Booked Services</div>
              <table className="w-full text-sm">
                <thead className="text-black/60">
                  <tr><th className="p-2 text-left">Service</th><th className="p-2 text-left">Count</th></tr>
                </thead>
                <tbody>
                  {(report.topServices || []).map(s => (
                    <tr key={s.serviceId} className="border-t">
                      <td className="p-2">{s.serviceName || s.serviceId}</td>
                      <td className="p-2">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Peaks */}
            <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-medium text-black">Peak Hours / Days</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="mb-1 text-xs text-black/60">Top Hours</div>
                  <ul className="list-disc pl-5">
                    {(report.peak?.topHours || []).map((h,i) => <li key={i}>{h.hour}:00 — {h.count}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-xs text-black/60">Top Days</div>
                  <ul className="list-disc pl-5">
                    {(report.peak?.topDays || []).map((d,i) => <li key={i}>{dayNames[d.day % 7]} — {d.count}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* By Staff */}
          <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
            <div className="mb-2 font-medium text-black">Appointments by Staff</div>
            <table className="w-full text-sm">
              <thead className="text-black/60">
                <tr>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Booked</th>
                  <th className="p-2 text-left">Confirmed</th>
                  <th className="p-2 text-left">Rescheduled</th>
                  <th className="p-2 text-left">Completed</th>
                  <th className="p-2 text-left">Cancelled</th>
                  <th className="p-2 text-left">Top Services</th>
                </tr>
              </thead>
              <tbody>
                {(report.byStaff || []).map((s) => {
                  const st = s.statuses || {};
                  const top = (s.services || []).slice().sort((a,b)=>b.count-a.count).slice(0,3)
                    .map(x => `${x.serviceName || x.serviceId} (${x.count})`).join(", ");
                  return (
                    <tr key={s.staffId} className="border-t">
                      <td className="p-2">{s.staffName || s.staffId}</td>
                      <td className="p-2">{s.total || 0}</td>
                      <td className="p-2">{st.booked || 0}</td>
                      <td className="p-2">{st.confirmed || 0}</td>
                      <td className="p-2">{st.rescheduled || 0}</td>
                      <td className="p-2">{st.completed || 0}</td>
                      <td className="p-2">{st.cancelled || 0}</td>
                      <td className="p-2">{top || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

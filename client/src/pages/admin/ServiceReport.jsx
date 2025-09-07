import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function ServiceReport() {
  const { backendUrl } = useContext(AppContext);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  async function run() {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/services/report/monthly-usage?year=${year}&month=${month}`,
        { withCredentials: true }
      );
      if (data.success) setData(data);
      else toast.error(data.message || "Failed to generate report");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); }, []); 

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Monthly Services Usage</h2>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-3 py-2 rounded border">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
            ))}
          </select>
          <input
            type="number"
            className="px-3 py-2 rounded border w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <button onClick={run} className="px-4 py-2 rounded bg-pink-500 text-white hover:opacity-90">
            Generate
          </button>
        </div>
      </header>

      {loading ? (
        <div className="p-6 text-gray-500">Loading…</div>
      ) : !data ? null : (
        <>
          {/* KPI cards */}

          <div className="grid sm:grid-cols-3 gap-4">
            <KPI title="Total Appointments" value={data.summary?.totalAppointments ?? 0} />
            <KPI title="Completed" value={data.summary?.completed ?? 0} />
            <KPI title="Canceled" value={data.summary?.canceled ?? 0} />
          </div>

          {/* By Category table */}

          <section>
            <h3 className="font-semibold mb-2">By Category</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Count</th>
                    <th className="text-left p-3">Est. Revenue (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byCategory?.length ? data.byCategory.map((r) => (
                    <tr key={r.category} className="border-t">
                      <td className="p-3">{r.category}</td>
                      <td className="p-3">{r.count}</td>
                      <td className="p-3">{Math.round(r.estRevenue).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="3" className="p-4 text-center text-gray-500">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top services */}
          
          <section>
            <h3 className="font-semibold mb-2">Top Services</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="text-left p-3">Service</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Count</th>
                    <th className="text-left p-3">Est. Revenue (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices?.length ? data.topServices.map((r) => (
                    <tr key={r.serviceId} className="border-t">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.category}</td>
                      <td className="p-3">{r.count}</td>
                      <td className="p-3">{Math.round(r.estRevenue).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="p-4 text-center text-gray-500">No data</td></tr>}
                </tbody>
              </table>
            </div>
            {data.note && <p className="text-sm text-gray-500 mt-2">Note: {data.note}</p>}
          </section>
        </>
      )}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value?.toLocaleString?.() ?? value}</div>
    </div>
  );
}

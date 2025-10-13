import { useContext, useEffect, useMemo, useState } from "react";
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
  const [statusCsv, setStatusCsv] = useState("completed,booked");

  // sorting controls
  const [categorySortBy, setCategorySortBy] = useState("count"); // count | revenue | name
  const [categorySortDir, setCategorySortDir] = useState("desc"); // asc | desc
  const [topSortBy, setTopSortBy] = useState("count"); // count | revenue | name
  const [topSortDir, setTopSortDir] = useState("desc"); // asc | desc

  async function run() {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/services/report/monthly-usage?year=${year}&month=${month}&status=${encodeURIComponent(
          statusCsv
        )}`,
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

  const openPdf = () => {
    const qs = new URLSearchParams({ year: String(year), month: String(month), status: statusCsv }).toString();
    window.open(`${backendUrl}/api/reports/services/monthly/pdf?${qs}`, "_blank");
  };

  // derived sorted data
  const sortedByCategory = useMemo(() => {
    if (!data?.byCategory) return [];
    const cloned = [...data.byCategory];
    cloned.sort((a, b) => {
      let av, bv;
      if (categorySortBy === "name") { av = a.category?.toString()?.toLowerCase() || ""; bv = b.category?.toString()?.toLowerCase() || ""; }
      else if (categorySortBy === "revenue") { av = a.estRevenue || 0; bv = b.estRevenue || 0; }
      else { av = a.count || 0; bv = b.count || 0; }
      if (av < bv) return categorySortDir === "asc" ? -1 : 1;
      if (av > bv) return categorySortDir === "asc" ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [data, categorySortBy, categorySortDir]);

  const sortedTopServices = useMemo(() => {
    if (!data?.topServices) return [];
    const cloned = [...data.topServices];
    cloned.sort((a, b) => {
      let av, bv;
      if (topSortBy === "name") { av = a.name?.toString()?.toLowerCase() || ""; bv = b.name?.toString()?.toLowerCase() || ""; }
      else if (topSortBy === "revenue") { av = a.estRevenue || 0; bv = b.estRevenue || 0; }
      else { av = a.count || 0; bv = b.count || 0; }
      if (av < bv) return topSortDir === "asc" ? -1 : 1;
      if (av > bv) return topSortDir === "asc" ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [data, topSortBy, topSortDir]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] via-white to-[#FEF4F1] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FBAA99]"></span>
              <span className="text-[#4D423A] font-bold">Service Reports</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Monthly Services Usage
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
              Track monthly usage, revenue estimates and top-performing services
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6 mb-8">
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-[#4D423A]/70 mb-1">Month</label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border-2 border-[#FEF4F1]">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#4D423A]/70 mb-1">Year</label>
                <input type="number" className="w-full px-3 py-2 rounded-xl border-2 border-[#FEF4F1]" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#4D423A]/70 mb-1">Statuses</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border-2 border-[#FEF4F1]" value={statusCsv} onChange={(e) => setStatusCsv(e.target.value)} placeholder="completed,booked" />
                <p className="text-xs text-[#4D423A]/60 mt-1">Comma-separated: completed, booked, confirmed, pending, cancelled</p>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={run} className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white font-medium hover:opacity-90">Generate</button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 justify-end">
              <button onClick={openPdf} className="px-5 py-2.5 rounded-full bg-[#4D423A] text-white hover:opacity-90">Download PDF</button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-[#4D423A]/70">Loading…</div>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">By Category</h3>
              <div className="flex items-center gap-2 text-sm">
                <select value={categorySortBy} onChange={(e) => setCategorySortBy(e.target.value)} className="px-2 py-1 border rounded">
                  <option value="count">Sort: Count</option>
                  <option value="revenue">Sort: Revenue</option>
                  <option value="name">Sort: Name</option>
                </select>
                <select value={categorySortDir} onChange={(e) => setCategorySortDir(e.target.value)} className="px-2 py-1 border rounded">
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
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
                  {sortedByCategory?.length ? sortedByCategory.map((r) => (
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Top Services</h3>
              <div className="flex items-center gap-2 text-sm">
                <select value={topSortBy} onChange={(e) => setTopSortBy(e.target.value)} className="px-2 py-1 border rounded">
                  <option value="count">Sort: Count</option>
                  <option value="revenue">Sort: Revenue</option>
                  <option value="name">Sort: Name</option>
                </select>
                <select value={topSortDir} onChange={(e) => setTopSortDir(e.target.value)} className="px-2 py-1 border rounded">
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
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
                  {sortedTopServices?.length ? sortedTopServices.map((r) => (
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

          <div className="mt-16 text-center text-xs text-[#4D423A]/60">
            © {new Date().getFullYear()} Pink Aura — Service Reports
          </div>
        </div>
      </div>
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

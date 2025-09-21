import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

function yyyymm(today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  return { y, m };
}

export default function ServiceReports() {
  const { backendUrl } = useContext(AppContext);
  const { y, m } = useMemo(() => yyyymm(), []);
  const [year, setYear] = useState(y);
  const [month, setMonth] = useState(m);
  const [status, setStatus] = useState("completed,confirmed");

  const downloadPdf = () => {
    if (!year || !month) return toast.error("Choose a year and month");
    const qs = new URLSearchParams({ year, month, status }).toString();
    window.open(`${backendUrl}/api/reports/services/monthly/pdf?${qs}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Service & Package — Monthly Report</h2>
      </header>

      <div className="p-4 border rounded-xl bg-white">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border rounded px-3 py-2"
              min="2022"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => (
                <option key={mm} value={mm}>
                  {mm.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Statuses</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="completed,confirmed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated: completed,confirmed,pending,cancelled
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={downloadPdf}
            className="px-5 py-2.5 rounded-full bg-pink-600 text-white hover:bg-pink-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        The PDF includes KPIs, charts, tables, customer insights, and recommendations.
      </p>
    </div>
  );
}

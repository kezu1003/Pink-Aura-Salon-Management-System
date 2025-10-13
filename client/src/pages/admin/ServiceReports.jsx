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
    <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] via-white to-[#FEF4F1] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FBAA99]"></span>
              <span className="text-[#4D423A] font-bold">Service & Package Reports</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Monthly Report (PDF)
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
              Export detailed monthly reports with KPIs, charts and insights
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-[#4D423A]/70 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border-2 border-[#FEF4F1] rounded-xl px-3 py-2"
                  min="2022"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4D423A]/70 mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border-2 border-[#FEF4F1] rounded-xl px-3 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => (
                    <option key={mm} value={mm}>
                      {mm.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#4D423A]/70 mb-1">Statuses</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border-2 border-[#FEF4F1] rounded-xl px-3 py-2"
                  placeholder="completed,confirmed"
                />
                <p className="text-xs text-[#4D423A]/60 mt-1">
                  Comma-separated: completed, confirmed, pending, cancelled
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={downloadPdf}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white font-semibold hover:opacity-90"
              >
                Download PDF
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#4D423A]/60 text-center">
            The PDF includes KPIs, charts, tables, customer insights, and recommendations.
          </p>

          <div className="mt-16 text-center text-xs text-[#4D423A]/60">
            © {new Date().getFullYear()} Pink Aura — Service Reports
          </div>
        </div>
      </div>
    </div>
  );
}

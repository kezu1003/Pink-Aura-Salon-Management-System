import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { format } from "date-fns";
import { toast } from "react-toastify";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function MyAppointments() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);
  const [items, setItems] = useState([]);
  const [sortOrder, setSortOrder] = useState("new-to-old"); // default sort

  async function load() {
    const { success, appointments, message } = await api.mine({});
    if (!success) {
      toast.error(message || "Failed to load appointments");
      return;
    }
    setItems(appointments || []);
  }

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    const { success, message } = await api.cancel(id);
    if (!success) return toast.error(message || "Failed");
    toast.success("Cancelled");
    load();
  };

  const isPackageAppt = (a) =>
    (Array.isArray(a?.services) && a.services.length > 1) ||
    /^Booked package:\s*/i.test(a?.notes || "");

  const getPackageName = (a) => {
    const m = (a?.notes || "").match(/^Booked package:\s*(.+)$/i);
    return m ? m[1] : null;
  };

  const serviceNames = (a) =>
    Array.isArray(a?.services)
      ? a.services.map((s) => s?.name || "").filter(Boolean)
      : [];

  return (
    <div
      className="bg-[#FEF4F1] min-h-screen relative"
      style={{
        backgroundImage: "url('/back001.jpg')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <Navbar />

      {/* Spacer between navbar and heading */}
      <div className="h-32 md:h-40 relative z-10" />

      <div className="max-w-5xl mx-auto px-4 pb-16 relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-6 text-[#FEF4F1] drop-shadow-lg">
          My Appointments
        </h1>

        {/* Sort button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() =>
              setSortOrder(sortOrder === "new-to-old" ? "old-to-new" : "new-to-old")
            }
            className="px-6 py-2 rounded-full text-white font-medium shadow-lg transition
                       bg-[#FBAA99] hover:bg-[#F68B78] hover:scale-105 transform"
          >
            {sortOrder === "new-to-old" ? "Sort: New → Old" : "Sort: Old → New"}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-300 text-lg">No appointments yet.</div>
        ) : (
          <div className="space-y-6">
            {[...items]
              .sort((a, b) => {
                const aTime = new Date(a.date + " " + a.startTime).getTime();
                const bTime = new Date(b.date + " " + b.startTime).getTime();
                return sortOrder === "new-to-old" ? bTime - aTime : aTime - bTime;
              })
              .map((a) => {
                const pkg = isPackageAppt(a);
                const pkgName = getPackageName(a);
                const names = serviceNames(a);

                return (
                  <div
                    key={a._id}
                    className="p-6 rounded-2xl border bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                               transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-[#FFF0E5]"
                  >
                    <div>
                      {/* Title */}
                      <div className="font-semibold flex items-center gap-2 text-[#4D423A] text-lg">
                        {pkg ? (
                          <>
                            <span>Package{pkgName ? `: ${pkgName}` : ""}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                              PACKAGE
                            </span>
                          </>
                        ) : (
                          <span>{names.join(", ") || "—"}</span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {a.date} &middot; {format(new Date(a.startTime), "p")} –{" "}
                        {format(new Date(a.endTime), "p")}
                      </div>

                      {pkg && names.length > 0 && (
                        <div className="mt-1 text-xs text-gray-600">
                          Includes: {names.join(", ")}
                        </div>
                      )}

                      <div className="mt-1 text-xs">
                        Staff: {a.staff ? a.staff.name : "Any"} &middot; Status:{" "}
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${
                            a.status === "pending"
                              ? "bg-yellow-500"
                              : a.status === "confirmed"
                              ? "bg-green-600"
                              : a.status === "cancelled"
                              ? "bg-gray-500"
                              : "bg-pink-600"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {a.status !== "cancelled" && (
                      <button
                        onClick={() => cancel(a._id)}
                        className="px-4 py-2 rounded-full border border-[#FBAA99] text-[#FBAA99] font-medium transition
                                   hover:bg-[#FBAA99] hover:text-white hover:scale-105 transform"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

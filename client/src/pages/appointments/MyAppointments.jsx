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
    Array.isArray(a?.services) ? a.services.map((s) => s?.name || "").filter(Boolean) : [];

  return (
    <div className="bg-[#FEF4F1] min-h-screen">
     
      <Navbar />
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <h1 className="text-3xl font-serif mb-6">My Appointments</h1>

        {items.length === 0 ? (
          <div className="text-gray-500">No appointments yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((a) => {
              const pkg = isPackageAppt(a);
              const pkgName = getPackageName(a);
              const names = serviceNames(a);

              return (
                <div
                  key={a._id}
                  className="p-4 rounded-2xl border bg-white flex items-center justify-between"
                >
                  <div>
                    {/* Title */}
                    <div className="font-semibold flex items-center gap-2">
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

                    <div className="text-sm text-gray-600">
                      {a.date} &middot; {format(new Date(a.startTime), "p")} –{" "}
                      {format(new Date(a.endTime), "p")}
                    </div>

                    {pkg && names.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">Includes: {names.join(", ")}</div>
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
                      className="px-4 py-2 rounded-lg border hover:bg-pink-50"
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

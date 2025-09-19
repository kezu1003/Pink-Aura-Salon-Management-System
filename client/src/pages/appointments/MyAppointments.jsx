import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function MyAppointments() {

  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);
  const [items, setItems] = useState([]);

  async function load() {
    const { success, appointments } = await api.mine({});
    if (success) setItems(appointments || []);
  }

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    const { success, message } = await api.cancel(id);
    if (!success) return toast.error(message || "Failed");
    toast.success("Cancelled");
    load();
  };

  return (
    <div className="max-w-5xl mx-auto pt-28 px-4 pb-16">
      <h1 className="text-3xl font-serif mb-6">My Appointments</h1>
      {items.length === 0 ? (
        <div className="text-gray-500">No appointments yet.</div>
      ) : (
        <div className="space-y-4">
        {items.map((a) => (

        <div key={a._id} className="p-4 rounded-2xl border bg-white flex items-center justify-between">
              <div>

                <div className="font-semibold">{a.services?.map(s => s.name).join(", ")}</div>
                <div className="text-sm text-gray-600">
                  {a.date} &middot; {format(new Date(a.startTime), "p")} – {format(new Date(a.endTime), "p")}

                </div>

                <div className="mt-1 text-xs">
                  Staff: {a.staff ? a.staff.name : "Any"} &middot; Status:{" "}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${
                    a.status === "pending" ? "bg-yellow-500" :
                    a.status === "confirmed" ? "bg-green-600" :
                    a.status === "cancelled" ? "bg-gray-500" : "bg-pink-600"
                  }`}>
                    {a.status}

                  </span>

                </div>

              </div>

              {a.status !== "cancelled" && (
                <button onClick={() => cancel(a._id)} className="px-4 py-2 rounded-lg border hover:bg-pink-50">
                  Cancel
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
    
  );
}

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function BookAppointment() {
  const { backendUrl } = useContext(AppContext);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${backendUrl}/api/services`);
      setServices(data.services || []);
      if (data.services?.[0]?._id) setServiceId(data.services[0]._id);
    })();
  }, []);

  useEffect(() => {
    if (!serviceId || !date) return;
    (async () => {
      const qs = new URLSearchParams({ serviceId, date });
      const { data } = await axios.get(`${backendUrl}/api/appointments/availability?${qs.toString()}`);
      if (data.success) setAvailability(data.availability || []); else setAvailability([]);
    })();
  }, [serviceId, date]);

  async function book(staffId, start) {
    try {
      const { data } = await axios.post(`${backendUrl}/api/appointments`, { serviceId, staffId, startTime: start });
      if (data.success) toast.success("Booked!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 space-y-4">
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
        <div className="font-semibold mb-2">Book an appointment</div>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-xs">Service</label>
            <select className="border rounded p-2" value={serviceId} onChange={(e)=>setServiceId(e.target.value)}>
              {services.map(s=> <option key={s._id} value={s._id}>{s.name} ({s.durationMins}m)</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs">Date</label>
            <input type="date" className="border rounded p-2" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
        <div className="font-medium mb-2">Available Slots</div>
        {!availability.length && <div className="text-sm text-gray-500">No staff available for this selection.</div>}
        <div className="space-y-4">
          {availability.map((item) => (
            <div key={item.staff.id} className="border rounded-xl p-3">
              <div className="font-medium mb-2">{item.staff.name}</div>
              <div className="flex flex-wrap gap-2">
                {item.slots.map((s) => (
                  <button key={s.start}
                          className="px-3 py-1 rounded border hover:bg-pink-50"
                          onClick={()=>book(item.staff.id, s.start)}>
                    {new Date(s.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { makeApi } from "../../api/appointments";
import { format } from "date-fns";
import SlotGrid from "../../components/appointments/SlotGrid";
import Calendar from "../../components/appointments/Calendar";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Book() {
  const { backendUrl, userData } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFromQuery = searchParams.get("service"); 

  // Load services once, then auto-select from query if present

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/services?activeOnly=true`);
        const list = data?.services || [];
        setServices(list);

        if (list.length) {
          // If a valid ?service=id is provided, prefer it
          if (serviceFromQuery && list.some(s => s._id === serviceFromQuery)) {
            setServiceId(serviceFromQuery);
          } else {
            setServiceId(list[0]._id);
          }
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Failed to load services");
      }
    })();
  }, [backendUrl, serviceFromQuery]);

  // Load slots whenever service/date changes
  useEffect(() => {
    if (!serviceId || !date) return;
    setLoading(true);
    api
      .slots({ serviceId, date })
      .then(({ success, slots, message }) => {
        if (!success) {
          toast.error(message || "Failed to load slots");
          setSlots([]);
          return;
        }
        setSlots(slots || []);
        setPicked(null); // reset selected time when inputs change
      })
      .finally(() => setLoading(false));
  }, [serviceId, date, api]);

  const onConfirm = async () => {
    if (!userData) {
      toast.info("Please login to book an appointment.");
      return navigate("/login");
    }
    if (!picked) return toast.info("Pick a time");

    const body = {
      serviceIds: [serviceId],
      date,
      start: picked.start,
      paymentMode: "online", // stays PENDING until paid
    };

    const { success, appointment, message } = await api.create(body);
    if (!success) return toast.error(message || "Failed to create appointment");

    toast.success("Appointment created. Complete payment to confirm.");
    navigate("/appointments/mine");
  };

  return (
    <div className="max-w-6xl mx-auto pt-28 px-4 pb-16">
      <h1 className="text-3xl md:text-4xl font-serif text-center mb-10">
        Book Your Appointment
      </h1>

    
      {services.length > 0 && (
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-sm font-medium mb-1">Select Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400"
          >
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — Rs.{s.price} • {s.durationMins} mins
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: calendar */}
        <Calendar value={date} onChange={setDate} />

        {/* Right: time slots */}
        <div className="p-6 bg-white rounded-2xl shadow border">
          <div className="font-semibold mb-3">Select your time</div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <SlotGrid slots={slots} selected={picked?.start} onSelect={setPicked} />
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={onConfirm}
          disabled={!picked}
          className={`px-8 py-3 text-base font-medium rounded-full transition ${
            picked
              ? "bg-pink-600 text-white hover:bg-pink-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Confirm & Continue
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Appointment status will show <b>Pending</b> until payment is completed.
      </p>
    </div>
  );
}

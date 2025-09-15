import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { makeApi } from "../../api/appointments";
import { format } from "date-fns";
import SlotGrid from "../../components/appointments/SlotGrid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

  // guard: must be logged in to book
  useEffect(() => {
    if (userData === false) return; // still loading auth state
    if (!userData) {
      toast.info("Please login to book an appointment.");
      navigate("/login");
    }
  }, [userData, navigate]);

  // load services
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/services?activeOnly=true`);
        const list = data?.services || [];
        setServices(list);
        if (list.length) setServiceId(list[0]._id);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to load services";
        toast.error(msg);
      }
    })();
  }, [backendUrl]);

  // load slots for selected service/date
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
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Failed to load slots";
        toast.error(msg);
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [serviceId, date, api]);

  const onConfirm = async () => {
    if (!picked) return toast.info("Pick a time");
    try {
      const body = {
        serviceIds: [serviceId],
        date,
        start: picked.start,
        paymentMode: "online", // stays PENDING until payment done
      };
      const { success, appointment, message } = await api.create(body);
      if (!success) {
        return toast.error(message || "Failed to create appointment");
      }
      toast.success("Appointment created. Complete payment to confirm.");
      navigate("/appointments/mine");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create appointment";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-28 px-4 pb-16">
      <h1 className="text-3xl font-serif mb-6">Book an Appointment</h1>

      {/* Select service */}
      <div className="p-4 rounded-2xl border mb-6">
        <div className="font-semibold mb-2">Select service</div>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} — Rs.{s.price} • {s.durationMins} mins
            </option>
          ))}
        </select>
        {!services.length && (
          <div className="mt-2 text-sm text-gray-500">No active services available.</div>
        )}
      </div>

      {/* Date & time */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-2xl border">
          <div className="font-semibold mb-3">Pick a date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div className="p-4 rounded-2xl border">
          <div className="font-semibold mb-3">Pick a time</div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <SlotGrid slots={slots} selected={picked?.start} onSelect={setPicked} />
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 rounded-2xl border">
        <div className="font-semibold">Summary</div>
        <div className="text-sm text-gray-600 mt-1">
          {picked ? (
            <>
              Date: {date} &middot; Time: {format(new Date(picked.start), "p")}
            </>
          ) : (
            "Select a slot to continue"
          )}
        </div>
        <div className="mt-4">
          <button
            onClick={onConfirm}
            disabled={!picked}
            className={`px-5 py-2 rounded-xl text-white ${
              picked ? "bg-pink-500 hover:opacity-90" : "bg-gray-300"
            }`}
          >
            Confirm & Continue
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Appointment status will show <b>Pending</b> until payment is completed.
        </p>
      </div>
    </div>
  );
}

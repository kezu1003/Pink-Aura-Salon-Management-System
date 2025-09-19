import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm hover:shadow transition bg-white">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function StaffDashboard() {
  const { userData, backendUrl } = useContext(AppContext);
  const [schedule, setSchedule] = useState([]);
  const [ann, setAnn] = useState([]);
  const [pos, setPOs] = useState([]);

  const role = userData?.role || "";
  const jobTitle = userData?.jobTitle || "";
  const can = (perm) => (userData?.permissions || []).includes(perm);

  const WORK_START = "10:00";
  const WORK_END = "17:00";

  const loadSchedule = async () => {
    const { data } = await axios.get(`${backendUrl}/api/staff/schedule?range=today`, {
      withCredentials: true,
    });
    
    setSchedule(data.items || data.schedule || []);
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;
    const calls = [];

    if (can("view:own-schedule")) {
      calls.push(
        axios
          .get(`${backendUrl}/api/staff/schedule?range=today`)
          .then((r) => setSchedule(r.data.items || r.data.schedule || []))
      );
    }
    if (can("read:announcements")) {
      calls.push(
        axios
          .get(`${backendUrl}/api/staff/announcements`)
          .then((r) => setAnn(r.data.items || []))
      );
    }
    if (can("supplier:view-pos")) {
      calls.push(
        axios
          .get(`${backendUrl}/api/staff/suppliers/pos`)
          .then((r) => setPOs(r.data.items || []))
      );
    }

    Promise.allSettled(calls);
  }, [backendUrl, userData]);

  const startAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/start`, {}, { withCredentials: true });
      toast.success("Appointment started");
      await loadSchedule();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to start");
    }
  };

  const completeAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/complete`, {}, { withCredentials: true });
      toast.success("Appointment completed");
      await loadSchedule();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to complete");
    }
  };

  const fulfillPO = async (id) => {
    try {
      await axios.post(
        `${backendUrl}/api/staff/suppliers/pos/${id}/fulfill`,
        { status: "delivered" },
        { withCredentials: true }
      );
      toast.success("PO marked delivered");
      const { data } = await axios.get(`${backendUrl}/api/staff/suppliers/pos`, { withCredentials: true });
      setPOs(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update PO");
    }
  };

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hello, {userData?.name} — {role}
          {jobTitle ? ` (${jobTitle})` : ""}
        </h1>
        <p className="text-sm text-gray-500">
          Default working hours: <b>{WORK_START}</b> – <b>{WORK_END}</b>. Only features you’re allowed to see are visible.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {can("view:own-schedule") && (
          <Card title="My Schedule (Today)">
            {schedule.length === 0 ? (
              <p className="text-sm text-gray-500">No appointments today.</p>
            ) : (
              <ul className="space-y-2">
                {schedule.map((a) => {
                 
                  const id = a._id;
                  const start = a.startTime || a.startAt;
                  const end = a.endTime || a.endAt;
                  const services = a.services || []; 
                  const serviceNames =
                    Array.isArray(services) && services.length
                      ? services.map((s) => s.name || s).join(", ")
                      : a.serviceType || "Service";
                  const status = a.status;

                  return (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{serviceNames}</div>
                        <div className="text-gray-500">
                          {fmtTime(start)} – {fmtTime(end)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Status: {status}</div>
                      </div>

                      {can("manage:appointments:assigned") && (
                        <div className="space-x-2">
                          {status === "confirmed" && (
                            <button
                              onClick={() => startAppt(id)}
                              className="px-3 py-1 rounded bg-black text-white"
                            >
                              Start
                            </button>
                          )}
                          {status === "in_progress" && (
                            <button
                              onClick={() => completeAppt(id)}
                              className="px-3 py-1 rounded border"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        )}

        {can("read:services") && (
          <Card title="Service Catalog">
            <button
              onClick={async () => {
                try {
                  const { data } = await axios.get(`${backendUrl}/api/staff/services`, {
                    withCredentials: true,
                  });
                  const n = data.items?.length || 0;
                  toast.info(`${n} services loaded`);
                } catch (e) {
                  toast.error(e?.response?.data?.message || "Failed to load services");
                }
              }}
              className="px-3 py-2 rounded border text-sm"
            >
              Load Services
            </button>
          </Card>
        )}

        {can("request:inventory") && (
          <Card title="Inventory Requests">
            <button
              onClick={async () => {
                try {
                  await axios.post(
                    `${backendUrl}/api/staff/inventory/requests`,
                    { items: [{ name: "Gloves", qty: 2, unit: "packs" }] },
                    { withCredentials: true }
                  );
                  toast.success("Request sent");
                } catch (e) {
                  toast.error(e?.response?.data?.message || "Failed to send request");
                }
              }}
              className="px-3 py-2 rounded bg-black text-white text-sm"
            >
              Request Example
            </button>
          </Card>
        )}

        {can("supplier:view-pos") && (
          <Card title="Purchase Orders (Supplier)">
            {pos.length === 0 ? (
              <p className="text-sm text-gray-500">No POs assigned.</p>
            ) : (
              <ul className="space-y-2">
                {pos.map((p) => (
                  <li key={p._id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">PO #{p.code}</div>
                      <div className="text-gray-500">Status: {p.status}</div>
                    </div>
                    {can("supplier:update-fulfillment") && (
                      <button
                        onClick={() => fulfillPO(p._id)}
                        className="px-3 py-1 rounded bg-black text-white"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {can("read:announcements") && (
          <Card title="Announcements">
            {ann.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {ann.map((a) => (
                  <li key={a._id}>
                    <span className="font-medium">{a.title}:</span> {a.body}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

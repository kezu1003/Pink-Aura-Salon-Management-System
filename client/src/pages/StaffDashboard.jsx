// client/src/pages/StaffDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm hover:shadow transition">
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

  useEffect(() => {
    axios.defaults.withCredentials = true;
    const calls = [];

    if (can("view:own-schedule")) {
      calls.push(
        axios
          .get(`${backendUrl}/api/staff/schedule?range=today`)
          .then((r) => setSchedule(r.data.items || []))
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
        axios.get(`${backendUrl}/api/staff/suppliers/pos`).then((r) => setPOs(r.data.items || []))
      );
    }

    Promise.allSettled(calls);
  }, [backendUrl, userData]);

  const startAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/start`);
      toast.success("Appointment started");
      const { data } = await axios.get(`${backendUrl}/api/staff/schedule?range=today`);
      setSchedule(data.items || []);
    } catch {}
  };

  const completeAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/complete`);
      toast.success("Appointment completed");
      const { data } = await axios.get(`${backendUrl}/api/staff/schedule?range=today`);
      setSchedule(data.items || []);
    } catch {}
  };

  const fulfillPO = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/suppliers/pos/${id}/fulfill`, {
        status: "delivered",
      });
      toast.success("PO marked delivered");
      const { data } = await axios.get(`${backendUrl}/api/staff/suppliers/pos`);
      setPOs(data.items || []);
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hello, {userData?.name} — {role}
          {jobTitle ? ` (${jobTitle})` : ""}
        </h1>
        <p className="text-sm text-gray-500">Only features you’re allowed to see are visible.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {can("view:own-schedule") && (
          <Card title="My Schedule (Today)">
            {schedule.length === 0 ? (
              <p className="text-sm text-gray-500">No appointments today.</p>
            ) : (
              <ul className="space-y-2">
                {schedule.map((a) => (
                  <li key={a._id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{a.serviceType}</div>
                      <div className="text-gray-500">
                        {new Date(a.startAt).toLocaleTimeString()} –{" "}
                        {new Date(a.endAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {can("manage:appointments:assigned") && (
                      <div className="space-x-2">
                        {a.status === "scheduled" && (
                          <button
                            onClick={() => startAppt(a._id)}
                            className="px-3 py-1 rounded bg-black text-white"
                          >
                            Start
                          </button>
                        )}
                        {a.status === "in_progress" && (
                          <button
                            onClick={() => completeAppt(a._id)}
                            className="px-3 py-1 rounded border"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {can("read:services") && (
          <Card title="Service Catalog">
            <button
              onClick={async () => {
                try {
                  const { data } = await axios.get(`${backendUrl}/api/staff/services`);
                  const n = data.items?.length || 0;
                  toast.info(`${n} services loaded`);
                } catch {}
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
                  await axios.post(`${backendUrl}/api/staff/inventory/requests`, {
                    items: [{ name: "Gloves", qty: 2, unit: "packs" }],
                  });
                  toast.success("Request sent");
                } catch {}
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

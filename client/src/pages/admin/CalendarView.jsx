import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

export default function CalendarView() {
  const { backendUrl } = useContext(AppContext);
  const [week, setWeek] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - day);
    start.setHours(0,0,0,0);
    return start;
  });
  const [rows, setRows] = useState([]);

  async function load() {
    const from = new Date(week);
    const to = new Date(week); to.setDate(to.getDate()+7);
    const qs = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    const { data } = await axios.get(`${backendUrl}/api/admin/appointments?${qs.toString()}`);
    setRows(data.appointments || []);
  }

  useEffect(() => { load(); }, [week]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week); d.setDate(d.getDate()+i);
    return d;
  });

  function countForDate(d) {
    const dayStr = d.toDateString();
    return rows.filter(r => new Date(r.startTime).toDateString() === dayStr).length;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={()=>setWeek(new Date(week.setDate(week.getDate()-7)))}>◀ Prev</button>
        <button className="rounded border px-3 py-1" onClick={()=>setWeek(()=>{ const s=new Date(); const d=s.getDay(); s.setDate(s.getDate()-d); s.setHours(0,0,0,0); return s;})}>This week</button>
        <button className="rounded border px-3 py-1" onClick={()=>setWeek(new Date(week.setDate(week.getDate()+7)))}>Next ▶</button>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {days.map(d => (
          <div key={d.toISOString()} className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-black/60">{d.toLocaleDateString(undefined,{weekday:'short'})}</div>
            <div className="text-xl font-semibold">{d.getDate()}</div>
            <div className="mt-2 text-sm">Appointments: <b>{countForDate(d)}</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}

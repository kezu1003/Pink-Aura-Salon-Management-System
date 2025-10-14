import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";
import { toast } from "react-toastify";

export default function AdminCalendar() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makeApi(backendUrl), [backendUrl]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentsMap, setAppointmentsMap] = useState({});
  const [appointments, setAppointments] = useState([]);

  // Load appointments for the month
  const loadMonthAppointments = async (date) => {
    const from = startOfMonth(date).toISOString();
    const to = endOfMonth(date).toISOString();
    const { success, appointments } = await api.adminList({ from, to });
    if (success) {
      const map = {};
      appointments.forEach(a => {
        const day = a.startTime.slice(0, 10);
        if (!map[day]) map[day] = [];
        map[day].push(a);
      });
      setAppointmentsMap(map);

      // Update selected date appointments
      const dayKey = format(selectedDate, "yyyy-MM-dd");
      setAppointments(map[dayKey] || []);
    }
  };

  useEffect(() => {
    loadMonthAppointments(currentMonth);
  }, [currentMonth, selectedDate]);

  const onDateClick = (date) => {
    setSelectedDate(date);
    const dayKey = format(date, "yyyy-MM-dd");
    setAppointments(appointmentsMap[dayKey] || []);
  };

  const markPaid = async (id) => {
    const { success, message } = await api.markPaid(id);
    if (!success) return toast.error(message || "Failed");
    toast.success("Marked paid & confirmed");
    loadMonthAppointments(currentMonth);
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = startOfWeek(endOfMonth(currentMonth));
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayKey = format(day, "yyyy-MM-dd");
        const isBooked = appointmentsMap[dayKey]?.length > 0;
        const isSelected = isSameDay(day, selectedDate);

        days.push(
          <div
            key={dayKey}
            onClick={() => onDateClick(day)}
            className={`cursor-pointer p-2 h-14 w-14 flex items-center justify-center rounded-lg transition-all
              ${!isSameMonth(day, currentMonth) ? "text-[#9ca3af]" : "text-[#374151]"}
              ${isBooked ? "bg-[#fce7f3] text-[#ec4899] font-semibold shadow-inner" : "hover:bg-[#fde6f1]"}
              ${isSelected ? "border-2 border-[#ec4899] scale-105" : ""}
            `}
          >
            {format(day, "d")}
            {isBooked && (
              <span className="ml-1 text-xs font-bold text-[#ec4899]">{appointmentsMap[dayKey].length}</span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day} className="grid grid-cols-7 gap-1 mb-1">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderWeekDays = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 gap-1 mb-1 text-[#374151] font-semibold">
        {weekDays.map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
    );
  };

  return (
    <div className="pt-28 max-w-7xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-8">
      {/* Calendar Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-4">
        {/* Calendar Header with Prev/Next buttons */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-4 py-1 rounded-lg bg-[#ec4899] text-white hover:bg-[#d33f88] transition"
          >
            Prev
          </button>
          <h2 className="text-xl font-bold text-[#374151]">{format(currentMonth, "MMMM yyyy")}</h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-4 py-1 rounded-lg bg-[#ec4899] text-white hover:bg-[#d33f88] transition"
          >
            Next
          </button>
        </div>

        {/* Weekdays */}
        {renderWeekDays()}

        {/* Calendar Days */}
        {renderCalendarDays()}
      </div>

      {/* Sidebar Section */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-[#374151]">{format(selectedDate, "PPP")}</h2>
        <p className="mb-4 font-semibold text-[#ec4899]">Total bookings: {appointments.length}</p>

        <div className="space-y-3">
          {appointments.length === 0 && <div className="text-[#9ca3af]">No appointments.</div>}
          {appointments.map(a => (
            <div key={a._id} className="p-3 rounded-xl border-l-4 border-[#ec4899] flex flex-col gap-1 bg-[#fce7f3] shadow-sm">
              <div className="font-semibold text-[#ec4899]">{format(parseISO(a.startTime), "p")} – {format(parseISO(a.endTime), "p")} · {a.customer?.name}</div>
              <div className="text-sm text-[#374151]">{a.services?.map(s => s.name).join(", ")} · Staff: {a.staff?.name || "Any"} · Status: {a.status} · Pay: {a.paymentStatus}</div>
              {a.status === "pending" && <button onClick={() => markPaid(a._id)} className="mt-2 px-3 py-1 rounded-lg bg-[#ec4899] text-white hover:bg-[#d33f88] transition">Mark Paid & Confirm</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { format } from "date-fns";

export default function SlotGrid({ slots = [], selected, onSelect }) {
  
  // Add fixed slots from 9:00 AM to 11:59 AM
  const extraSlots = [
    { start: new Date().setHours(9, 0, 0, 0), end: new Date().setHours(9, 30, 0, 0) },
    { start: new Date().setHours(9, 30, 0, 0), end: new Date().setHours(10, 0, 0, 0) },
    { start: new Date().setHours(10, 0, 0, 0), end: new Date().setHours(10, 30, 0, 0) },
    { start: new Date().setHours(10, 30, 0, 0), end: new Date().setHours(11, 0, 0, 0) },
    { start: new Date().setHours(11, 0, 0, 0), end: new Date().setHours(11, 30, 0, 0) },
    { start: new Date().setHours(11, 30, 0, 0), end: new Date().setHours(11, 59, 0, 0) },
  ];

  // Merge both existing slots + extra ones (avoid duplicates)
  const combinedSlots = [...slots, ...extraSlots];
    
  return (

    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {slots.length === 0 && <div className="col-span-full text-sm text-gray-500">No slots</div>}
      {slots.map((s) => {
        const key = s.start;
        const slotDate = new Date(s.start);
        const isPast = slotDate < new Date(); // check if slot time has already passed
        const isActive = selected && new Date(selected).getTime() === new Date(s.start).getTime();

        return (
          <button
            key={key}
            onClick={() => !isPast && onSelect(s)} // prevent clicking on past slots
            disabled={isPast}
            className={`px-4 py-2 rounded-full border transition duration-200
              ${
                isPast
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : isActive
                  ? "bg-[#FBAA99] text-white border-[#FBAA99]"
                  : "bg-white hover:bg-pink-50"
                }
              `}
            title={`${format(new Date(s.start), "p")} - ${format(new Date(s.end), "p")}`}
          >
          {format(new Date(s.start), "p")}
          </button>

        );
      })}
    </div>
  );
}

import React from "react";
import { format } from "date-fns";

export default function SlotGrid({ slots = [], selected, onSelect }) {
    
  return (

    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {slots.length === 0 && <div className="col-span-full text-sm text-gray-500">No slots</div>}
      {slots.map((s) => {
        const key = s.start;
        const isActive = selected && new Date(selected).getTime() === new Date(s.start).getTime();

        return (
          <button
            key={key}
            onClick={() => onSelect(s)}

            className={`px-4 py-2 rounded-full border transition
              ${isActive ? "bg-pink-500 text-white border-pink-500" : "bg-white hover:bg-pink-50"}
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

import React, { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay,
} from "date-fns";

export default function Calendar({ value, onChange, minDate }) {
  const selected = useMemo(() => new Date(value), [value]);
  const [month, setMonth] = useState(startOfMonth(selected));
  const minDay = useMemo(() => (minDate ? startOfDay(new Date(minDate)) : null), [minDate]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const days = [];
    let cur = start;
    while (cur <= end) {
      days.push(cur);
      cur = addDays(cur, 1);
    }
    const out = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [month]);

  const pick = (d) => {
    if (minDay && isBefore(startOfDay(d), minDay)) return; 
    const str = format(d, "yyyy-MM-dd");
    onChange?.(str);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow border relative z-10">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          className="w-9 h-9 grid place-items-center rounded-md border hover:bg-gray-50"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-lg font-semibold tracking-wide">
          {format(month, "LLLL yyyy").toUpperCase()}
        </div>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="w-9 h-9 grid place-items-center rounded-md border hover:bg-gray-50"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-rows-6 gap-1">
        {weeks.map((w, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {w.map((d) => {
              const inMonth = isSameMonth(d, month);
              const isSel = isSameDay(d, selected);
              const disabled = minDay && isBefore(startOfDay(d), minDay);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => pick(d)}
                  disabled={disabled}
                  className={[
                    "aspect-square rounded-full w-full h-full text-sm",
                    "flex items-center justify-center border",
                    disabled
                      ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                      : inMonth
                      ? "text-gray-900"
                      : "text-gray-300",
                    !disabled && isSel
                      ? "bg-[#FBAA99] text-white border-[#FBAA99]"
                      : !disabled
                      ? "bg-white hover:bg-pink-50 border-gray-200"
                      : ""
                  ].join(" ")}
                >
                  {format(d, "d")}

                </button>
              );

            })}

          </div>
        ))}
        
      </div>
    </div>
  );
}

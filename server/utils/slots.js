import { addMinutes, isBefore } from "date-fns";


export const WORK_HOURS = { start: "09:00", end: "18:00" }; 

export function toDateISO(dateISO, hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${dateISO}T00:00:00.000Z`);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export function generateSlots({ startWindow, endWindow, duration, step = 15, busy = [] }) {
  const slots = [];
  let cursor = new Date(startWindow);
  while (isBefore(addMinutes(cursor, duration), addMinutes(endWindow, 1))) {
    const end = addMinutes(cursor, duration);
    const overlap = busy.some((b) => b.start < end && b.end > cursor);
    if (!overlap) slots.push({ start: new Date(cursor), end });
    cursor = addMinutes(cursor, step);
  }
  return slots;
}

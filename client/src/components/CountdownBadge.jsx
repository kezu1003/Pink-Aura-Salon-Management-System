import React from "react";

export default function CountdownBadge({ daysLeft }) {
  if (daysLeft === null || daysLeft === undefined) return null;
  const expired = daysLeft < 0;
  const warn = daysLeft >= 0 && daysLeft <= 7;

  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  const cls = expired
    ? `${base} bg-red-100 text-red-700`
    : warn
    ? `${base} bg-yellow-100 text-yellow-800`
    : `${base} bg-gray-100 text-gray-700`;

  return (
    <span className={cls}>
      {expired ? "Expired" : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
    </span>
  );
}

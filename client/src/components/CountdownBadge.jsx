import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Hourglass } from "lucide-react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));



export default function CountdownBadge({ daysLeft }) {
  if (daysLeft === null || daysLeft === undefined) return null;

  const prefersReduced = useReducedMotion();
  const total = 30;     // normalize ring to 30-day scale
  const d = clamp(daysLeft, 0, total);
  const pct = 1 - d / total;   // progress filled
  const size = 30;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = C * pct;

  const tone =
    daysLeft < 0
      ? "text-rose-600"
      : daysLeft <= 6
      ? "text-rose-600"
      : daysLeft < 30
      ? "text-amber-600"
      : "text-emerald-600";

  const bg =
    daysLeft < 0
      ? "bg-rose-50 border-rose-200"
      : daysLeft <= 6
      ? "bg-rose-50 border-rose-200"
      : daysLeft < 30
      ? "bg-amber-50 border-amber-200"
      : "bg-emerald-50 border-emerald-200";

  const label = daysLeft < 0 ? "Expired" : `${daysLeft}d`;

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${bg}`}>
      <div className={`relative w-[${size}px] h-[${size}px]`} style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke="currentColor"
            className="text-gray-200"
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="currentColor"
            className={tone}
            fill="none"
            strokeDasharray={`${dash} ${C}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            {...(prefersReduced
              ? {}
              : {
                  initial: { strokeDasharray: `0 ${C}` },
                  animate: { strokeDasharray: `${dash} ${C}`, transition: { duration: 0.6 } },
                })}
          />
        </svg>

        <Hourglass
          className="absolute inset-0 m-auto text-gray-500"
          size={14}
          aria-hidden
          style={{ pointerEvents: "none" }}
        />
      </div>
      <span className={`text-xs font-medium ${tone}`}>{label}</span>
    </div>
  );
}

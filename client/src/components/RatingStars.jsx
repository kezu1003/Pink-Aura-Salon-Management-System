import { useState } from "react";

export default function RatingStars({ value = 0, onChange, readOnly = false, size = "text-2xl" }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const current = hover || value;

  return (
    <div className={`flex gap-1 ${readOnly ? "pointer-events-none" : ""}`}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`Rate ${s}`}
          onMouseEnter={() => !readOnly && setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !readOnly && onChange?.(s)}
          className={[
            size,
            "leading-none transition-transform",
            current >= s ? "text-rose-500" : "text-slate-300",
            !readOnly && "hover:scale-110 focus:scale-110 focus:outline-none"
          ].filter(Boolean).join(" ")}
        >
          ★
        </button>
      ))}
    </div>
  );
}

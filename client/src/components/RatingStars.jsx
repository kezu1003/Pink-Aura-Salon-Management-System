import { useState } from "react";

export default function RatingStars({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const current = hover || value;

  return (
    <div className="flex gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !readOnly && onChange?.(s)}
          className={`text-2xl leading-none ${current >= s ? "text-yellow-500" : "text-gray-300"}`}
          aria-label={`Rate ${s}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

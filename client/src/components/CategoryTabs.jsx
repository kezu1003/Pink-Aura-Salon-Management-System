import React from "react";

const CATS = [
  "Hair Care Products",
  "Nail Care Products",
  "Skincare Products",
  "Makeup Products",
];

export default function CategoryTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {["All", ...CATS].map((c) => {
        const active = (value || "All") === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c === "All" ? "" : c)}
            className={`px-3 py-1 rounded-full border text-sm ${
              active
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-black"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

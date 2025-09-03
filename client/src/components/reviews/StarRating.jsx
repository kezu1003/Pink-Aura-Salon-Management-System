import React from "react";

export default function StarRating({ value=0, onChange=()=>{}, size="text-xl", readOnly=false }) {
  const stars = [1,2,3,4,5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s)=>(
        <button
          key={s}
          type="button"
          onClick={()=>!readOnly && onChange(s)}
          className={`${size} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          aria-label={`Rate ${s}`}
        >
          <span className={s <= value ? "text-yellow-500" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

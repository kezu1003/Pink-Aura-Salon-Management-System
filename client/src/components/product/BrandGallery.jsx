import React from "react";

function Card({ active, onClick, title, image }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-white/70 hover:bg-white transition shadow-sm hover:shadow-md ${
        active ? "ring-2 ring-rosePrimary" : ""
      }`}
      style={{ width: 200 }}   
      aria-pressed={active}
    >
      <div className="rounded-2xl overflow-hidden">
        <div className="aspect-[3/2] bg-gray-100">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full grid place-content-center text-gray-400">No Image</div>
          )}
        </div>
      </div>
      <div className="px-3 py-2 text-center">
        <span className="text-sm font-medium text-gray-900">{title}</span>
      </div>
    </button>
  );
}

export default function BrandGallery({ value = "", onChange, items = [] }) {
  const data = [{ value: "", label: "All", image: "/brands/all.jpg" }, ...items];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {data.map((b) => (
        <Card
          key={b.value || "all"}
          active={value === b.value}
          onClick={() => onChange?.(b.value)}
          title={b.label}
          image={b.image}
        />
      ))}
    </div>
  );
}

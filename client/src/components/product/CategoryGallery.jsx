import React from "react";
import { motion } from "framer-motion";

const Card = ({ active, onClick, title, image }) => (
  <button
    onClick={onClick}
    className={`text-left w-full rounded-2xl border bg-white/70 hover:bg-white transition shadow-sm hover:shadow-md
                ${active ? "ring-2 ring-rosePrimary" : "ring-0"}`}
    aria-pressed={active}
  >
    <div className="rounded-2xl overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-400">No Image</div>
        )}
      </div>
    </div>
    <div className="px-4 py-3 text-center">
      <span className="font-medium text-gray-900">{title}</span>
    </div>
  </button>
);

export default function CategoryGallery({
  value = "",
  onChange,
  items = [],
}) {
  
  const data = [{ value: "", label: "All", image: "/categories/all-category.jpg" }, ...items];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22,1,0.36,1] } }}
      className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] justify-items-center"
    >
      {data.map((c) => (
        <Card
          key={c.value || "all"}
          active={value === c.value}
          onClick={() => onChange?.(c.value)}
          title={c.label}
          image={c.image}
        />
      ))}
    </motion.div>
  );
}

import { useState } from "react";

export default function Filters({ onChange }) {
  const [q, setQ] = useState("");
  const [minPrice, setMin] = useState("");
  const [maxPrice, setMax] = useState("");
  const [sort, setSort] = useState("newest");

  const apply = () => onChange({ q, minPrice, maxPrice, sort });

  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <input
        className="border rounded px-2 py-1"
        placeholder="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 w-24"
        placeholder="Min"
        value={minPrice}
        onChange={(e) => setMin(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 w-24"
        placeholder="Max"
        value={maxPrice}
        onChange={(e) => setMax(e.target.value)}
      />
      <select
        className="border rounded px-2 py-1"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
        <option value="stock_desc">Stock ↓</option>
        <option value="name_asc">Name A-Z</option>
      </select>
      <button
        onClick={apply}
        className="px-3 py-1 rounded bg-black text-white"
      >
        Apply
      </button>
    </div>
  );
}

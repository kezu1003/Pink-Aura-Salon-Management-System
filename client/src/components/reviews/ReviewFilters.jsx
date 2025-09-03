import React from "react";

const CATS = ["Service", "Cleanliness", "Price", "Ambience", "Products", "Other"];

export default function ReviewFilters({ filters, setFilters, onApply }) {
  const toggleRating = (r) => {
    const set = new Set(filters.ratings);
    set.has(r) ? set.delete(r) : set.add(r);
    setFilters({ ...filters, ratings: Array.from(set).sort() });
  };

  return (
    <div className="grid md:grid-cols-5 gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Search</label>
        <input
          value={filters.q}
          onChange={(e)=>setFilters({ ...filters, q: e.target.value })}
          className="w-full border rounded-xl px-3 py-2 bg-transparent"
          placeholder="keyword..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e)=>setFilters({ ...filters, category: e.target.value })}
          className="w-full border rounded-xl px-3 py-2 bg-transparent"
        >
          <option value="">All</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Ratings</label>
        <div className="flex gap-1 flex-wrap">
          {[5,4,3,2,1].map(r=>(
            <button
              key={r}
              type="button"
              onClick={()=>toggleRating(r)}
              className={`px-2 py-1 rounded-md border ${filters.ratings.includes(r) ? "bg-yellow-400/20 border-yellow-400" : "border-zinc-300"}`}
            >
              {r}★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Media</label>
        <div className="flex items-center gap-2">
          <input id="hasMedia" type="checkbox" checked={filters.hasMedia} onChange={(e)=>setFilters({ ...filters, hasMedia: e.target.checked })}/>
          <label htmlFor="hasMedia" className="text-sm">Has media</label>
        </div>
      </div>

      <div className="md:col-span-5 flex justify-end">
        <button onClick={onApply} className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Apply</button>
      </div>
    </div>
  );
}

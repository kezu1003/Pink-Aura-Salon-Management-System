export default function CategoryTabs({ categories = [], active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button className={`px-3 py-1 rounded border ${!active ? "bg-black text-white" : ""}`} onClick={() => onChange("")}>All</button>
      {categories.map(c => (
        <button key={c} className={`px-3 py-1 rounded border ${active === c ? "bg-black text-white" : ""}`} onClick={() => onChange(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}

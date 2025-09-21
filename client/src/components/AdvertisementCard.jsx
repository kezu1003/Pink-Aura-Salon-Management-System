import { AdsAPI } from "../api/ads";

export default function AdvertisementCard({ ad, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border bg-white shadow overflow-hidden">
      <img
        src={AdsAPI.imageUrl(ad.image)}
        alt={ad.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-slate-800">{ad.title}</h3>
        {ad.description && <p className="text-sm text-slate-600 line-clamp-2">{ad.description}</p>}
        <div className="text-xs text-slate-500">
          {new Date(ad.startDate).toLocaleDateString()} – {new Date(ad.endDate).toLocaleDateString()}
        </div>
        <span className={`inline-block text-xs px-2 py-1 rounded-full ${ad.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {ad.status ? "Active" : "Paused"}
        </span>
        <div className="flex gap-2 pt-2">
          <button onClick={() => onEdit?.(ad)} className="px-3 py-1 rounded-lg border">Edit</button>
          <button onClick={() => onDelete?.(ad)} className="px-3 py-1 rounded-lg bg-red-600 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

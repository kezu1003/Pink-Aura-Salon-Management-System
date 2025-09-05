import RatingStars from "./RatingStars.jsx";
import { Pencil, Trash2 } from "lucide-react";

export default function ReviewCard({ r, onEdit, onDelete, canEdit }) {
  const initials = (r?.user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <div className="rounded-2xl border border-rose-100 bg-white/90 shadow-sm hover:shadow-md hover:border-rose-300 transition p-4">

      {/* Header */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-900 grid place-items-center font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{r.user?.name ?? "Anonymous"}</p>
            <p className="text-xs text-slate-500">
              {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>
        <RatingStars value={r.rating} readOnly />
      </div>

      {/* Meta chips */}

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800">
          Category: <span className="font-semibold">{r.category}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          Staff: <span className="font-semibold">{r.staff?.name ?? "-"}</span>
        </span>
      </div>

      {/* Comment */}

      {r.comment && (
        <p className="mt-3 text-sm text-slate-800">{r.comment}</p>
      )}

      {/* Actions */}
      
      {canEdit && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit?.(r)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => onDelete?.(r)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

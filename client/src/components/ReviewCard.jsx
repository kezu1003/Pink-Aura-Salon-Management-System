import RatingStars from "./RatingStars.jsx";
import { Pencil, Trash2 } from "lucide-react";

export default function ReviewCard({ r, onEdit, onDelete, canEdit }) {
  const initials = (r?.user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <div
      className="
        group rounded-3xl border bg-white/80
        border-[#FBAA99]/30 shadow-sm backdrop-blur
        hover:shadow-lg hover:border-[#FBAA99]/60 transition p-5
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="
              h-11 w-11 rounded-full grid place-items-center font-semibold text-white
              bg-[conic-gradient(at_30%_30%,#FBAA99_25%,#4D423A_75%)]
              ring-2 ring-white shadow-sm
            "
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-[#4D423A] leading-tight">
              {r.user?.name ?? "Anonymous"}
            </p>
            <p className="text-xs text-slate-500">
              {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <RatingStars value={r.rating} readOnly />
        </div>
      </div>

      {/* Meta chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className="
            inline-flex items-center gap-1.5 rounded-full
            border px-3 py-1 text-xs font-medium
            border-[#FBAA99]/50 bg-[#FEF4F1] text-[#4D423A]
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#FBAA99]" />
          Category: <span className="font-semibold">{r.category}</span>
        </span>

        <span
          className="
            inline-flex items-center gap-1.5 rounded-full
            border px-3 py-1 text-xs font-medium
            border-slate-200 bg-white text-slate-700
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#4D423A]" />
          Staff: <span className="font-semibold">{r.staff?.name ?? "-"}</span>
        </span>
      </div>

      {/* Comment */}
      {r.comment && (
        <p
          className="
            mt-3 text-sm text-[#2b2b2b] leading-6
            border-l-2 pl-3 border-[#FBAA99]/60
          "
        >
          {r.comment}
        </p>
      )}

      {/* Actions */}
      {canEdit && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit?.(r)}
            className="
              inline-flex items-center gap-2 rounded-full
              border bg-white px-3 py-1.5 text-sm
              text-[#4D423A] border-slate-200 hover:bg-slate-50
            "
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => onDelete?.(r)}
            className="
              inline-flex items-center gap-2 rounded-full
              border px-3 py-1.5 text-sm
              text-[#7a2b2b] border-[#FBAA99]/60 bg-[#FEF4F1]
              hover:bg-[#FBAA99]/20
            "
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

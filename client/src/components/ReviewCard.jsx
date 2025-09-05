import RatingStars from "./RatingStars.jsx";

export default function ReviewCard({ r, onEdit, onDelete, canEdit }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div>

          <p className="font-semibold">{r?.user?.name ?? "Anonymous"}</p>
          <p className="text-sm text-gray-500">

            {r?.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}

          </p>

        </div>

        <RatingStars value={r?.rating ?? 0} readOnly />

      </div>




      <div className="mt-2 text-sm">
        <p className="font-medium">
          Category: <span className="text-gray-700">{r?.category}</span>
        </p>
        <p className="font-medium">
          Staff: <span className="text-gray-700">{r?.staff?.name ?? "-"}</span>
        </p>
      </div>

      {r?.comment && <p className="mt-3 text-gray-800">{r.comment}</p>}

      {canEdit && (
        <div className="mt-3 flex gap-2">

          <button onClick={() => onEdit?.(r)} className="px-3 py-1 rounded-lg border hover:bg-gray-50">

            Edit
            
          </button>

          <button

            onClick={() => onDelete?.(r)}
            className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50"
          >
            Delete

          </button>

        </div>
      )}
    </div>
  );
}

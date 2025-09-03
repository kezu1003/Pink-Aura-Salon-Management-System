import React, { useState } from "react";
import StarRating from "./StarRating";

export default function ReviewCard({ review }) {
  const [openImg, setOpenImg] = useState(null);
  const displayName = review.anonymous ? "Anonymous" : (review.user?.name || "User");
  const thumb = review.media?.[0];
  return (
    <div className="rounded-2xl shadow p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <StarRating value={review.rating} readOnly size="text-lg" />
        <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
          {review.category}
        </span>
      </div>
      <h3 className="mt-2 font-semibold">{review.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-4">{review.comment}</p>

      <div className="mt-2 text-xs text-zinc-500">{displayName} • {new Date(review.createdAt).toLocaleDateString()}</div>

      {thumb && (
        <div className="mt-3">
          {thumb.type === "image" ? (
            // eslint-disable-next-line
            <img src={thumb.url} alt="media" className="h-36 w-full object-cover rounded-xl cursor-pointer" onClick={()=>setOpenImg(thumb.url)} />
          ) : (
            <video className="h-36 w-full object-cover rounded-xl" src={thumb.url} controls />
          )}
        </div>
      )}

      {openImg && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={()=>setOpenImg(null)}>
          {/* eslint-disable-next-line */}
          <img src={openImg} alt="preview" className="max-h-[85vh] max-w-[90vw] rounded-xl" />
        </div>
      )}
    </div>
  );
}

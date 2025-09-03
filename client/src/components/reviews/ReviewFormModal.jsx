import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import StarRating from "./StarRating";
import { ReviewsAPI } from "../../api/reviews";
import { toast } from "react-toastify";

const CATS = ["Service", "Cleanliness", "Price", "Ambience", "Products", "Other"];

export default function ReviewFormModal({ open, onClose, onSaved, initial=null }) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: initial || {
      rating: 5, title: "", comment: "", anonymous: false, category: "Service", tags: { staffIds: [] }, media: [],
    },
  });

  const [files, setFiles] = useState([]);

  useEffect(()=>{ reset(initial || {
    rating: 5, title: "", comment: "", anonymous: false, category: "Service", tags: { staffIds: [] }, media: [],
  }); setFiles([]); }, [initial, reset]);

  if (!open) return null;

  const onSubmit = async (values) => {
    try {
      // upload files if any
      let uploaded = [];
      for (const f of files.slice(0,4)) {
        const { success, media } = await ReviewsAPI.upload(f);
        if (success) uploaded.push(media);
      }
      const payload = { ...values, media: [...(values.media||[]), ...uploaded] };

      const req = initial? ReviewsAPI.update(initial._id, payload) : ReviewsAPI.create(payload);
      const { data } = await req;
      if (data.success) {
        toast.success(initial ? "Review updated" : "Review posted");
        onSaved?.(data.review || null);
        onClose();
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{initial ? "Edit Review" : "Write a Review"}</h2>
          <button onClick={onClose} className="text-xl">×</button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-3">
            <label className="w-24">Rating</label>
            <StarRating value={watch("rating")} onChange={(v)=>setValue("rating", v)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Title</label>
            <input {...register("title", { required: true, minLength: 2, maxLength: 80 })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
          </div>

          <div>
            <label className="block text-sm mb-1">Comment</label>
            <textarea {...register("comment", { required: true, minLength: 2, maxLength: 2000 })} rows={4} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Category</label>
              <select {...register("category")} className="w-full border rounded-xl px-3 py-2 bg-transparent">
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6 sm:mt-0">
              <input type="checkbox" id="anon" {...register("anonymous")} />
              <label htmlFor="anon" className="text-sm">Post as Anonymous</label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Attach Media (max 4)</label>
            <input type="file" multiple accept="image/*,video/*" onChange={(e)=>setFiles(Array.from(e.target.files||[]))} />
            <div className="mt-2 grid grid-cols-4 gap-2">
              {files.slice(0,4).map((f, i)=>(
                <div key={i} className="text-xs border rounded-xl p-2">{f.name}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              {initial ? "Save" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

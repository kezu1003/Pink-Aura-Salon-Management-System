import React, { useEffect, useState } from "react";
import { ReviewsAPI } from "../api/reviews";
import ReviewCard from "./reviews/ReviewCard";
import { toast } from "react-toastify";

export default function HomeReviewsTile() {
  const [items, setItems] = useState([]);
  useEffect(()=>{
    (async ()=>{
      try {
        const { data } = await ReviewsAPI.listPublic({ limit: 6, sortBy: "newest" });
        if (data.success) setItems(data.data);
      } catch (e) {
        toast.error(e.response?.data?.message || e.message);
      }
    })();
  },[]);
  if (!items.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">What our customers say</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {items.map(r => <ReviewCard key={r._id} review={r} />)}
      </div>
    </section>
  );
}

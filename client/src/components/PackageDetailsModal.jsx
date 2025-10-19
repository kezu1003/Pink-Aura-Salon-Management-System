import React from "react";
import { useNavigate } from "react-router-dom";

export default function PackageDetailsModal({ pkg, onClose }) {
  const navigate = useNavigate();
  if (!pkg) return null;

  const hasDiscount = pkg.discountPrice != null && Number(pkg.discountPrice) < Number(pkg.price);

  const Price = () => (
    <div className="mt-2 flex items-baseline gap-4">
      {hasDiscount ? (
        <>
          <div className="text-2xl md:text-3xl font-bold text-[#F57C5B]">
            Rs.{pkg?.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
          </div>
          <div className="line-through text-[#A6785A] text-sm md:text-base">
            Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
          </div>
        </>
      ) : (
        <div className="text-2xl md:text-3xl font-bold text-[#F57C5B]">
          Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
        </div>
      )}
    </div>
  );

  const handleBookNow = () => {
    // Redirect to booking page with package id or name
    navigate(`/booking/${pkg._id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-[#F57C5B]/20 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#7A4B3A]">{pkg.name}</h2>
          {pkg?.seasonalOffer?.enabled && (
            <span className="mt-2 inline-block text-xs md:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-[#F57C5B] to-[#F87C5C] text-white shadow-md">
              {pkg.seasonalOffer?.label || "Offer"}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-0">
          {/* Image */}
          <div className="relative">
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full max-h-[440px] object-cover rounded-l-3xl shadow-inner"
              />
            ) : (
              <div className="w-full h-[280px] bg-gradient-to-r from-[#FFD9CC] to-[#FFE0D4] rounded-l-3xl" />
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-sm md:text-base text-[#A6785A]">{pkg.category}</div>
              <Price />
              <div className="mt-1 text-sm md:text-base text-[#A6785A]">
                ~ {pkg.estimatedTimeMins || 60} mins
              </div>

              {pkg.description && (
                <p className="mt-4 text-[#7A4B3A] text-sm md:text-base">{pkg.description}</p>
              )}

              {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
                <div className="mt-5">
                  <div className="font-medium mb-1 text-[#7A4B3A] text-sm md:text-base">What’s included</div>
                  <ul className="list-disc pl-5 text-sm md:text-base text-[#A6785A] space-y-1">
                    {pkg.servicesIncluded.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleBookNow}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#F57C5B]/90 to-[#F87C5C]/90 text-white font-semibold shadow-md hover:shadow-xl transition-all"
              >
                Book Now
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl border border-[#F57C5B] text-[#7A4B3A] font-semibold hover:bg-[#FDEBE6] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F57C5B]/20 text-xs md:text-sm text-[#A6785A]">
          Created {new Date(pkg.createdAt).toLocaleDateString()} • Updated{" "}
          {new Date(pkg.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function PackageDetailsModal({ pkg, onClose, onBook }) {
  if (!pkg) return null;

  const hasDiscount = pkg.discountPrice != null && Number(pkg.discountPrice) < Number(pkg.price);

  const Price = () => (
    <div className="mt-2 flex items-baseline gap-3">
      {hasDiscount ? (
        <>
          <div className="text-2xl font-bold text-[#F57C5B]">
            Rs.{pkg?.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
          </div>
          <div className="line-through text-[#A6785A]">
            Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
          </div>
        </>
      ) : (
        <div className="text-2xl font-bold text-[#F57C5B]">
          Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFF5F2] rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-[#F57C5B]/20 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F57C5B]/30">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-[#7A4B3A]">{pkg.name}</h2>
            {pkg?.seasonalOffer?.enabled && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFDDD1] text-[#F57C5B]">
                {pkg.seasonalOffer?.label || "Offer"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#F57C5B]/40 hover:bg-[#FDEBE6] text-[#7A4B3A]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative">
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full max-h-[440px] object-cover rounded-l-3xl"
              />
            ) : (
              <div className="w-full h-[280px] bg-[#FFD9CC] rounded-l-3xl" />
            )}
          </div>

          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="text-sm text-[#A6785A]">{pkg.category}</div>
              <Price />
              <div className="mt-1 text-sm text-[#A6785A]">
                ~ {pkg.estimatedTimeMins || 60} mins
              </div>

              {pkg.description && (
                <p className="mt-4 text-[#7A4B3A]">{pkg.description}</p>
              )}

              {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
                <div className="mt-5">
                  <div className="font-medium mb-1 text-[#7A4B3A]">What’s included</div>
                  <ul className="list-disc pl-5 text-sm text-[#A6785A] space-y-1">
                    {pkg.servicesIncluded.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onBook}
                className="px-5 py-2.5 rounded-2xl bg-[#F57C5B] text-white hover:bg-[#F57C5B]/90 transition"
              >
                Book Now
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-[#F57C5B] text-[#7A4B3A] hover:bg-[#FDEBE6] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F57C5B]/20 text-xs text-[#A6785A]">
          Created {new Date(pkg.createdAt).toLocaleDateString()} • Updated{" "}
          {new Date(pkg.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

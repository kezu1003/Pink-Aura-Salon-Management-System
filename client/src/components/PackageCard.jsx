import React from "react";

export default function PackageCard({ pkg, onClick }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    <div
      className="bg-[#FFF5F2] rounded-2xl border border-[#F57C5B]/30 shadow-md hover:shadow-2xl hover:scale-105 transform transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {pkg.image ? (
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-40 object-cover rounded-t-2xl"
        />
      ) : (
        <div className="w-full h-40 bg-[#FFD9CC]" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#7A4B3A]">{pkg.name}</h3>
          {pkg.seasonalOffer?.enabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFDDD1] text-[#F57C5B]">
              {pkg.seasonalOffer?.label || "Offer"}
            </span>
          )}
        </div>

        <div className="mt-1 text-xs text-[#A6785A]">{pkg.category}</div>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <div className="text-lg font-semibold text-[#F57C5B]">
                Rs.{pkg.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
              </div>
              <div className="text-sm line-through text-[#A6785A]">
                Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
              </div>
            </>
          ) : (
            <div className="text-lg font-semibold text-[#F57C5B]">
              Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
            </div>
          )}
        </div>

        <div className="mt-1 text-xs text-[#A6785A]">~ {pkg.estimatedTimeMins} mins</div>

        {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
          <div className="mt-3 text-xs text-[#7A4B3A] line-clamp-2">
            {pkg.servicesIncluded.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

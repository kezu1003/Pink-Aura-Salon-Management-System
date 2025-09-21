import React from "react";

export default function PackageCard({ pkg, onClick }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {pkg.image ? (
        <img src={pkg.image} alt={pkg.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-pink-100" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{pkg.name}</h3>
          {pkg.seasonalOffer?.enabled && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
              {pkg.seasonalOffer?.label || "Offer"}
            </span>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-500">{pkg.category}</div>

        {/* price */}
        
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <div className="text-lg font-semibold">Rs.{pkg.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}</div>
              <div className="text-sm line-through text-gray-500">Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}</div>
            </>
          ) : (
            <div className="text-lg font-semibold">Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}</div>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-600">~ {pkg.estimatedTimeMins} mins</div>

        {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
          <div className="mt-3 text-xs text-gray-700 line-clamp-2">
            {pkg.servicesIncluded.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

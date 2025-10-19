import React from "react";

export default function PackageCard({ pkg, onClick }) {
  const hasDiscount = pkg.discountPrice != null && pkg.discountPrice < pkg.price;

  return (
    <div
      className="bg-gradient-to-br from-[#FEF4F1] to-[#FFFFFF] rounded-3xl border border-[#FBAA99]/20 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-500 ease-in-out overflow-hidden cursor-pointer relative group min-h-[400px] flex flex-col"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {pkg.image ? (
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-48 object-cover rounded-t-3xl transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-b from-[#FBAA99]/50 to-[#FEF4F1] rounded-t-3xl" />
      )}
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg text-[#4D423A] font-['Playfair Display'] tracking-tight">{pkg.name}</h3>
          {pkg.seasonalOffer?.enabled && (
            <span className="text-xs px-3 py-1 rounded-full bg-[#FBAA99]/20 text-[#FBAA99] font-medium font-['Inter']">
              {pkg.seasonalOffer?.label || "Exclusive Offer"}
            </span>
          )}
        </div>

        <div className="mt-2 text-sm text-[#4D423A]/70 font-['Inter']">{pkg.category}</div>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          {hasDiscount ? (
            <>
              <div className="text-xl font-bold text-[#FBAA99] font-['Playfair Display']">
                Rs.{pkg.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
              </div>
              <div className="text-sm line-through text-[#4D423A]/50 font-['Inter']">
                Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
              </div>
            </>
          ) : (
            <div className="text-xl font-bold text-[#FBAA99] font-['Playfair Display']">
              Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
            </div>
          )}
        </div>

        <div className="mt-2 text-sm text-[#4D423A]/70 font-['Inter']">~ {pkg.estimatedTimeMins} mins</div>

        {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
          <div className="mt-4 text-sm text-[#4D423A] font-['Inter'] line-clamp-2">
            {pkg.servicesIncluded.join(", ")}
          </div>
        )}
      </div>
      <div className="p-5 pt-0 flex justify-center">
        <button
          onClick={onClick}
          className="w-3/4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white font-['Inter'] font-medium hover:from-[#4D423A] hover:to-[#FBAA99] transition-all duration-300"
        >
          View Package
        </button>
      </div>
    </div>
  );
}
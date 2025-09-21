import React from "react";

export default function PackageDetailsModal({ pkg, onClose, onBook }) {
  if (!pkg) return null;

  const hasDiscount =
    pkg.discountPrice != null && Number(pkg.discountPrice) < Number(pkg.price);

  const Price = () => (
    <div className="mt-2 flex items-baseline gap-3">
      {hasDiscount ? (
        <>
          <div className="text-2xl font-semibold">
            Rs.{pkg?.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
          </div>
          <div className="line-through text-gray-500">
            Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
          </div>
        </>
      ) : (
        <div className="text-2xl font-semibold">
          Rs.{pkg?.price?.toLocaleString?.() ?? pkg.price}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{pkg.name}</h2>
            {pkg?.seasonalOffer?.enabled && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                {pkg.seasonalOffer?.label || "Offer"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
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
                className="w-full h-full max-h-[440px] object-cover"
              />
            ) : (
              <div className="w-full h-[280px] bg-pink-100" />
            )}
          </div>

          <div className="p-6">
            <div className="text-sm text-gray-500">{pkg.category}</div>
            <Price />
            <div className="mt-1 text-sm text-gray-600">
              ~ {pkg.estimatedTimeMins || 60} mins
            </div>

            {pkg.description && (
              <p className="mt-4 text-gray-800">{pkg.description}</p>
            )}

            {Array.isArray(pkg.servicesIncluded) &&
              pkg.servicesIncluded.length > 0 && (
                <div className="mt-5">
                  <div className="font-medium mb-1">What’s included</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {pkg.servicesIncluded.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onBook}
                className="px-5 py-2.5 rounded-full bg-pink-600 text-white hover:bg-pink-700"
              >
                Book Now
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Footer  */}
        <div className="px-6 py-4 border-t text-xs text-gray-500">
          Created {new Date(pkg.createdAt).toLocaleDateString()} • Updated{" "}
          {new Date(pkg.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

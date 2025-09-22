import React from "react";
import { Link } from "react-router-dom";

export default function GalleryFeature() {
  const imgs = ["/gallery1.jpg", "/g2.jpg", "/g3.jpg"]; 

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      {/* Left text */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-[#000000]">
          Browse Our Gallery
        </h2>
        <p className="mt-3 max-w-lg text-[#4D423A]">
          Real clients. Real transformations. See the looks crafted by our expert stylists.
        </p>
        <Link
          to="/gallery"
          className="
            mt-6 inline-flex items-center justify-center rounded-full
            border border-[#4D423A] px-6 py-3 text-[#4D423A]
            transition hover:bg-[#FBAA99] hover:text-white
          "
        >
          Click here
        </Link>
      </div>

      {/* Right image rail */}
      <div className="grid grid-cols-3 gap-4">
        {imgs.map((src, i) => (
          <div
            key={i}
            className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#FFFFFF] shadow"
          >
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

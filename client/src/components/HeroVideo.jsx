import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroVideo() {
  const navigate = useNavigate();

  return (
    <section className="relative isolate">
      {/* Video */}
      <video
        className="h-[78vh] w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
       
      </video>

      {/* Dark-to-transparent overlay for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#000000]/55 via-[#4D423A]/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl">
              Experience the Elegance of Pink Aura
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Where expert care meets luxurious services for a transformative beauty
              experience in Sri Lanka.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/book")}
                className="rounded-full bg-[#FBAA99] px-6 py-3 text-white shadow transition hover:opacity-95"
              >
                Book Appointment
              </button>
              <button
                onClick={() => navigate("/services")}
                className="rounded-full border border-white/70 bg-white/20 px-6 py-3 text-white backdrop-blur hover:bg-white/30"
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

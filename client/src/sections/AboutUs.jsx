import React from "react";

const T = {
  bg: "#FEF4F1",
  accent: "#FBAA99",
  dark: "#4D423A",
  black: "#000000",
  white: "#FFFFFF",
};

export default function AboutUs() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2">
        
        <div className="overflow-hidden rounded-3xl border bg-white shadow"
             style={{ borderColor: `${T.dark}22` }}>
          
          <img
            src="/bg3.jpg"
            alt="Salon experience"
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-4xl font-bold tracking-tight"
              style={{ color: T.black }}>
            About Us
          </h2>
          <p className="mt-5 text-lg leading-8"
             style={{ color: `${T.dark}` }}>
            At Pink Aura, we’re your warm, one-stop salon in Colombo. Our unisex studio
            blends expertise with genuine care—so every visit feels welcoming, relaxing,
            and totally you.
          </p>

          <ul className="mt-6 space-y-3 text-base"
              style={{ color: `${T.dark}CC` }}>
            <li>• Expert stylists for hair, nails & spa</li>
            <li>• Premium products & hygienic care</li>
            <li>• Personalized consultations & makeovers</li>
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/services"
               className="rounded-full px-6 py-3 font-medium shadow transition"
               style={{
                 background: T.accent,
                 color: T.white,
                 boxShadow: "0 10px 24px rgba(251,170,153,.35)"
               }}>
              Explore Services
            </a>
            <a href="/appointments/book"
               className="rounded-full border px-6 py-3 font-medium transition"
               style={{ borderColor: T.dark, color: T.dark, background: T.white }}>
              Book an Appointment
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

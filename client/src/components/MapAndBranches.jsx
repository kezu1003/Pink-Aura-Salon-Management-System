import React from "react";
import branches from "../data/branches";

export default function MapAndBranches() {
  // Center map roughly around Colombo
  const mapQuery = encodeURIComponent("Colombo, Sri Lanka beauty salon");
  const mapSrc = `https://www.google.com/maps/embed?pb=&q=${mapQuery}`;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Map */}
      <div className="overflow-hidden rounded-2xl border border-[#4D423A]/10 shadow-sm">
        <iframe
          title="Pink Aura Branches"
          src={mapSrc}
          width="100%"
          height="520"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Branch list */}
      <div className="max-h-[520px] overflow-y-auto rounded-2xl bg-[#FEF4F1] p-4">
        <ul className="space-y-4">
          {branches.map((b, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-[#4D423A]/10 bg-white p-4 shadow-sm"
            >
              <h3 className="text-sm font-extrabold tracking-wide text-[#FBAA99]">
                {b.name}
              </h3>
              <p className="mt-1 text-sm text-[#4D423A]">{b.address}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href={`tel:${b.phone?.replaceAll(" ", "")}`}
                  className="rounded-full border border-[#4D423A]/20 px-3 py-1 text-[#000000] hover:bg-[#FEF4F1]"
                >
                  Call {b.phone}
                </a>
                {b.whatsapp && (
                  <a
                    href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#4D423A]/20 px-3 py-1 text-[#000000] hover:bg-[#FEF4F1]"
                  >
                    WhatsApp
                  </a>
                )}
                <a
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#FBAA99] px-3 py-1 text-white hover:opacity-95"
                >
                  Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

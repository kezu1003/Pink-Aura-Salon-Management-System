import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Lightbox from "../components/Lightbox";
import galleryItems from "../utils/galleryData";

// Theme tokens
const T = {
  bg: "#FEF4F1",
  accent: "#FBAA99",
  dark: "#4D423A",
  black: "#000000",
  white: "#FFFFFF",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "hair", label: "Hair" },
  { key: "nails", label: "Nails" },
  { key: "spa", label: "Spa" },
];

export default function Gallery() {
  const [tab, setTab] = useState("all");
  const [activeIdx, setActiveIdx] = useState(-1);

  const filtered = useMemo(
    () => (tab === "all" ? galleryItems : galleryItems.filter((i) => i.category === tab)),
    [tab]
  );

  const open = activeIdx >= 0;
  const activeItem = open ? filtered[activeIdx] : null;

  const prev = () => setActiveIdx((i) => (i <= 0 ? filtered.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i >= filtered.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      {/* Header with back button */}
      <header
        className="sticky top-0 z-20 border-b/0 px-4 py-4 backdrop-blur"
        style={{
          background: "linear-gradient(180deg, rgba(251,170,153,.25), rgba(254,244,241,.85))",
          borderBottom: `1px solid ${T.dark}20`,
        }}
      >
        <div className="mx-auto flex w-[min(1100px,92vw)] items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: T.black }}>
            Our Work Gallery
          </h1>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow"
            style={{
              background: T.white,
              border: `1px solid ${T.dark}`,
              color: T.dark,
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-[min(1100px,92vw)] px-4 pt-10">
        <div
          className="rounded-3xl p-8 shadow"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,170,153,.35), rgba(255,255,255,1))",
            border: `1px solid ${T.dark}20`,
          }}
        >
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: T.black }}
          >
            Real clients. Real transformations.
          </h2>
          <p className="mt-2 max-w-2xl" style={{ color: `${T.dark}CC` }}>
            Browse looks crafted by our stylists across hair, nails and spa.
          </p>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  aria-pressed={active}
                  onClick={() => setTab(t.key)}
                  className="rounded-full px-4 py-2 text-sm transition"
                  style={{
                    border: `1px solid ${active ? T.accent : T.dark}`,
                    background: active ? T.accent : T.white,
                    color: active ? T.white : T.dark,
                    boxShadow: active ? "0 8px 24px rgba(251,170,153,.35)" : "none",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto w-[min(1100px,92vw)] px-4 pb-20 pt-8">
        <section aria-live="polite" className="grid grid-cols-12 gap-5">
          {filtered.map((it, idx) => (
            <figure
              key={it.id}
              className="col-span-12 overflow-hidden rounded-2xl border bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg md:col-span-6 lg:col-span-4"
              style={{ borderColor: `${T.dark}33` }}
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                onClick={() => setActiveIdx(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveIdx(idx);
                  }
                }}
                tabIndex={0}
                className="h-[230px] w-full cursor-zoom-in object-cover"
              />
              <figcaption
                className="px-3 py-2 text-sm"
                style={{
                  borderTop: `1px solid ${T.dark}22`,
                  color: `${T.dark}CC`,
                  background: "#fff",
                }}
              >
                {it.caption}
              </figcaption>
            </figure>
          ))}
        </section>
      </main>

      {/* Lightbox */}
      <Lightbox open={open} item={activeItem} onClose={() => setActiveIdx(-1)} onPrev={prev} onNext={(next)} />
    </div>
  );
}

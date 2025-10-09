import React, { useEffect } from "react";

/** Theme */
const C = {
  accent: "#FBAA99",
  dark: "#4D423A",
};

export default function Lightbox({ open, item, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open || !item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border px-3 py-2 text-2xl text-white"
        style={{ borderColor: C.dark, background: "rgba(77,66,58,.85)" }}
      >
        &times;
      </button>

      <button
        onClick={onPrev}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-2xl text-white"
        style={{ borderColor: C.dark, background: "rgba(77,66,58,.85)" }}
      >
        &#10094;
      </button>
      <button
        onClick={onNext}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-2xl text-white"
        style={{ borderColor: C.dark, background: "rgba(77,66,58,.85)" }}
      >
        &#10095;
      </button>

      <figure className="grid w-full max-w-5xl gap-3">
        <img
          src={item.src}
          alt={item.alt || ""}
          className="w-full rounded-xl border shadow-2xl"
          style={{ borderColor: C.dark, background: "#FFFFFF" }}
        />
        <figcaption className="text-center text-white/90">
          {item.caption}
        </figcaption>
      </figure>
    </div>
  );
}

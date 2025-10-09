import React from "react";


export default function GalleryGrid({ items, onOpen }) {
  return (
    <section
      className="gallery-grid"
      aria-live="polite"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 14,
        padding: "16px 0 60px",
      }}
    >
      {items.map((it, idx) => (
        <figure
          key={it.id}
          className="gallery-item"
          data-category={it.category}
          style={{
            gridColumn: "span 4",
            background: "#12161c",
            border: "1px solid #263042",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          }}
        >
          <img
            src={it.src}
            alt={it.alt}
            loading="lazy"
            tabIndex={0}
            onClick={() => onOpen(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(idx);
              }
            }}
            style={{
              width: "100%",
              height: 230,
              objectFit: "cover",
              display: "block",
              cursor: "zoom-in",
              background: "#0b0d11",
            }}
          />
          <figcaption
            style={{
              padding: "10px 12px",
              fontSize: 13,
              color: "#8f9baa",
              borderTop: "1px solid #263042",
            }}
          >
            {it.caption}
          </figcaption>
        </figure>
      ))}

      <style>{`
        @media (max-width: 1024px) {
          .gallery-item { grid-column: span 6; }
        }
        @media (max-width: 640px) {
          .gallery-item { grid-column: span 12; }
          .gallery-item img { height: 220px; }
        }
      `}</style>
    </section>
  );
}

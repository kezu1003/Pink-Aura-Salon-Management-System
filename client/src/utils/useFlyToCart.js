import { useCallback } from "react";

export default function useFlyToCart(anchorSelector = "#cart-fly-anchor") {
  const fly = useCallback((sourceEl, { duration = 600, easing = "cubic-bezier(0.22,1,0.36,1)" } = {}) => {
    try {
      if (!sourceEl) return;

      const anchor = document.querySelector(anchorSelector);
      if (!anchor) return;

      // Get positions
      const srcRect = sourceEl.getBoundingClientRect();
      const tgtRect = anchor.getBoundingClientRect();

      // Create a clone 
      const img = sourceEl.tagName === "IMG"
        ? sourceEl
        : sourceEl.querySelector("img");

      const clone = document.createElement("div");
      clone.style.position = "fixed";
      clone.style.left = `${srcRect.left}px`;
      clone.style.top = `${srcRect.top}px`;
      clone.style.width = `${srcRect.width}px`;
      clone.style.height = `${srcRect.height}px`;
      clone.style.borderRadius = getComputedStyle(sourceEl).borderRadius || "12px";
      clone.style.overflow = "hidden";
      clone.style.zIndex = "9999";
      clone.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      clone.style.pointerEvents = "none";
      clone.style.background = "#fff";

      if (img && img.src) {
        const inner = document.createElement("img");
        inner.src = img.src;
        inner.style.width = "100%";
        inner.style.height = "100%";
        inner.style.objectFit = "cover";
        clone.appendChild(inner);
      }

      document.body.appendChild(clone);

      //  translate + scale to target
      const endX = tgtRect.left + tgtRect.width / 2 - (srcRect.left + srcRect.width / 2);
      const endY = tgtRect.top + tgtRect.height / 2 - (srcRect.top + srcRect.height / 2);
      const scale = Math.max(0.15, Math.min(0.25, tgtRect.width / srcRect.width));

      // Animate via WAAPI 
      const keyframes = [
        { transform: "translate3d(0,0,0) scale(1)", opacity: 1, offset: 0 },
        { transform: `translate3d(${endX * 0.6}px, ${endY * 0.6}px, 0) scale(${Math.max(1, scale*1.6)})`, opacity: 0.9, offset: 0.6 },
        { transform: `translate3d(${endX}px, ${endY}px, 0) scale(${scale})`, opacity: 0.2, offset: 1 },
      ];

      const anim = clone.animate(keyframes, { duration, easing, fill: "forwards" });
      anim.onfinish = () => clone.remove();
      anim.oncancel = () => clone.remove();
    } catch (e) {
      // Ignore animation failures
      console.error(e);
    }
  }, [anchorSelector]);

  return fly;
}

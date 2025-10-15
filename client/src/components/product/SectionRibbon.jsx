import React from "react";
import { Sparkles } from "lucide-react"; 

export default function SectionRibbon({
  text = "SHOP BY CATEGORY",
  className = "",
  icon = <Sparkles size={16} />,
}) {
  return (
    <div className={`w-full px-4 md:px-8 lg:px-12 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">

          {/* pill */}
          <div className="w-full rounded-full bg-[#FBAA99] text-white text-center font-semibold tracking-wide
                          px-6 md:px-10 py-4 md:py-5 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">

            <span className="inline-flex items-center gap-2 justify-center">

              {icon ? <span className="opacity-90">{icon}</span> : null}
              <span className="text-sm md:text-base">{text}</span>

            </span>
          </div>

        <div className="absolute inset-0 rounded-full -z-10 blur-xl bg-[#2E6B58]/20" />
        </div>

      </div>
    </div>
  );
}

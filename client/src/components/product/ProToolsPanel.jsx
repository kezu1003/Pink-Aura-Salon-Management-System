import React from "react";
import { RefreshCw, ShoppingBag, Clock3 } from "lucide-react";


export default function ProToolsPanel({
  title = "SHOP LIKE A PRO",
  subtitle = "Use professional shopping tools to save time and get your beauty supplies fast",
  items = [
    {
      key: "buy-again",
      title: "BUY AGAIN",
      subtitle: "Order from your history",
      icon: <RefreshCw className="w-16 h-16 md:w-20 md:h-20 stroke-[1.5]" />,
    },
    {
      key: "shopping-list",
      title: "SHOPPING LIST",
      subtitle: "Create a reusable list",
      icon: <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 stroke-[1.5]" />,
    },
    {
      key: "express-order",
      title: "EXPRESS ORDER",
      subtitle: "Order by item and qty",
      icon: <Clock3 className="w-16 h-16 md:w-20 md:h-20 stroke-[1.5]" />,
    },
    {
      key: "shop-by-brand",
      title: "SHOP BY BRAND",
      subtitle: "Huge Pro Selection",
      az: true,
    },
  ],
}) {
  return (
    <section className="px-4 md:px-8 lg:px-12">
      <div className="rounded-[28px] bg-[#F6E9F1] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">

        {/* Header */}
        <div className="text-center px-6 pt-8 md:pt-10">
          <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-wide">
            {title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-700">
            {subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-6 md:p-8">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href || "#"}
              className="group block rounded-2xl bg-white border border-neutral-200 shadow-sm
                         hover:shadow-md transition shadow-black/0 hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[210px] md:min-h-[230px] p-6">

                {/* Icon zone */}
                <div className="mb-6 text-neutral-900">
                  {it.az ? (
                    <div className="w-20 h-20 md:w-24 md:h-24 grid place-items-center rounded-full bg-neutral-50 border border-neutral-200">
                      <span className="text-3xl md:text-4xl font-semibold tracking-wide">A - Z</span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 grid place-items-center rounded-full bg-neutral-50 border border-neutral-200">
                      
                      <div className="text-neutral-900">{it.icon}</div>
                    </div>
                  )}
                </div>

                {/* Title + sub */}
                <div>
                  <div className="text-[15px] md:text-[16px] font-extrabold tracking-wide">
                    {it.title}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-neutral-600">
                    {it.subtitle}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import {
  Scissors,
  Sparkles,
  Hand,
  Bath,
  Flower2,
  Leaf,
  HeartPulse,
  Gem,
} from "lucide-react";

const SERVICES = [
  {
    id: "mani-pedi",
    title: "Sweet Sassy Mani–Pedi",
    blurb:
      "Mini mani-pedis with fruity massaging care, glitter nails, and glossy finish.",
    icon: <Hand className="h-7 w-7" />,
    href: "/services/mani-pedi",
  },
  {
    id: "diva-package",
    title: "The Diva Package",
    blurb:
      "Braids, mini facial, nail art & shimmer—our full princess experience.",
    icon: <Sparkles className="h-7 w-7" />,
    href: "/services/diva",
  },
  {
    id: "men-scrub",
    title: "Men’s Body Scrub",
    blurb:
      "Full-body exfoliation for energized, smooth skin. Goodbye dullness.",
    icon: <Bath className="h-7 w-7" />,
    href: "/services/mens-scrub",
  },
  {
    id: "lillys-court",
    title: "Lilly’s Court",
    blurb:
      "Exclusive men’s grooming zone—premium care, privacy & refreshments.",
    icon: <Gem className="h-7 w-7" />,
    href: "/services/lillys-court",
  },
  {
    id: "haircut-styling",
    title: "Haircut & Styling",
    blurb: "Signature cuts and blowouts tailored to your face shape.",
    icon: <Scissors className="h-7 w-7" />,
    href: "/services/haircut-styling",
  },
  {
    id: "herbal-facial",
    title: "Herbal Facial",
    blurb: "Botanical cleanse, steam & mask for calm, radiant skin.",
    icon: <Leaf className="h-7 w-7" />,
    href: "/services/herbal-facial",
  },
  {
    id: "body-polish",
    title: "Body Polish",
    blurb: "Silky-soft skin with gentle exfoliation & deep hydration.",
    icon: <Flower2 className="h-7 w-7" />,
    href: "/services/body-polish",
  },
  {
    id: "bridal-glow",
    title: "Bridal Glow",
    blurb: "Curated pre-wedding ritual for picture-perfect radiance.",
    icon: <HeartPulse className="h-7 w-7" />,
    href: "/services/bridal",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-rose-500">
          Our Services
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-rose-900 sm:text-5xl">
          Care. Craft. Confidence.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-rose-900/70">
          Dive into our world of signature treatments at our renowned beauty
          salon in Colombo.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SERVICES.map((s) => (
          <a
            key={s.id}
            href={s.href}
            className="group relative overflow-hidden rounded-3xl border border-rose-100/70 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-500 ring-1 ring-inset ring-rose-100">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-rose-900">{s.title}</h3>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-rose-900/70">
              {s.blurb}
            </p>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-rose-100/70 px-3 py-1 text-xs font-medium text-rose-700 opacity-0 transition group-hover:opacity-100">
              Explore
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

import React, { useState } from "react";

const T = {
  bg: "#FEF4F1",
  accent: "#FBAA99",
  dark: "#4D423A",
  black: "#000000",
  white: "#FFFFFF",
  lightGray: "#F8F8F8",
};

export default function AboutUs() {
  const [activeStat, setActiveStat] = useState(null);

  const stats = [
    { number: "5+", label: "Years Experience", icon: "🎯" },
    { number: "250+", label: "Happy Clients", icon: "😊" },
    { number: "20+", label: "Services", icon: "💫" },
  ];

  const features = [
    { icon: "⭕", text: "Expert stylists for hair, nails & spa" },
    { icon: "⭕", text: "Premium products & hygienic care" },
    { icon: "⭕", text: "Personalized consultations & makeovers" },
  ];

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        
        {/* Image Section with Modern Layout */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="/bg3.jpg"
              alt="Modern salon experience at Pink Aura"
              className="h-[500px] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-accent/10 mix-blend-overlay" />
          </div>
          
          {/* Floating Stats Cards */}
          <div className="absolute -bottom-6 -right-6 grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 text-center backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                  activeStat === index 
                    ? "scale-110 shadow-2xl" 
                    : "scale-100 shadow-lg hover:scale-105"
                }`}
                style={{ 
                  background: activeStat === index ? T.accent : T.white,
                  color: activeStat === index ? T.white : T.dark,
                }}
                onMouseEnter={() => setActiveStat(index)}
                onMouseLeave={() => setActiveStat(null)}
              >
                <div className="text-2xl font-bold">{stat.number}</div>
                <div className="text-xs font-medium opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          <div>
            
            <p className="mt-6 text-xl leading-9"
               style={{ color: T.dark }}>
              At Pink Aura, we're redefining the salon experience in Matara. Our unisex studio 
              combines expert craftsmanship with genuine care, creating a sanctuary where every 
              visit feels welcoming, relaxing, and authentically you.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 group">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ 
                    background: `${T.accent}15`,
                    border: `2px solid ${T.accent}30`
                  }}
                >
                  {feature.icon}
                </div>
                <span 
                  className="text-lg font-medium transition-colors duration-300 group-hover:text-accent"
                  style={{ color: T.dark }}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-6">
            <a
              href="/services"
              className="group relative overflow-hidden rounded-2xl px-8 py-4 font-semibold transition-all duration-300 hover:shadow-2xl"
              style={{
                background: T.accent,
                color: T.white,
              }}
            >
              <span className="relative z-10">Explore Our Services</span>
              <div 
                className="absolute inset-0 translate-y-full bg-black/10 transition-transform duration-300 group-hover:translate-y-0"
              />
            </a>
              </div>

        </div>
      </div>
    </section>
  );
}
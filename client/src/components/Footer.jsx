import React from "react";
import { assets } from "../assets/assets";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#000000] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        {/* Brand */}
        <div>
          <img src={assets.logo} alt="Pink Aura" className="h-14 w-14 rounded-full" />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Hair & Beauty • Unisex
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" className="text-white/80 hover:text-white">Facebook</a>
            <a href="#" className="text-white/80 hover:text-white">Instagram</a>
            <a href="#" className="text-white/80 hover:text-white">TikTok</a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-[#FBAA99]">
            QUICK LINKS
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="text-white/80 hover:text-white" href="/">Home</a></li>
            <li><a className="text-white/80 hover:text-white" href="/about">About</a></li>
            <li><a className="text-white/80 hover:text-white" href="/policies">Terms & Policies</a></li>
            <li><a className="text-white/80 hover:text-white" href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-[#FBAA99]">
            CONTACT US
          </h4>
          <div className="mt-3 space-y-2 text-sm text-white/80">
            <p><span className="text-white/60">Opening Times:</span> Tue–Sun 9:00am–7:00pm</p>
            <p><span className="text-white/60">Phone:</span> +94 77 388 5122</p>
            <p><span className="text-white/60">Location:</span> No.6, Pagoda Road, Nugegoda, 10250</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} Pink Aura Salon • Designed & Developed by Ants
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import ServicesSection from "../sections/ServicesSection";
import { Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('/bg4.jpg')] bg-cover bg-center">
      
      <div className="min-h-screen bg-gradient-to-b from-black/30 via-white/0 to-white/80">
        <Navbar />

        
        <header className="relative">
          <Header />
        </header>

        {/* SERVICES */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServicesSection />
        </main>

        {/* CTA band */}
        <section className="mx-auto mt-16 max-w-6xl rounded-3xl bg-rose-50/80 p-8 text-center backdrop-blur">
          <h3 className="text-2xl font-semibold tracking-tight text-rose-900">
            Ready to glow?
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-rose-900/70">
            Book your appointment and experience our signature care in Colombo.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="/appointments/book"
              className="rounded-full bg-rose-500 px-6 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-600"
            >
              Book Now
            </a>
            <a
              href="/services"
              className="rounded-full border border-rose-300 bg-white/70 px-6 py-3 text-rose-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-rose-400"
            >
              View All Services
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-rose-100/60 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-rose-900/70">
                © {new Date().getFullYear()} Pink Aura Salon. All rights reserved.
              </p>
              <nav className="flex gap-6 text-sm">
                <a className="text-rose-900/70 hover:text-rose-900" href="/about">
                  About
                </a>
                <a className="text-rose-900/70 hover:text-rose-900" href="/contact">
                  Contact
                </a>
                <a className="text-rose-900/70 hover:text-rose-900" href="/policies">
                  Policies
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </div>

      {/* WhatsApp / quick call floating action */}
      <a
        href="tel:+94XXXXXXXXX"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-white shadow-xl transition hover:bg-rose-600"
        aria-label="Call us"
      >
        <Phone size={18} />
        <span className="hidden sm:inline">Call Us</span>
      </a>
    </div>
  );
}

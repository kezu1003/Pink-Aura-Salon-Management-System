import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import HeroVideo from "../components/HeroVideo";
import GalleryFeature from "../components/GalleryFeature";
import MapAndBranches from "../components/MapAndBranches";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ServicesSection from "../sections/ServicesSection";
import { Phone } from "lucide-react";
import { AppContext } from "../context/AppContext";
import AboutUs from "../sections/AboutUs";
import ContactUs from "../sections/ContactUs";
import Chatbot from "../AI/chatbot.jsx"; 


export default function Home() {
  const { userData } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-[#FEF4F1]">
      <Navbar />

      <main className="pt-20">
        {!userData ? (
          <>
            {/* Pre-login view */}
            <HeroVideo />
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
              <GalleryFeature />
            </section>

            <section className="mx-auto max-w-7xl px-4 sm:px-6">
              <AboutUs />
            </section>

            <section className="border-t border-[#4D423A]/10 bg-[#FFFFFF]">
              <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <MapAndBranches />
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Logged-in view */}
            <div
              className="relative min-h-screen bg-cover bg-center"
              style={{ backgroundImage: "url('/bg05.jpg')" }}
            >

              <div className="absolute inset-0 flex items-center justify-cente">
                <Header />
              </div>


            </div>

            <Chatbot />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ServicesSection />
            </main>

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

            <section className="mx-auto max-w-7xl px-4 sm:px-6">
              <AboutUs />
            </section>
            
          </>
        )}
      </main>

      <ContactUs />

      <Footer />

      {/* Floating call button stays for both *
      <a
        href="tel:+94703154962"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#FBAA99] px-4 py-3 text-gray shadow-xl transition hover:bg-[#FEF4F1]"
        aria-label="Call us"
      >
        <Phone size={18} />
        <span className="hidden sm:inline">Call Us</span>
      </a>  */}
    </div>
  );
}

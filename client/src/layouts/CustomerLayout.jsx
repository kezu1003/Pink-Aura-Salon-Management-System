import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FEF4F1]">
     
      <Navbar />

      
      <main className="pt-20">{children}</main>

      
      <Footer />
    </div>
  );
}

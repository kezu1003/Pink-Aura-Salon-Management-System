import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FALLBACK_CATEGORIES = ["All", "Hair", "Nails", "Makeup", "Facials", "Other"];

export default function Services() {
  const { backendUrl } = useContext(AppContext);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [activeCat, setActiveCat] = useState("All");
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("activeOnly", "true");
      params.set("group", "true");
      if (activeCat !== "All") params.set("category", activeCat);
      if (q) params.set("q", q);

      const { data } = await axios.get(`${backendUrl}/api/services?${params.toString()}`);
      if (data.success) {
        setGroups(data.groups || []);
        setCategories(["All", ...(data.categories || FALLBACK_CATEGORIES.filter((c) => c !== "All"))]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial load
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [activeCat, q]);

  // Scroll to services
  const handleScroll = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#FEF4F1] min-h-screen">
      <Navbar />
      <div className="h-20" />

      {/* Image */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-top"
        style={{ backgroundImage: "url('/serv01.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" /> {/* dark overlay */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white">
            Beauty Redefined at Sri Lanka’s Favourite Ladies Salon
          </h1>
          <p className="mt-6 text-white/90 max-w-2xl mx-auto">
            Treat yourself with a self-care experience like never before — book your appointment today,
            and discover why we’re the best ladies salon in Colombo!
          </p>

          {/* Glass button */}
          <button
            onClick={handleScroll}
            className="mt-10 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium shadow-lg hover:bg-white/30 transition"
          >
            Go for Services
          </button>
        </div>
      </section>

      {/* Filters Section */}
      <div id="services-section" className="border-t border-[#FBAA99]/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-4 py-2 rounded-full border ${
                  activeCat === c
                    ? "bg-[#FBAA99] text-white border-[#FBAA99]"
                    : "bg-[#FEF4F1] hover:bg-[#FDE3DA]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services…"
              className="px-3 py-2 rounded-lg border border-[#FBAA99]"
            />
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center text-gray-500">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="text-center text-gray-500">No services found.</div>
        ) : (
          groups.map((g) => (
            <section key={g.category} className="mb-10">
              <h2 className="text-3xl font-serif mb-4">{g.category}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {g.items.map((s) => (
                  <article
                    key={s._id}
                    className="rounded-2xl border bg-white p-4
                               transform transition duration-300 ease-in-out
                               hover:shadow-2xl hover:-translate-y-1 hover:scale-105"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-[#4D423A]">{s.name}</h3>
                      <span className="text-[#FBAA99] font-semibold">
                        Rs. {s.price?.toLocaleString?.() ?? s.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</p>
                    <div className="mt-3 text-sm text-[#4D423A]/70">{s.durationMins} mins</div>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/appointments/book?service=${s._id}`)}
                        className="w-full px-4 py-2 rounded-lg bg-[#FBAA99] text-white hover:opacity-90"
                      >
                        Book now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}

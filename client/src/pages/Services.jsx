import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

// ✅ Added
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ✅ Import your icons/images
import LashIcon from "../assets/icons/lash.png";
import ScrubIcon from "../assets/icons/scrub.png";
import FaceIcon from "../assets/icons/face.png";
import MassageIcon from "../assets/icons/massage.png";
import BgImage from "../assets/bg/salon-bg.jpg"; // background image

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

  useEffect(() => { load(); }, []); // initial
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [activeCat, q]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${BgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/70 backdrop-blur-sm min-h-screen">
        <Navbar />
        <div className="h-20" />

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 text-center py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-slate-900">
            Our Services
          </h1>

          <p className="mt-6 text-gray-700">
            Dive into our world of care and signature treatments at our renowned beauty salon in Colombo.
          </p>

          {/* Floating Services Set */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Lash Extensions", icon: LashIcon },
              { label: "Body Scrub", icon: ScrubIcon },
              { label: "Face Threading", icon: FaceIcon },
              { label: "Head Massage", icon: MassageIcon },
            ].map((item, idx) => (
              <div key={idx} className="group text-center">
                <div className="mx-auto w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center ring-1 ring-pink-100 group-hover:shadow-2xl transition">
                  <img src={item.icon} alt={item.label} className="w-12 h-12" />
                </div>
                <div className="h-1 w-12 bg-pink-400 mx-auto mt-4 rounded-full" />
                <div className="mt-3 font-serif text-xl text-gray-800">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <div className="border-t">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`px-4 py-2 rounded-full border ${
                    activeCat === c ? "bg-pink-500 text-white border-pink-500" : "bg-white hover:bg-pink-50"
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
                className="px-3 py-2 rounded-lg border"
              />
            </div>
          </div>
        </div>

        {/* Groups */}
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
                      className="rounded-2xl border bg-white p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{s.name}</h3>
                        <span className="text-pink-600 font-semibold">
                          Rs. {s.price?.toLocaleString?.() ?? s.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</p>
                      <div className="mt-3 text-sm text-gray-700">{s.durationMins} mins</div>
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/appointments/book?service=${s._id}`)}
                          className="w-full px-4 py-2 rounded-lg bg-pink-500 text-white hover:opacity-90"
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
    </div>
  );
}

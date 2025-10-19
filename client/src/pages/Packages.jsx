import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { makePackagesApi } from "../api/packages";
import PackageCard from "../components/PackageCard";
import PackageDetailsModal from "../components/PackageDetailsModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Packages() {
  const { backendUrl } = useContext(AppContext);
  const api = useMemo(() => makePackagesApi(backendUrl), [backendUrl]);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const { success, packages, categories: cats, message } = await api.list({
        q,
        category: category === "All" ? "" : category,
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        sort,
        activeOnly: "true",
      });
      if (!success) return toast.error(message || "Failed to load packages");
      setItems(packages || []);
      if (Array.isArray(cats)) setCategories(cats);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, category, minPrice, maxPrice, sort]);

  const onCardClick = (pkg) => setSelected(pkg);
  const onCloseModal = () => setSelected(null);
  const onBookNow = () => {
    navigate(`/book?package=${selected._id}`);
  };

  return (
    <div className="bg-[#FEF4F1] min-h-screen">
      <Navbar />

      {/* Top Image Section */}
      <div className="relative">
        <img
          src="/pkg02.jpg"
          alt="Salon Packages"
          className="w-full h-[450px] md:h-[600px] lg:h-[510px] object-cover rounded-lg shadow-lg object-cover brightness-60"
        />

        {/* Text + Glass Button */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif text-white drop-shadow-lg">
            Salon Packages
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-md">
            Explore our carefully curated salon packages to pamper your hair,
            nails, and overall wellness. Luxurious care tailored just for you.
          </p>

          {/* Glass-style button */}
          <button
            onClick={() => {
              const categorySection = document.querySelector("#category-tabs");
              if (categorySection) {
                categorySection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-6 py-2 mt-4 text-white backdrop-blur-md bg-white/20 border border-white/40 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300"
          >
            Explore Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Category Tabs */}
        <div id="category-tabs" className="mb-6 flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 font-medium rounded-lg transition-transform transform ${
                category === c
                  ? "bg-[#F57C5B] text-white shadow-lg scale-105"
                  : "bg-[#FFEDD9] text-[#F57C5B] hover:bg-[#F57C5B] hover:text-white shadow-md"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search packages..."
            className="px-3 py-2 rounded-lg border border-[#F57C5B]"
          />
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            min="0"
            placeholder="Min Price"
            className="px-3 py-2 rounded-lg border border-[#F57C5B]"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            min="0"
            placeholder="Max Price"
            className="px-3 py-2 rounded-lg border border-[#F57C5B]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#F57C5B]"
          >
            <option value="new">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No packages found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((p) => (
              <PackageCard key={p._id} pkg={p} onClick={() => onCardClick(p)} />
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selected && (
          <PackageDetailsModal
            pkg={selected}
            onClose={onCloseModal}
            onBook={onBookNow}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

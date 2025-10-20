import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { fadeUp, gridStagger } from "../components/motion";
import QuickView from "../components/QuickView";
import HeroCarousel from "../components/HeroShop";
import { Sparkles } from "lucide-react"; 
import CategoryGallery from "../components/product/CategoryGallery";
import SectionRibbon from "../components/product/SectionRibbon";
import BrandGallery from "../components/product/BrandGallery";
import ProToolsPanel from "../components/product/ProToolsPanel";




export default function Shop() {
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Quick View
  const [quickId, setQuickId] = useState(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const params = useMemo(
    () => ({
      category: category || undefined,
      brand: brand || undefined, 
      q: q || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      order,
      page,
      limit,
    }),
    [category, brand, q, minPrice, maxPrice, sort, order, page]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/products", { params });
        if (!active) return;
        setRows(data.products || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const SkeletonCard = () => (
    <div className="h-72 rounded-2xl border bg-white/60 shadow-silk overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.2s_infinite]" />
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
    </div>
  );

  const openQuick = (id) => {
    setQuickId(id);
    setQuickOpen(true);
  };
  const closeQuick = () => setQuickOpen(false);


const slides = [
  {
    image: "/banners/hero1.jpg",  
    title: "Elevate Your Beauty Routine",
    subtitle: "Master the art of beauty with our comprehensive training programs.",
    badge: { text: "Glamour Must-Haves", icon: <Sparkles size={14} /> },
    
  },
  {
    image: "/banners/hero2.jpg",
    title: "Elite Beauty Essentials",
    subtitle: "Premium products hand-picked by our in-house specialists.",
    
  },
  {
    image: "/banners/hero3.jpg",
    title: "Makeup That Elevates Your Look",
    subtitle: "From day-glow to glam — find your perfect finish.",
    
  },
];


const categoryTiles = [
  { value: "Hair Care Products",   label: "Hair",        image: "/categories/hair-category.jpg" },
  { value: "Nail Care Products",   label: "Nails",       image: "/categories/nail-category.jpg" },
  { value: "Skincare Products",    label: "Skincare",    image: "/categories/skin-category.jpg" },
  { value: "Makeup Products",      label: "Makeup",      image: "/categories/makeup-category.jpg" },
  
];

const brandTiles = [
  { value: "Seren Cosmetics",       label: "Seren Cosmetics", image: "/brands/Seren_Cosmetics.jpg" },
  { value: "Basicare",              label: "Basicare",        image: "/brands/Basicare.png" },
  { value: "Maybelline",            label: "Maybelline",      image: "/brands/Maybelline.jpg" },
  { value: "Oreal",                 label: "Oreal",           image: "/brands/Oreal.jpg" },
  { value: "Dove",                  label: "Dove",            image: "/brands/Dove.jpg" },
  { value: "Dr. Rashel",            label: "Dr. Rashel",      image: "/brands/Rashel.webp" },
  { value: "Aussie",                label: "Aussie",          image: "/brands/Aussie.webp" },
  { value: "Femfresh",              label: "Femfresh",        image: "/brands/Femfresh.png" },
  { value: "Anua",                  label: "Anua",            image: "/brands/Anua.webp" },
  { value: "CeraVe",                label: "CeraVe",          image: "/brands/CeraVe.webp" },
  { value: "Banana Boat",           label: "Banana Boat",     image: "/brands/Banana_Boat.jpg" },
  { value: "Boots",                 label: "Boots",           image: "/brands/Boots.png" },
];



  return (
    <div className="min-h-screen bg-white">
      <Navbar /> 
      <div className="h-16 md:h-20" />

      {/*  Slides */}
      <section className="px-4 md:px-8 lg:px-12">
         <HeroCarousel slides={slides} />
      </section>

      {/* HERO BAND */}
      <section className="relative w-full">
        <div className="px-4 md:px-8 lg:px-12 py-8 md:py-10">
          <motion.div {...fadeUp} className="text-center">
            <h1 className="font-display text-3xl md:text-4xl text-gray-900 tracking-tight">
              Essential Glamour for You
            </h1>
          
          </motion.div>

        </div>
      </section>

        {/* category  */}

      <SectionRibbon text="SHOP BY CATEGORY"  className=" mb-8" />
      <section className="px-4 md:px-8 lg:px-12">
        <CategoryGallery
          value={category}
          items={categoryTiles}
          onChange={(c) => {
           setCategory(c);
           setPage(1);
     
      setTimeout(() => document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }}
    />
      </section>

    <SectionRibbon text="SHOP BY BRAND" className="mt-10 mb-8" />

    <section className="px-4 md:px-8 lg:px-12 ">
      <BrandGallery
  items={[
    { value: "", label: "All", image: "/brands/all.jpg" },
    { value: "Seren Cosmetics", label: "Seren Cosmetics", image: "/brands/Seren_Cosmetics.jpg" },
    { value: "Basicare", label: "Basicare", image: "/brands/Basicare.png" },
    { value: "Maybelline", label: "Maybelline", image: "/brands/Maybelline.png" },
    { value: "Oreal", label: "Oreal", image: "/brands/Oreal.jpg" },
    { value: "Dove", label: "Dove", image: "/brands/Dove.jpg" },
    { value: "Dr. Rashel", label: "Dr. Rashel", image: "/brands/Rashel.webp" },
    { value: "Aussie", label: "Aussie", image: "/brands/Aussie.webp" },
    { value: "Femfresh", label: "Femfresh", image: "/brands/Femfresh.png" },
    { value: "Anua", label: "Anua", image: "/brands/Anua.webp" },
    { value: "CeraVe", label: "CeraVe", image: "/brands/CeraVe.webp" },
    { value: "Banana Boat", label: "Banana Boat", image: "/brands/Banana_Boat.jpg" },
    { value: "Boots", label: "Boots", image: "/brands/Boots.png" },
  ]}
  value={brand}
  onChange={(val) => {
    setBrand(val);
    setPage(1);
    
    setTimeout(() => document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }}
/>
    </section>

      <div className="mt-10 md:mt-14">
        <ProToolsPanel />
      </div>

      {/* FILTER DOCK  */}
      <div className=" top-16 md:top-20 z-10 w-full mb-8">
        <motion.div
          {...fadeUp}
          className="mx-4 md:mx-8 lg:mx-12 rounded-2xl border bg-white/70 backdrop-blur-12 p-3 shadow-silk"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Search products..."
              className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-rosePrimary focus:border-rosePrimary transition-all"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <input
              type="number"
              placeholder="Min price"
              className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-rosePrimary focus:border-rosePrimary transition-all"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
            />
            <input
              type="number"
              placeholder="Max price"
              className="border rounded-xl px-3 py-2 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-rosePrimary focus:border-rosePrimary transition-all"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex gap-2">
              <select
                className="border rounded-xl px-3 py-2 w-full bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-rosePrimary focus:border-rosePrimary transition-all"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
              <select
                className="border rounded-xl px-3 py-2 w-full bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-rosePrimary focus:border-rosePrimary transition-all"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div {...fadeUp} className="text-center mb-8">
            
            <p className="text-sm text-gray-600 mt-2">
              {loading ? "Loading products…" : `${total} item${total === 1 ? "" : "s"} found`}
            </p>
          </motion.div>

      <main className="w-full py-6">
        <div className="px-4 md:px-8 lg:px-12">
          {loading ? (
            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <motion.div {...fadeUp} className="py-16 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-pink-100 mb-4 flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
              <p className="text-gray-600">No products found.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={gridStagger}
              initial="initial"
              animate="animate"
              className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            >
              {rows.map((p) => (
                <motion.div key={p._id}>
                  <ProductCard product={p} onQuickView={() => openQuick(p._id)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination  */}
          <motion.div  id="shop-grid" {...fadeUp} className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border bg-white/80 backdrop-blur shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-rosePrimary hover:text-rosePrimary hover:shadow-md hover:-translate-y-0.5 transition"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600 px-3 py-2 rounded-lg bg-white/60 border">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border bg-white/80 backdrop-blur shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-rosePrimary hover:text-rosePrimary hover:shadow-md hover:-translate-y-0.5 transition"
            >
              Next
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Quick View modal at page root */}
      <QuickView id={quickId} open={quickOpen} onClose={closeQuick} />
    </div>
  );
}

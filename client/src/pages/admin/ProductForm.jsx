import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FancySelect from "../../components/product/ui/FancySelect";
import { motion } from "framer-motion";
import {
  Sparkles,
  CreditCard,
  Tag,
  Layers,
  Calendar,
  Image as ImageIcon,
  Boxes,
  CheckCircle2,
} from "lucide-react";

const todayLocalISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};


const CATS = [
  "Hair Care Products",
  "Nail Care Products",
  "Skincare Products",
  "Makeup Products",
];

const SKIN_TYPES = [
  "All Skin Types",
  "Dry Skin",
  "Oily Skin",
  "Combination Skin",
  "Sensitive Skin",
  "Normal Skin",
  "Mature Skin",
  "Acne-Prone Skin",
];

const BRANDS = [
  "Anua",
  "Aussie",
  "Banana Boat",
  "Basicare",
  "Boots",
  "CeraVe",
  "Dove",
  "Dr. Rashel",
  "Femfresh",
  "Maybelline",
  "Seren Cosmetics",
];


const container = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

function FieldShell({ label, icon, children, required }) {
  return (
    <motion.div variants={item} className="group">
      <div className="mb-1 flex items-center gap-2 text-[13px] text-gray-600">
        {icon ? <span className="text-gray-500">{icon}</span> : null}
        <span className="font-medium">{label}</span>
        {required ? <span className="text-rosePrimary">*</span> : null}
      </div>
      <div className="relative">
        {children}
      
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 group-focus-within:ring-2 group-focus-within:ring-rosePrimary/40 transition" />
      </div>
    </motion.div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border bg-white/80 backdrop-blur px-3.5 py-2.5 " +
        "outline-none transition ring-0 focus:ring-2 focus:ring-rosePrimary/40 " +
        "border-gray-200 focus:border-rosePrimary/60 " +
        className
      }
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border bg-white/80 backdrop-blur px-3.5 py-2.5 " +
        "outline-none transition ring-0 focus:ring-2 focus:ring-rosePrimary/40 " +
        "border-gray-200 focus:border-rosePrimary/60 " +
        className
      }
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-xl border bg-white/80 backdrop-blur px-3.5 py-3 " +
        "outline-none transition ring-0 focus:ring-2 focus:ring-rosePrimary/40 " +
        "border-gray-200 focus:border-rosePrimary/60 " +
        className
      }
    />
  );
}

function ImageRow({ url, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-14 w-20 overflow-hidden rounded-lg bg-gray-100 border">
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-content-center text-gray-400">
            <ImageIcon size={18} />
          </div>
        )}
      </div>
      <Input
        value={url}
        onChange={onChange}
        placeholder="https://…"
        className="flex-1"
      />
      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 rounded-lg border hover:bg-white transition"
      >
        Remove
      </button>
    </div>
  );
}

/**  Page **/
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    description: "",
    images: [""],
    stock: "",
    expiryDate: "",
    skinType: "All Skin Types",
    isActive: true,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        const p = data.product;
        setForm({
          name: p.name ?? "",
          category: p.category ?? "",
          brand: p.brand ?? "",
          price: p.price ?? "",
          description: p.description ?? "",
          images: p.images?.length ? p.images : [""],
          stock: p.stock ?? "",
          expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0, 10) : "",
          skinType: p.skinType ?? "All Skin Types",
          isActive: p.isActive ?? true,
        });
      } catch (e) {
        toast.error("Failed to fetch product");
      }
    })();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
      };
      const { data } = id
        ? await api.put(`/api/products/${id}`, payload)
        : await api.post(`/api/products`, payload);
      if (data.success) {
        toast.success(id ? "Updated" : "Created");
        navigate("/admin/products");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
          className="mb-6 rounded-2xl border bg-white/70 backdrop-blur shadow-silk p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-gray-900">
                {id ? "Edit Product" : "New Product"}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Enter product details — elegant, fast, and silky smooth ✨
              </p>
            </div>
            <Sparkles className="text-rosePrimary/70" />
          </div>
        </motion.div>

        {/* Form shell */}
        <motion.form
          onSubmit={submit}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-5 rounded-2xl border bg-white/70 backdrop-blur-12 p-5 shadow-silk"
        >
          {/* Name */}
          <FieldShell label="Name" icon={<Tag size={16} />} required>
            <Input
              required
              placeholder="e.g., Hydrating Face Serum"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FieldShell>

          {/*  Category / Brand / Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldShell label="Category" icon={<Layers size={16} />} required>
              <FancySelect
                value={form.category}
                onChange={(v) => set("category", v)}
                required
                options={CATS.map(c => ({label: c, value: c}))}
              />
            </FieldShell>

            <FieldShell label="Brand" icon={<CheckCircle2 size={16} />} required>
            <FancySelect
               required
               value={form.brand}
               onChange={(v) => set("brand", v)}
               options={BRANDS.map((b) => ({ label: b, value: b }))}
               placeholder="Select…"
             />
            </FieldShell>

            <FieldShell label="Price (LKR)" icon={<CreditCard size={16} />} required>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </FieldShell>
          </div>

          {/* Skin type */}
          <FieldShell label="Skin Type" icon={<Sparkles size={16} />}>
            <FancySelect
              value={form.skinType}
              onChange={(v) => set("skinType", v)}
              options={SKIN_TYPES.map(s => ({label: s, value: s}))}
            />
          </FieldShell>

          {/* Description */}
          <FieldShell label="Description">
            <Textarea
              rows={4}
              placeholder="Brief, benefits, key ingredients…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FieldShell>

          {/* Images */}
          <FieldShell label="Images (URLs)" icon={<ImageIcon size={16} />}>
            <div className="grid gap-3">
              {form.images.map((url, idx) => (
                <ImageRow
                  key={idx}
                  url={url}
                  onChange={(e) => {
                    const copy = [...form.images];
                    copy[idx] = e.target.value;
                    set("images", copy);
                  }}
                  onRemove={() => {
                    const copy = [...form.images];
                    copy.splice(idx, 1);
                    set("images", copy.length ? copy : [""]);
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => set("images", [...form.images, ""])}
                className="self-start px-3 py-2 rounded-lg border bg-white/70 hover:bg-white transition"
              >
                + Add image URL
              </button>
            </div>
          </FieldShell>

          {/* Stock / Expiry / Active */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldShell label="Stock" icon={<Boxes size={16} />} required>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                required
              />
            </FieldShell>

             <FieldShell label="Expiry Date" icon={<Calendar size={16} />}> 
                <Input 
                  type="date" 
                  min={todayLocalISO()}                   
                  value={form.expiryDate} 
                  onChange={(e) => { 
                    const v = e.target.value; 
                  
                    if (v && v < todayLocalISO()) { 
                      set("expiryDate", todayLocalISO()); 
                    } else { 
                      set("expiryDate", v); 
                    } 
                  }} 
                /> 
              </FieldShell>



            <motion.div variants={item} className="flex items-end">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/70 hover:bg-white transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                />
                <span className="text-sm">Active</span>
              </label>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            variants={item}
            className="mt-2 flex items-center gap-3 justify-end"
          >
            <button
              type="button"
              className="px-4 py-2 rounded-lg border bg-white/70 hover:bg-white transition"
              onClick={() => history.back()}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 rounded-lg bg-onyx text-white font-medium hover:opacity-95 active:scale-[0.99] transition"
              type="submit"
            >
              {id ? "Save Changes" : "Create Product"}
            </button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}

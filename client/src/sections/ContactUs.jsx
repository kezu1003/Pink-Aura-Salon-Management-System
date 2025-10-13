import React, { useState } from "react";
import { toast } from "react-toastify";
import { sendContactMessage } from "../api/contact";

const T = {
  bg: "#FEF4F1",
  accent: "#FBAA99",
  dark: "#4D423A",
  white: "#FFFFFF",
};

export default function ContactUs() {
  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await sendContactMessage(form);
      toast.success("Thanks! We’ll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTab("details");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="border-t"
      style={{ borderColor: `${T.dark}18`, background: T.white }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold" style={{ color: T.dark }}>
            Contact Us
          </h2>

          <div className="rounded-full bg-white p-1 shadow-sm">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "details" ? "shadow" : ""
              }`}
              onClick={() => setTab("details")}
              style={{
                color: tab === "details" ? T.dark : `${T.dark}AA`,
                background: tab === "details" ? "#fff" : "transparent",
              }}
            >
              Details
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "email" ? "shadow" : ""
              }`}
              onClick={() => setTab("email")}
              style={{
                color: tab === "email" ? T.dark : `${T.dark}AA`,
                background: tab === "email" ? "#fff" : "transparent",
              }}
            >
              Email Us
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Map Section */}
          <div
            className="overflow-hidden rounded-3xl border bg-white shadow"
            style={{ borderColor: `${T.dark}22` }}
          >
            {/* Google Map: 5/75, Nandana, Danwalawatta, Wewahamanduwa, Matara */}
            <div
              className="relative w-full"
              style={{ paddingTop: "56.25%" /* 16:9 ratio */ }}
            >
              <iframe
                title="Pink Aura Salon Location Map"
                className="absolute left-0 top-0 h-full w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent(
                    "5/75, Nandana, Danwalawatta, Wewahamanduwa, Matara, Sri Lanka"
                  ) +
                  "&z=16&output=embed"
                }
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: `${T.dark}CC` }}>
                5/75, Nandana, Danwalawatta, Wewahamanduwa, Matara, Sri Lanka
              </p>
              <a
                href={
                  "https://www.google.com/maps/search/?api=1&query=" +
                  encodeURIComponent(
                    "5/75, Nandana, Danwalawatta, Wewahamanduwa, Matara, Sri Lanka"
                  )
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-4 py-2 text-sm font-medium shadow transition hover:-translate-y-0.5"
                style={{
                  background: T.accent,
                  color: "#fff",
                  boxShadow: "0 10px 24px rgba(251,170,153,.35)",
                }}
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Card */}
          <div
            className="overflow-hidden rounded-3xl border bg-white shadow"
            style={{ borderColor: `${T.dark}22` }}
          >
            {tab === "details" ? (
              <div className="p-8">
                <div className="mb-5 text-center">
                  <div
                    className="mx-auto mb-2 h-12 w-12 rounded-2xl"
                    style={{ background: `${T.accent}26` }}
                  />
                  <h3
                    className="text-2xl font-semibold"
                    style={{ color: T.dark }}
                  >
                    Pink Aura Salon
                  </h3>
                </div>

                <div
                  className="space-y-3 text-center"
                  style={{ color: `${T.dark}CC` }}
                >
                  <p>
                    <strong>Phone:</strong> +94 70 315 4962
                  </p>
                  <p>
                    <strong>Email:</strong> salon.pinkaura@gmail.com
                  </p>
                  <p>
                    <strong>Address:</strong> 5/75, Nandana, Danwalawatta, Wewahamanduwa, Matara, Sri Lanka
                  </p>
                </div>

                <div className="mt-8 flex justify-center">
                  <a
                    href="https://maps.google.com/?q=Stratford+Ave+Colombo+06"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full px-6 py-3 font-medium shadow transition"
                    style={{
                      background: T.accent,
                      color: "#fff",
                      boxShadow: "0 10px 24px rgba(251,170,153,.35)",
                    }}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ) : (
              <form className="p-8 space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#d63384] transition"
                      style={{ borderColor: `${T.dark}33` }}
                      placeholder="Your name"
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, email: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#d63384] transition"
                      style={{ borderColor: `${T.dark}33` }}
                      placeholder="you@example.com"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone (optional)">
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, phone: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#d63384] transition"
                      style={{ borderColor: `${T.dark}33` }}
                      placeholder="+94 ..."
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      value={form.subject}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, subject: e.target.value }))
                      }
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#d63384] transition"
                      style={{ borderColor: `${T.dark}33` }}
                      placeholder="How can we help?"
                      required
                    />
                  </Field>
                </div>

                <Field label="Message">
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, message: e.target.value }))
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#d63384] transition"
                    style={{ borderColor: `${T.dark}33` }}
                    placeholder="Tell us a bit more..."
                    required
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl px-6 py-3 font-semibold shadow transition disabled:opacity-70 hover:-translate-y-0.5"
                  style={{
                    background: T.accent,
                    color: "#fff",
                    boxShadow: "0 10px 24px rgba(251,170,153,.35)",
                  }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-sm font-medium"
        style={{ color: "#4D423A" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

export default function AdminLogin() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext) || {};
  const { backendUrl, setIsLoggedin, getUserData } = ctx;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!backendUrl) throw new Error("Missing backendUrl in AppContext");
      const { data } = await axios.post(
        `${backendUrl}/api/auth/admin-staff-login`,
        { email, password, role: "admin" },
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Login failed");
        return;
      }

      setIsLoggedin && setIsLoggedin(true);
      getUserData && getUserData();

      const r = data.user?.role;
      if (r === "admin") navigate("/admin");
      else if (r === "staff" || r === "supplier") navigate("/staff");
      else navigate("/");

      toast.success("Welcome, Admin!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg1.jpg')] bg-cover bg-center relative">
      {/* Header (same as customer) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-25 items-center justify-between bg-white/70 backdrop-blur-md shadow px-4 sm:px-6">
        <img
          onClick={() => navigate("/")}
          src={assets?.logo}
          alt="Logo"
          className="w-20 sm:w-24 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-full bg-rose-50 px-5 py-2 text-sm sm:text-base font-semibold text-rose-700 shadow hover:bg-rose-100 hover:shadow-md transition"
        >
          Home
        </button>
      </header>

      {/* Body */}
      <main className="relative mx-auto max-w-7xl px-5 lg:px-10 pt-40 md:pt-44 pb-24 min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex items-start justify-start">
          <div className="w-full max-w-md">
            <div className="relative rounded-3xl border border-white/40 bg-white/65 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              {/* Heading */}
              <div className="mb-5 text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-rose-900">
                  Admin Login
                </h2>
                <p className="mt-1.5 text-sm text-rose-700/80">
                  Sign in to manage your salon
                </p>
              </div>

              {/* Single tab (login) */}
              <div className="mb-5 grid grid-cols-1 rounded-full bg-white/70 p-1 shadow-sm">
                <span className="rounded-full py-2 text-sm font-medium bg-gradient-to-r from-rose-300 to-rose-200 text-rose-900 text-center shadow">
                  Login
                </span>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-3.5">
                <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                  <img src={assets?.mail_icon} alt="" className="h-5 w-5" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                    type="email"
                    placeholder="Admin email"
                    required
                  />
                </div>

                <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                  <img src={assets?.lock_icon} alt="" className="h-5 w-5" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                    type={reveal ? "text" : "password"}
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                    aria-label={reveal ? "Hide password" : "Show password"}
                  >
                    {reveal ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-sm font-medium text-rose-700 hover:text-rose-900"
                  >
                    Forgot Password?
                  </button>
                  <span className="text-xs text-rose-500">Secure • Private • Safe</span>
                </div>

                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBAA99] to-[#FDE8E4] px-6 py-3 text-base font-semibold text-rose-900 shadow-lg transition-all hover:scale-[1.01] hover:shadow-rose-200/80 active:scale-[0.99]"
                >
                  <span className="relative z-10">Login</span>
                  <span className="absolute inset-0 -translate-y-full bg-white/30 transition-all duration-500 group-hover:translate-y-0" />
                </button>
              </form>

              {/* Links */}
              <p className="mt-5 text-center text-xs text-rose-600">
                Need to register staff?{" "}
                <button
                  onClick={() => navigate("/staff-auth")}
                  className="font-medium text-rose-700 underline underline-offset-4 hover:text-rose-900"
                  type="button"
                >
                  Go to Staff Sign Up
                </button>
              </p>
              <p className="mt-1 text-center text-xs text-rose-600">
                Are you a customer?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium text-rose-700 underline underline-offset-4 hover:text-rose-900"
                  type="button"
                >
                  Go to Customer Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <p className="relative bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] text-rose-500/80 z-40">
        © {new Date().getFullYear()} Pink Aura Salon. All rights reserved.
      </p>
    </div>
  );
}

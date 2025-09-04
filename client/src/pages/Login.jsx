// client/src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [state, setState] = useState("Login"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          setIsLoggedin(true);
          getUserData?.();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData?.();

          // redirect by role from server response 
          const r = data?.user?.role;
          if (r === "staff" || r === "supplier") navigate("/staff");
          else if (r === "admin") navigate("/admin");
          else navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg1.jpg')] bg-cover bg-center relative">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-25 items-center justify-between bg-white/70 backdrop-blur-md shadow px-4 sm:px-6">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
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

      <main className="relative mx-auto max-w-7xl px-5 lg:px-10 pt-40 md:pt-44 pb-24 min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex items-start justify-start">
          <div className="w-full max-w-md">
            <div className="relative rounded-3xl border border-white/40 bg-white/65 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="mb-5 text-center">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-rose-900">
                  {state === "Sign Up" ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="mt-1.5 text-sm text-rose-700/80">
                  {state === "Sign Up"
                    ? "Join our beauty community"
                    : "Login to continue your glow journey"}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-white/70 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setState("Login")}
                  className={`rounded-full py-2 text-sm font-medium transition-all ${
                    state === "Login"
                      ? "bg-gradient-to-r from-rose-300 to-rose-200 text-rose-900 shadow"
                      : "text-rose-600 hover:bg-white"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setState("Sign Up")}
                  className={`rounded-full py-2 text-sm font-medium transition-all ${
                    state === "Sign Up"
                      ? "bg-gradient-to-r from-rose-300 to-rose-200 text-rose-900 shadow"
                      : "text-rose-600 hover:bg-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-3.5">
                {state === "Sign Up" && (
                  <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                    <img src={assets.person_icon} alt="" className="h-5 w-5" />
                    <input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                      type="text"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                )}

                <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                  <img src={assets.mail_icon} alt="" className="h-5 w-5" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                    type="email"
                    placeholder="Email address"
                    required
                  />
                </div>

                <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                  <img src={assets.lock_icon} alt="" className="h-5 w-5" />
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
                  <span className="relative z-10">{state}</span>
                  <span className="absolute inset-0 -translate-y-full bg-white/30 transition-all duration-500 group-hover:translate-y-0" />
                </button>
              </form>

              <div className="mt-5 text-center text-sm">
                {state === "Sign Up" ? (
                  <p className="text-rose-700">
                    Already have an account?{" "}
                    <button
                      onClick={() => setState("Login")}
                      className="font-semibold text-rose-600 underline underline-offset-4 hover:text-rose-800"
                      type="button"
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p className="text-rose-700">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => setState("Sign Up")}
                      className="font-semibold text-rose-600 underline underline-offset-4 hover:text-rose-800"
                      type="button"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-rose-600">
                Are you a staff member or admin?{" "}
                <button
                  onClick={() => navigate("/staff-auth")}
                  className="font-medium text-rose-700 underline underline-offset-4 hover:text-rose-900"
                  type="button"
                >
                  Go to Staff/Admin Login
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
};

export default Login;

import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    axios.defaults.withCredentials = true;

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password,
        });
        if (!data?.success) throw new Error(data?.message || "Registration failed");

        setIsLoggedin?.(true);
        getUserData?.();
        toast.success("Account created. Welcome!");
        navigate("/");
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
        });
        if (!data?.success) throw new Error(data?.message || "Login failed");

        setIsLoggedin?.(true);
        getUserData?.();
        const role = data?.user?.role;
        if (role === "admin") navigate("/admin");
        else if (role === "staff" || role === "supplier") navigate("/staff");
        else navigate("/");
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Flip animation variants
  const flipVariants = {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  };

  return (
    <div
      className={`min-h-screen relative transition-colors duration-700 ${
        state === "Sign Up"
          ? "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100"
          : "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100"
      }`}
      style={{
        backgroundImage: "url('/bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
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

      {/* Main */}
      <main className="relative mx-auto max-w-7xl px-5 lg:px-10 pt-40 md:pt-44 pb-24 min-h-[calc(100vh-4rem)]">
        <div className="relative z-10 flex items-start justify-start">
          <div className="w-full max-w-md">
            <motion.div
              key={state}
              className="relative rounded-3xl border border-white/40 bg-white/65 p-6 shadow-2xl backdrop-blur-xl sm:p-7 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Heading */}
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

              {/* Toggle buttons */}
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-white/70 p-1 shadow-sm">
                {["Login", "Sign Up"].map((tab) => (
                  <motion.button
                    key={tab}
                    type="button"
                    onClick={() => setState(tab)}
                    className={`rounded-full py-2 text-sm font-medium transition-all ${
                      state === tab
                        ? "bg-gradient-to-r from-rose-300 to-rose-200 text-rose-900 shadow"
                        : "text-rose-600 hover:bg-white"
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* Animated flip forms */}
              <AnimatePresence mode="wait">
                {state === "Sign Up" ? (
                  <motion.form
                    key="signup"
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
                    onSubmit={onSubmitHandler}
                    className="space-y-3.5"
                  >
                    <Field icon={assets.person_icon}>
                      <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                        type="text"
                        placeholder="Full Name"
                        required
                      />
                    </Field>
                    <Field icon={assets.mail_icon}>
                      <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                        type="email"
                        placeholder="Email address"
                        required
                      />
                    </Field>
                    <PasswordField
                      reveal={reveal}
                      setReveal={setReveal}
                      value={password}
                      onChange={setPassword}
                    />
                    <FooterActions
                      loading={loading}
                      onForgot={() => navigate("/reset-password")}
                      ctaLabel="Sign Up"
                    />
                  </motion.form>
                ) : (
                  <motion.form
                    key="login"
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
                    onSubmit={onSubmitHandler}
                    className="space-y-3.5"
                  >
                    <Field icon={assets.mail_icon}>
                      <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                        type="email"
                        placeholder="Email address"
                        required
                      />
                    </Field>
                    <PasswordField
                      reveal={reveal}
                      setReveal={setReveal}
                      value={password}
                      onChange={setPassword}
                    />
                    <FooterActions
                      loading={loading}
                      onForgot={() => navigate("/reset-password")}
                      ctaLabel="Login"
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Switch hint */}
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
            </motion.div>
          </div>
        </div>
      </main>

      <p className="relative bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] text-rose-500/80 z-40">
        © {new Date().getFullYear()} Pink Aura Salon. All rights reserved.
      </p>
    </div>
  );
};


const Field = ({ icon, children }) => (
  <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
    {icon && <img src={icon} alt="" className="h-5 w-5" />}
    {children}
  </div>
);

const PasswordField = ({ reveal, setReveal, value, onChange }) => (
  <div className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
    <img src={assets.lock_icon} alt="" className="h-5 w-5" />
    <input
      onChange={(e) => onChange(e.target.value)}
      value={value}
      className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
      type={reveal ? "text" : "password"}
      placeholder="Password"
      required
    />
    <button
      type="button"
      onClick={() => setReveal((v) => !v)}
      className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
    >
      {reveal ? "Hide" : "Show"}
    </button>
  </div>
);

const FooterActions = ({ loading, onForgot, ctaLabel }) => (
  <>
    <div className="flex items-center justify-between">
      <button type="button" onClick={onForgot} className="text-sm font-medium text-rose-700 hover:text-rose-900">
        Forgot Password?
      </button>
      <span className="text-xs text-rose-500">Secure • Private • Safe</span>
    </div>
    <button
      type="submit"
      disabled={loading}
      className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBAA99] to-[#FDE8E4] px-6 py-3 text-base font-semibold text-rose-900 shadow-lg transition-all hover:scale-[1.01] hover:shadow-rose-200/80 active:scale-[0.99] ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      <span className="relative z-10">{loading ? "Please wait..." : ctaLabel}</span>
      <span className="absolute inset-0 -translate-y-full bg-white/30 transition-all duration-500 group-hover:translate-y-0" />
    </button>
  </>
);

export default Login;

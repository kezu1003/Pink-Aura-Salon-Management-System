import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requestOtp = async () => {
    if (!email) return toast.error("Enter your email");
    try {
      setSending(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data?.success) {
        toast.success("OTP sent to your email");
      } else {
        toast.error(data?.message || "Failed to send OTP");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !otp || !newPassword || !confirmPassword) {
      return toast.error("Please fill all fields");
    }
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setResetting(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
        confirmPassword, 
      });
      if (data?.success) {
        toast.success("Password reset successful. Please login.");
        navigate("/login");
      } else {
        toast.error(data?.message || "Reset failed");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg1.jpg')] bg-cover bg-center relative">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white/70 backdrop-blur-md shadow px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow hover:bg-rose-100"
          type="button"
        >
          Back
        </button>
        <button
          onClick={() => navigate("/login")}
          className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow hover:bg-rose-100"
          type="button"
        >
          Login
        </button>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 lg:px-10 pt-32 pb-24">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-rose-900 text-center">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-rose-700/80 text-center">
              Request an OTP, then set a new password.
            </p>

            <div className="mt-6 space-y-3.5">
              {/* Email */}
              <div className="group flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                <span className="text-rose-500">📧</span>
                <input
                  type="email"
                  className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={sending || !email}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send OTP"}
                </button>
              </div>

              {/* OTP */}
              <div className="group flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                <span className="text-rose-500">🔐</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                  required
                />
              </div>

              {/* New Password */}
              <div className="group flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                <span className="text-rose-500">🔏</span>
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="group flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-rose-200/60 transition-all hover:ring-rose-300 focus-within:bg-white focus-within:ring-rose-400">
                <span className="text-rose-500">✅</span>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full bg-transparent text-rose-900 placeholder-rose-400 outline-none"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleReset}
                disabled={resetting}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBAA99] to-[#FDE8E4] px-6 py-3 text-base font-semibold text-rose-900 shadow-lg transition-all hover:scale-[1.01] hover:shadow-rose-200/80 active:scale-[0.99] disabled:opacity-60"
              >
                <span className="relative z-10">
                  {resetting ? "Resetting..." : "Reset Password"}
                </span>
                <span className="absolute inset-0 -translate-y-full bg-white/30 transition-all duration-500 group-hover:translate-y-0" />
              </button>

              <p className="text-center text-xs text-rose-600">
                Didn&apos;t receive OTP? Check spam or try again.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function StaffAuth() {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

  const [mode, setMode] = useState("Login"); // "Login" or "Register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("Facial Artist");
  const [role, setRole] = useState("staff"); // used only for login call

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (mode === "Register") {
        // ✅ Staff self-register (cookie set on success, like customer register)
        const { data } = await axios.post(
          backendUrl + "/api/auth/staff-register",
          { name, email, password, jobTitle },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success("Registered! You're logged in.");
          setIsLoggedin(true);
          await getUserData();
          navigate("/"); // mirror customer UX; change to '/admin' if you create a staff dashboard
        } else {
          toast.error(data.message);
        }
      } else {
        // Staff/Admin Login (role-select)
        const { data } = await axios.post(
          backendUrl + "/api/auth/admin-login",
          { email, password, role },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success("Welcome!");
          setIsLoggedin(true);
          await getUserData();
          // If role === 'admin', you likely want to go to /admin
          // If role === 'staff' but you don't yet have a staff dashboard, go home:
          navigate(role === "admin" ? "/admin" : "/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#FBAA99] to-[#FEF4F1]">
      <div className="bg-pink-100 p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">
          {mode === "Register" ? "Register Staff" : "Staff Login"}
        </h1>

        <form onSubmit={submitHandler}>
          {mode === "Register" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 mb-3 bg-white"
              />

              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3 bg-white"
              >
                <option value="Facial Artist">Facial Artist</option>
                <option value="Hairdresser">Hairdresser</option>
                <option value="Nail Artist">Nail Artist</option>
                <option value="Makeup Artist">Makeup Artist</option>
                <option value="Event Stylist">Event Stylist</option>
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-3 bg-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 mb-3 bg-white"
          />

          {/* Role selector for Login only (Admin/Staff) */}
          {mode === "Login" && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4 bg-white"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded bg-gradient-to-b from-[#FBAA99] to-[#FEF4F1] font-medium shadow"
          >
            {mode}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          {mode === "Register" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setMode("Login")}
                className="text-blue-500 cursor-pointer underline"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Need to register as staff?{" "}
              <span
                onClick={() => setMode("Register")}
                className="text-blue-500 cursor-pointer underline"
              >
                Register here
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

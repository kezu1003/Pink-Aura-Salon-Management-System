import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/admin-login", { email, password, role }, { withCredentials: true });
      if (data.success) {
        toast.success("Welcome!");
        setIsLoggedin(true);
        await getUserData();
        navigate("/admin");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#FBAA99] to-[#FEF4F1]">
      <form onSubmit={submit} className="bg-pink-100 p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Admin / Staff Login</h1>

        <label className="block mb-2 text-sm">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2 mb-4 bg-white">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>

        <label className="block mb-2 text-sm">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border rounded px-3 py-2 mb-4 bg-white" />

        <label className="block mb-2 text-sm">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full border rounded px-3 py-2 mb-6 bg-white" />

        <button className="w-full py-2 rounded bg-gradient-to-b from-[#FBAA99] to-[#FEF4F1] font-medium shadow">Login</button>
      </form>
    </div>
  );
}

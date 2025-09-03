import AdminSidebar from "../../components/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);

  const doLogout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        toast.success("Logged out");
        await getUserData(); // will clear role on is-auth fail next load
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen bg-white">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">Pink Aura • Admin</h1>
          <button
            onClick={doLogout}
            className="px-3 py-1.5 rounded bg-pink-500 text-white hover:opacity-90"
          >
            Logout
          </button>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

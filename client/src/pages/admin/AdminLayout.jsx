import { useState, useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/AdminSidebar";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { backendUrl, getUserData, setIsLoggedin, setUserData } = useContext(AppContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebar");
    if (saved !== null) setSidebarOpen(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("adminSidebar", String(next));
  };

  const doLogout = async () => {
    try {
      
      toast.success("Logged out");
      
     
      setIsLoggedin(false);
      setUserData(null);
      
      navigate("/login");
    } catch (e) {
      
      console.error("Logout error:", e);
      navigate("/login");
    }
  };

  return (
    <div className="flex bg-[#FEF4F1] min-h-screen">
      {/* Sidebar */}
      <AdminSidebar expanded={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}

      <main className="flex-1 min-h-screen">
        
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-[#FFFFFF] shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-[#FBAA99] text-[#4D423A] transition-colors"
            >
              <Menu size={20} className="lg:hidden" />
              <ChevronLeft size={20} className={`hidden lg:block ${sidebarOpen ? "" : "hidden"}`} />
              <ChevronRight size={20} className={`hidden lg:block ${sidebarOpen ? "hidden" : ""}`} />
            </button>
            <h1 className="text-lg font-semibold text-[#4D423A]">Pink Aura • Admin</h1>
          </div>
          <button
            onClick={doLogout}
            className="px-3 py-1.5 rounded bg-[#FBAA99] text-[#000000] hover:bg-[#4D423A] hover:text-[#FFFFFF] transition-colors"
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
import { useState, useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import AdminSidebar from "../../components/AdminSidebar";
import { Menu, ChevronLeft, ChevronRight, LogOut, User, Settings } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { backendUrl, getUserData, setIsLoggedin, setUserData } = useContext(AppContext);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        {/* Modern Top Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-100 text-gray-600 hover:text-[#FBAA99] transition-all duration-200"
              >
                <Menu size={20} className="lg:hidden" />
                <ChevronLeft size={20} className={`hidden lg:block ${sidebarOpen ? "" : "hidden"}`} />
                <ChevronRight size={20} className={`hidden lg:block ${sidebarOpen ? "hidden" : ""}`} />
              </button>
              
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-[#FBAA99] to-[#ff7b5c] rounded-full"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pink Aura</h1>
                  <p className="text-xs text-gray-500 font-medium">Admin Dashboard</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99] to-[#ff7b5c] rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={doLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);
  const { totalQty } = useCart();

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="w-full sticky top-0 z-20
                 px-6 py-2 sm:px-10 sm:py-3
                 bg-pink-200/60 backdrop-blur-md shadow-md"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className="w-12 sm:w-16 rounded-full cursor-pointer"
          />
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link to="/shop" className="hover:underline">
            Shop
          </Link>
          <Link to="/cart" className="hover:underline relative">
            Cart
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-xs rounded-full px-2 py-0.5">
                {totalQty}
              </span>
            )}
          </Link>
          {userData?.role === "admin" && (
            <Link to="/admin/products" className="hover:underline">
              Admin
            </Link>
          )}

          {/* User dropdown / login */}
          {userData ? (
            <div
              className="w-8 h-8 flex justify-center items-center rounded-full 
                         bg-black text-white relative group cursor-pointer"
            >
              {userData.name[0].toUpperCase()}
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                <ul className="list-none m-0 p-2 bg-gray-100 text-sm min-w-[140px]">
                  {!userData.isAccountVerified && (
                    <li
                      onClick={sendVerificationOtp}
                      className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                    >
                      Verify Email
                    </li>
                  )}
                  <li
                    onClick={logout}
                    className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            // Only show this button if the user is not logged in
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-1 text-gray-800 hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Login
              <img src={assets.arrow_icon} alt="" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/');
      } else {
        toast.error(data.message || 'Logout failed');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="
        fixed top-0 inset-x-0 z-50
        h-30
        bg-pink-100/60
        backdrop-blur-md
        border-b border-pink-200/60
        shadow-sm
        flex items-center
      "
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src={assets.logo} alt="logo" className="w-17 h-17 rounded-full" />
          <span
            className="text-lg sm:text-2xl font-serif text-slate-900 tracking-wide"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Pink Aura
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-5">
          {/* Show only when logged in */}
          {userData && (
            <>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `text-lg ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                Shop
              </NavLink>

              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `text-lg ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                Cart
              </NavLink>

              <NavLink
                to="/reviews"
                className={({ isActive }) =>
                  `text-lg ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                Reviews
              </NavLink>

              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `text-lg ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                Services
              </NavLink>

              
              <NavLink
                to="/packages"
                className={({ isActive }) =>
                  `text-lg ${isActive ? 'text-slate-900 font-medium' : 'text-slate-700 hover:text-slate-900'}`
                }
              >
                Packages
              </NavLink>

              <button
                onClick={() => navigate('/book')}
                className="
                  hidden sm:inline-flex
                  items-center
                  px-5 py-2.5 rounded-full
                  bg-pink-500 text-white
                  shadow-sm
                  hover:opacity-90 active:opacity-95
                  transition
                  border border-pink-500
                "
                aria-label="Book an appointment"
              >
                Book Appointment
              </button>
            </>
          )}

          {/* Profile / Login */}
          {userData ? (
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-slate-900 text-white relative group select-none">
              {userData.name?.[0]?.toUpperCase() || 'U'}
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                <ul className="list-none m-0 p-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded shadow-md text-sm">
                  {!userData.isAccountVerified && (
                    <li
                      onClick={sendVerificationOtp}
                      className="py-1 px-3 hover:bg-slate-100 cursor-pointer rounded"
                    >
                      Verify Email
                    </li>
                  )}
                  <li
                    onClick={() => navigate('/payment-methods')}
                    className="py-1 px-3 hover:bg-slate-100 cursor-pointer pr-10 rounded"
                  >
                    Payment Methods
                  </li>
                  <li
                    onClick={logout}
                    className="py-1 px-3 hover:bg-slate-100 cursor-pointer pr-10 rounded"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="
                text-sm
                px-5 py-2 rounded-full
                bg-white/70 hover:bg-white
                text-slate-800
                border border-pink-200
                transition
              "
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

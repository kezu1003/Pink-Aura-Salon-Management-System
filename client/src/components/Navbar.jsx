import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // activates after 20px scroll
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`
        fixed top-0 inset-x-0 z-50 flex items-center box-border transition-all duration-500
        ${scrolled
          ? 'h-16 bg-white/30 backdrop-blur-xl border-b border-white/20 shadow-lg'
          : 'h-20 bg-[#FEF4F1]/70 backdrop-blur-md border-b border-[#FBAA99]/30 shadow-sm'}
      `}
      style={{
        WebkitBackdropFilter: 'blur(20px) saturate(180%)', // iOS-style frosted blur
        backdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 transition-all duration-500">
          <img
            src={assets.logo}
            alt="logo"
            className={`rounded-full transition-all duration-500 ${
              scrolled ? 'w-12 h-12' : 'w-16 h-16'
            }`}
          />
          <span
            className={`tracking-wide font-serif transition-all duration-500 ${
              scrolled ? 'text-lg' : 'text-2xl'
            }`}
            style={{
              fontFamily: "'Dancing Script', cursive",
              color: '#4D423A',
            }}
          >
            Pink Aura
          </span>
        </Link>


        {/* Links */}
        <div className="flex items-center gap-4 sm:gap-5">
          {userData && (
            <>
              <NavLink
                to="/events/user"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Events
              </NavLink>

              <NavLink
                to="/courses/user"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Courses
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Shop
              </NavLink>

              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Cart
              </NavLink>

              <NavLink
                to="/reviews"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Reviews
              </NavLink>

              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Services
              </NavLink>

              <NavLink
                to="/packages"
                className={({ isActive }) =>
                  `hidden sm:block text-base sm:text-lg transition ${
                    isActive ? 'text-[#4D423A] font-medium' : 'text-black hover:text-[#4D423A]'
                  }`
                }
              >
                Packages
              </NavLink>

              <button
                onClick={() => navigate('/book')}
                className="hidden sm:inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
                  bg-[#FBAA99] text-white shadow-md hover:opacity-90 active:opacity-95 transition border border-[#FBAA99]"
                aria-label="Book an appointment"
              >
                Book Appointment
              </button>
            </>
          )}

          {/* Profile / Login */}
          {userData ? (
            <div
              className="w-8 h-8 flex justify-center items-center rounded-full bg-[#4D423A] text-white relative group select-none"
            >
              {userData.name?.[0]?.toUpperCase() || 'U'}
              <div
                className="
                  absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10
                  transition-all duration-200 ease-out
                "
              >
                <ul className="list-none m-0 p-2 bg-white/80 backdrop-blur-md border border-[#FBAA99]/40 rounded shadow-md text-sm">
                  {!userData.isAccountVerified && (
                    <li
                      onClick={sendVerificationOtp}
                      className="py-1 px-3 hover:bg-[#FEF4F1] cursor-pointer rounded"
                    >
                      Verify Email
                    </li>
                  )}
                  <li
                    onClick={() => navigate('/payment-methods')}
                    className="py-1 px-3 hover:bg-[#FEF4F1] cursor-pointer rounded"
                  >
                    Payment Methods
                  </li>
                  <li
                    onClick={logout}
                    className="py-1 px-3 hover:bg-[#FEF4F1] cursor-pointer rounded"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/70 hover:bg-[#FEF4F1]/90
                text-[#4D423A] border border-[#FBAA99]/50 transition backdrop-blur-sm"
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

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";

// NEW imports
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminProducts from "./pages/AdminProducts";

import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <CartProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shop/Cart/Admin */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/products" element={<AdminProducts />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" />
    </CartProvider>
  );
};

export default App;

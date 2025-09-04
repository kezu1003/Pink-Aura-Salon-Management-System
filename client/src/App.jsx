// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Existing pages
import Home from './pages/Home.jsx';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';

// Toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth / Admin layout
import RequireRole from './components/Protected.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import StaffDirectory from './pages/admin/StaffDirectory.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import StaffAuth from './pages/admin/StaffAuth.jsx'; 

import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';

// Admin Product management
import ProductsAdmin from './pages/admin/ProductsAdmin.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';

// NEW: Staff dashboard
import StaffDashboard from './pages/StaffDashboard.jsx';

const App = () => {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/* Customer site */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route path='/shop' element={<Shop />} />
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />

        {/* Staff/Admin auth */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/staff-auth' element={<StaffAuth />} />

        {/* Staff & Supplier dashboard  */}
        <Route
          path='/staff'
          element={
            <RequireRole roles={['staff', 'supplier']}>
              <StaffDashboard />
            </RequireRole>
          }
        />

        {/* Protected Admin area */}
        <Route
          path='/admin'
          element={
            <RequireRole roles={['admin']}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path='staff' element={<StaffDirectory />} />
          <Route path='products' element={<ProductsAdmin />} />
          <Route path='products/new' element={<ProductForm />} />
          <Route path='products/:id/edit' element={<ProductForm />} />
        </Route>

        
      </Routes>
    </div>
  );
};

export default App;

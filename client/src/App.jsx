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
import AppointmentsAdmin from './pages/admin/AppointmentsAdmin.jsx';

import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';

// Admin Product management
import ProductsAdmin from './pages/admin/ProductsAdmin.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';

// Staff dashboard
import StaffDashboard from './pages/StaffDashboard.jsx';

// Reviews (public/customer) + Admin reviews
import Reviews from './pages/reviews/Reviews.jsx';
import AddReview from './pages/reviews/AddReview.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';

//services
import Services from './pages/Services.jsx';
import ServicesAdmin from './pages/admin/ServicesAdmin.jsx';
import ServiceReport from './pages/admin/ServiceReport.jsx';

// appointments
 import Book from './pages/appointments/Book.jsx';
 import MyAppointments from './pages/appointments/MyAppointments.jsx';
 import AdminCalendar from './pages/admin/AdminCalendar.jsx';

 // package
import Packages from './pages/Packages.jsx';
import PackagesAdmin from './pages/admin/PackagesAdmin.jsx';
import PackageForm from './pages/admin/PackageForm.jsx';

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

        <Route path='/services' element={<Services />} />

        <Route path='/book' element={<Book />} />
+       <Route path='/appointments/mine' element={<MyAppointments />} />
        <Route path='/appointments/book' element={<Book />} />

        <Route path='/packages' element={<Packages />} />

        {/* Staff/Admin auth */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/staff-auth' element={<StaffAuth />} />

        {/* Staff & Supplier dashboard */}
        <Route
          path='/staff'
          element={
            <RequireRole roles={['staff', 'supplier']}>
              <StaffDashboard />
            </RequireRole>
          }
        />

        {/* Public/Customer reviews */}
        <Route path='/reviews' element={<Reviews />} />
        <Route path='/reviews/add' element={<AddReview />} />

       
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
          <Route path='reviews' element={<AdminReviews />} />
          <Route path='services' element={<ServicesAdmin />} />
          <Route path='services/report' element={<ServiceReport />} />
          <Route path='calendar' element={<AdminCalendar />} />
          <Route path='appointments' element={<AppointmentsAdmin />} />
          <Route path='packages' element={<PackagesAdmin />} />
          <Route path='packages/new' element={<PackageForm />} />
          <Route path='packages/:id/edit' element={<PackageForm />} />

        </Route>
      </Routes>
    </div>
  );
};

export default App;

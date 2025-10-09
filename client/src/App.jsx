import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Home from './pages/Home.jsx';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import EnterPayment from './pages/EnterPayment.jsx';

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
import PaymentFailed from './pages/PaymentFailed.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
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


//Card Management page
 import CardManagement from './pages/CardManagement.jsx';
import AdminTransactions from './pages/admin/AdminTransactions.jsx';

 // package
import Packages from './pages/Packages.jsx';
import PackagesAdmin from './pages/admin/PackagesAdmin.jsx';
import PackageForm from './pages/admin/PackageForm.jsx';
import AdvertisementDashboard from './pages/admin/AdvertisementDashboard.jsx';

//reports
import ServiceReports from './pages/admin/ServiceReports.jsx';
import AppointmentReports from './pages/admin/AppointmentReports.jsx';
import AdminProductReports from './pages/admin/ProductReports.jsx';

//home
import Gallery from "./pages/Gallery.jsx";


import CourseHomePage from './pages/CourseHomePage.jsx';
import CourseCreatePage from './pages/CourseCreatePage.jsx';
import CourseDetailsPage from './pages/CourseDetailsPage.jsx';

import CourseCertificatePage from './pages/CourseCertificatePage.jsx';
import UserCourseHomePage from './pages/UserCourseHomePage.jsx';

import EventHomePage from './pages/EventHomePage.jsx';
import EventCreatepage from './pages/EventCreatepage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import UserEventHomePage from './pages/UserEventHomePage.jsx';


import EnrollmentCreatePage from './pages/EnrollmentCreatePage.jsx';
import EnrollmentDetailsPage from './pages/EnrollmentDetailsPage.jsx';
import EnrollmentListpage from './pages/EnrollmentListPage.jsx';

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
        <Route path="/gallery" element={<Gallery />} />

        <Route path='/shop' element={<Shop />} />
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/payment-methods' element={<CardManagement />} />  
        <Route path='/services' element={<Services />} />
        <Route path='/payment' element={<EnterPayment />} />
        <Route path='/payment-success' element={<PaymentSuccess />} />
        <Route path='/payment-failed' element={<PaymentFailed />} />
        <Route path='/book' element={<Book />} />
        <Route path='/appointments/mine' element={<MyAppointments />} />
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
          <Route path='advertisements' element={<AdvertisementDashboard />} />

          <Route path='transactions' element={<AdminTransactions />} />

          <Route path='packages' element={<PackagesAdmin />} />
          <Route path='packages/new' element={<PackageForm />} />
          <Route path='packages/:id/edit' element={<PackageForm />} />
          <Route path='reports/service' element={<ServiceReports />} />
          <Route path='reports' element={<AppointmentReports />} />
          <Route path='products/reports' element={<AdminProductReports />} />

          {/* <Route path="/courses2" element={<CM2 />} /> */}


        </Route>

        <Route path="/enrollments" element={<EnrollmentListpage />} />
        <Route path="/enrollments/create" element={<EnrollmentCreatePage/>} />
        <Route path="/enrollments/:id" element={<EnrollmentDetailsPage />} />

        <Route path="/courses" element={<CourseHomePage />} />
        <Route path="/courses/create" element={<CourseCreatePage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/certificate" element={<CourseCertificatePage />} />
        <Route path="/courses/user" element={<UserCourseHomePage />} />

        <Route path="/events" element={<EventHomePage />} />
        <Route path="/events/create" element={<EventCreatepage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/events/user" element={<UserEventHomePage />} />

      </Routes>
    </div>
  );
};

export default App;

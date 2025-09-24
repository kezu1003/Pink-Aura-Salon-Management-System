import React from 'react'
import { Route,Routes } from 'react-router';
import CourseCertificatePage from './pages/CourseCertificatePage.jsx';
import CourseHomePage from './pages/CourseHomePage.jsx';
import UserCourseHomePage from './pages/UserCourseHomePage.jsx';
import CourseDetailsPage from './pages/CourseDetailsPage.jsx';
import CourseCreatePage from './pages/CourseCreatePage.jsx';
import EventHomePage from './pages/EventHomePage.jsx';
import UserEventHomePage from './pages/UserEventHomePage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import EventCreatepage from './pages/EventCreatepage.jsx';
import toast from 'react-hot-toast';  

const App = () => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 
      [background:radial-gradient(125%_125%_at_50%_10%,#fce7f3_40%,#f9fafb_70%,#fef9c3_100%)]" 
      />
  

      
      <Routes>
        <Route path="/courses/certificate" element={<CourseCertificatePage />} />
        <Route path="/courses" element={<CourseHomePage />} />
        <Route path="/courses/user" element={<UserCourseHomePage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/courses/create" element={<CourseCreatePage />} />
        <Route path="/events" element={<EventHomePage />} />
        <Route path="/events/user" element={<UserEventHomePage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/events/create" element={<EventCreatepage />} />
      </Routes>
    </div>
  );
};

export default App;
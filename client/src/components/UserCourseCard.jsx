import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import { Clock, User, MapPin, Calendar, BookOpen, Users, Award, Heart, Sparkles } from "lucide-react";
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import { useLikedCourses } from '../context/LikedCoursesContext';

// Simple date formatter
const formatDate = (date) => date.toLocaleDateString();

const UserCourseCard = ({ course, onRegister }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { toggleLike, isCourseLiked } = useLikedCourses();
  const isLiked = isCourseLiked(course._id);
  
  const navigate = useNavigate();
  const { userData, isLoggedin } = useContext(AppContext);

  const handleEnrollment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedin || !userData) {
      toast.error('Please log in to enroll in courses');
      return;
    }

    setIsEnrolling(true);
    try {
      // Navigate to enrollment page with pre-filled data
      navigate('/enrollments/create', {
        state: {
          courseId: course._id,
          courseName: course.courseName,
          userId: userData._id || userData.id,
          userName: userData.name || userData.username,
          userEmail: userData.email,
          courseData: course
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to enrollment page');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDirectEnrollment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedin || !userData) {
      toast.error('Please log in to enroll in courses');
      return;
    }

    setIsEnrolling(true);
    try {
      // Direct enrollment API call with proper response handling
      const response = await api.post("/enrollments", {
        courseID: course._id,
        userID: userData._id || userData.id,
        name: userData.name || userData.username,
        courseName: course.courseName,
        email: userData.email
      });
      
      // Check if response indicates success
      if (response.data.success) {
        toast.success(response.data.message || `Successfully enrolled in ${course.courseName}!`);
        onRegister?.(course._id);
      } else {
        toast.error(response.data.message || 'Enrollment failed');
      }
      
    } catch (error) {
      console.error('Enrollment error:', error);
      
      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 409 || error.code === 11000) {
        toast.error('You are already enrolled in this course!');
      } else {
        toast.error('Enrollment failed. Please try again.');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(course._id);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites!");
  };


  return (
    <div 
      className="group relative transform transition-all duration-500 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-[#FEF4F1] hover:border-[#FBAA99] relative">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#FEF4F1]/50 to-[#FBAA99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}></div>
        
        {/* Top accent bar with gradient */}
        <div className="h-2 bg-gradient-to-r from-[#FBAA99] via-[#4D423A] to-[#FBAA99] relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700`}></div>
        </div>

        <div className="p-6 relative z-20">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Course Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                {course.courseName?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#4D423A] group-hover:text-[#FBAA99] transition-colors duration-300 line-clamp-1">
                  {course.courseName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-[#4D423A]/60 mt-1">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{course.enrolledCount || 24} enrolled</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-100 text-red-500 scale-110' 
                  : 'bg-[#FEF4F1] text-[#4D423A] hover:bg-[#FBAA99]/20 hover:text-[#FBAA99]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-[#4D423A]/80 line-clamp-3 leading-relaxed text-sm">
              {course.description || "Comprehensive beauty course designed to enhance your professional skills and launch your career in the beauty industry."}
            </p>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Duration */}
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div>
                <div className="text-xs text-[#4D423A]/60 font-medium">Duration</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{course.duration || "12 weeks"}</div>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div>
                <div className="text-xs text-[#4D423A]/60 font-medium">Instructor</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{course.instructorName || "Expert Tutor"}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div>
                <div className="text-xs text-[#4D423A]/60 font-medium">Location</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{course.location || "Pink Aura Academy"}</div>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div>
                <div className="text-xs text-[#4D423A]/60 font-medium">Schedule</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{course.schedule || "Flexible"}</div>
              </div>
            </div>
          </div>

          {/* Course Features */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FBAA99]/20 text-[#4D423A] border border-[#FBAA99]/30">
                <Award className="w-3 h-3 mr-1" />
                Certificate
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4D423A]/20 text-[#4D423A] border border-[#4D423A]/30">
                <BookOpen className="w-3 h-3 mr-1" />
                Hands-on
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Popular
              </span>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-[#FEF4F1]">
            {/* Course Date */}
            <div className="text-xs text-[#4D423A]/60">
              <span className="font-medium">Added:</span> {course.createdAt ? formatDate(new Date(course.createdAt)) : "Recently"}
            </div>

            {/* Enrollment Button */}
            <div className="flex items-center space-x-2">
              {/* Enrollment Button */}
              <button
                onClick={handleEnrollment}
                disabled={isEnrolling}
                className={`px-4 py-2 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm ${
                  isEnrolling ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                title="Go to enrollment page"
              >
                <BookOpen className="w-3 h-3" />
                <span>{isLoggedin ? 'Enroll Now' : 'Login to Enroll'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Hover indicator */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>


        {/* Corner Decorative Element */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>


        {/* Special Offer Badge */}
        {Math.random() > 0.7 && !isLoggedin && (
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold transform -rotate-12 shadow-lg">
              POPULAR
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Shadow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-2xl blur-xl transition-all duration-300 -z-10 ${isHovered ? 'opacity-50 scale-105' : 'opacity-0'}`}></div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Enhanced hover animations */
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 170, 153, 0.3);
        }
        
        /* Custom scrollbar for overflow content */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #FEF4F1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FBAA99, #4D423A);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default UserCourseCard;
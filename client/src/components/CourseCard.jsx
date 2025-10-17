import React, { useState } from 'react';
import { Link } from 'react-router';
import { Edit, Trash2, Clock, MapPin, User, Calendar, BookOpen, Star, Award, Eye } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// Simple date formatter
const formatDate = (date) => date.toLocaleDateString();

const CourseCard = ({ course, setCourses }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setIsDeleting(true);
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Edit functionality triggered!");
  };

  return (
    <div 
      className="group relative transform transition-all duration-500 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/courses/${course._id}`}
        className="block relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-[#FEF4F1] hover:border-[#FBAA99] group"
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#FEF4F1]/50 to-[#FBAA99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}></div>
        
        {/* Top accent bar with gradient */}
        <div className="h-2 bg-gradient-to-r from-[#FBAA99] via-[#4D423A] to-[#000000] relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700`}></div>
        </div>

        <div className="p-6 relative z-20 min-h-[400px]">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Course Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {course.courseName?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-[#4D423A] group-hover:text-[#FBAA99] transition-colors duration-300 line-clamp-2 leading-tight">
                  {course.courseName}
                </h3>
                <div className="flex items-center text-sm text-[#4D423A]/60 mt-1">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{course.createdAt ? formatDate(new Date(course.createdAt)) : "Recently added"}</span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-[#4D423A]/80 line-clamp-3 leading-relaxed text-sm">
              {course.description || "Comprehensive beauty course designed to enhance your professional skills and career opportunities."}
            </p>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Duration */}
            <div className="flex items-start space-x-3 p-4 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#4D423A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#4D423A]/60 font-medium mb-1">Duration</div>
                <div className="text-sm font-bold text-[#4D423A] leading-tight break-words">{course.duration || "12 weeks"}</div>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-start space-x-3 p-4 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#4D423A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#4D423A]/60 font-medium mb-1">Instructor</div>
                <div className="text-sm font-bold text-[#4D423A] leading-tight break-words">{course.instructorName || "Expert Tutor"}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3 p-4 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#4D423A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#4D423A]/60 font-medium mb-1">Location</div>
                <div className="text-sm font-bold text-[#4D423A] leading-tight break-words">{course.location || "Beauty Academy"}</div>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-start space-x-3 p-4 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-h-[80px]">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-[#4D423A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#4D423A]/60 font-medium mb-1">Schedule</div>
                <div className="text-sm font-bold text-[#4D423A] leading-tight break-words">{course.schedule || "Weekdays"}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-auto">
            {/* View Course Button */}
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg mr-3">
              <Eye className="w-4 h-4" />
              <span className="text-sm">View Course</span>
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Edit Button */}
              <button
                onClick={handleEdit}
                className="p-3 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-xl transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                title="Edit Course"
              >
                <Edit className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                className={`p-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleDelete(e, course._id)}
                disabled={isDeleting}
                title="Delete Course"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#4D423A]">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span>4.8</span>
          </div>
        </div>

        {/* Corner Decorative Element */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>
      </Link>

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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
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

export default CourseCard;
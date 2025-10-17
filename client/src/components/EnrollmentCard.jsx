import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, User, Mail, Hash, BookOpen, Calendar, Eye, XCircle } from 'lucide-react';
import api from '../lib/axios';
import { toast } from 'react-toastify';

// Simple date formatter
const formatDate = (date) => date.toLocaleDateString();

const EnrollmentCard = ({ enrollment, setEnrollments }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to cancel this enrollment?")) return;

    setIsCanceling(true);
    try {
      // Remove from localStorage
      const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      const updatedEnrollments = storedEnrollments.filter((enrollment) => enrollment.id !== id);
      localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
      
      // Update state
      setEnrollments((prev) => prev.filter((enrollment) => enrollment.id !== id));
      toast.success("Enrollment canceled successfully");
    } catch (error) {
      console.log("Error in handleCancel", error);
      toast.error("Failed to cancel enrollment");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div 
      className="group relative transform transition-all duration-500 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/enrollments/${enrollment.id}`}
        className="block relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-[#FEF4F1] hover:border-[#FBAA99]"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEF4F1]/50 to-[#FBAA99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        
        {/* Left accent bar with gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#FBAA99] via-[#4D423A] to-[#000000] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent transform -skew-y-12 translate-y-[-100%] group-hover:translate-y-[200%] transition-transform duration-700"></div>
        </div>

        <div className="p-6 pl-8 relative z-20">
          <div className="flex items-center justify-between">
            {/* Left Section - Main Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Student Avatar */}
              <div className="w-14 h-14 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {enrollment.userName?.charAt(0)?.toUpperCase() || 'S'}
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-xl font-bold text-[#4D423A] group-hover:text-[#FBAA99] transition-colors duration-300 truncate">
                    {enrollment.userName}
                  </h3>
                </div>
                <div className="flex items-center text-sm text-[#4D423A]/60">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>Enrolled: {enrollment.enrollmentDate ? formatDate(new Date(enrollment.enrollmentDate)) : "Recently"}</span>
                </div>
              </div>
            </div>

            {/* Right Section - Details Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-4 ml-6">
              {/* Username */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-w-[140px]">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#4D423A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Username</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.userName}</div>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-w-[140px]">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-[#4D423A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">User ID</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.userId}</div>
                </div>
              </div>

              {/* Course ID */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-w-[140px]">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hash className="w-4 h-4 text-[#4D423A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Course ID</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.courseId}</div>
                </div>
              </div>

              {/* Course Name */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 min-w-[180px]">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-[#4D423A]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Course</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.courseName}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6 flex-shrink-0">
              {/* View Details Button */}
              <button className="px-5 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
                <Eye className="w-4 h-4" />
                <span className="hidden xl:inline">View Details</span>
              </button>

              {/* Cancel Button */}
              <button
                className={`px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 ${isCanceling ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleCancel(e, enrollment._id)}
                disabled={isCanceling}
                title="Cancel Enrollment"
              >
                {isCanceling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden xl:inline">Canceling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span className="hidden xl:inline">Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile/Tablet View - Show details below on smaller screens */}
          <div className="lg:hidden mt-4 pt-4 border-t-2 border-[#FEF4F1]">
            <div className="grid grid-cols-2 gap-3">
              {/* Username */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl border border-[#FBAA99]/20">
                <User className="w-4 h-4 text-[#4D423A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Username</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.userName}</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl border border-[#FBAA99]/20">
                <Mail className="w-4 h-4 text-[#4D423A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Email</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.email}</div>
                </div>
              </div>

              {/* Course Name */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl border border-[#FBAA99]/20">
                <BookOpen className="w-4 h-4 text-[#4D423A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Course</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.courseName}</div>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl border border-[#FBAA99]/20">
                <Hash className="w-4 h-4 text-[#4D423A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">User ID</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.userId}</div>
                </div>
              </div>

              {/* Course ID */}
              <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl border border-[#FBAA99]/20">
                <Hash className="w-4 h-4 text-[#4D423A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[#4D423A]/60 font-medium">Course ID</div>
                  <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.courseId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Email - Desktop Only */}
          <div className="hidden lg:flex items-center mt-4 pt-4 border-t-2 border-[#FEF4F1]">
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#4D423A]/60 font-medium">Email Address</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{enrollment.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>

      </Link>

      {/* Enhanced Shadow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#FBAA99]/20 to-[#4D423A]/20 rounded-2xl blur-xl transition-all duration-300 -z-10 ${isHovered ? 'opacity-50 scale-105' : 'opacity-0'}`}></div>

      {/* Custom Styles */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default EnrollmentCard;
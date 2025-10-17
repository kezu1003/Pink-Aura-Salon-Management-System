import React, { useState } from 'react';
import { Link } from 'react-router';
import { CalendarCheck, Clock, MapPin, Calendar, Users, Star, Heart, Sparkles } from "lucide-react";
import api from '../lib/axios';
import { toast } from 'react-toastify';
import { useLikedEvents } from '../context/LikedEventsContext';

// Simple date formatter
const formatDate = (date) => date.toLocaleDateString();

const UserEventCard = ({ event, onRegister }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toggleLike, isEventLiked } = useLikedEvents();
  const isLiked = isEventLiked(event._id);

  const handleRegistration = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRegistering(true);
    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRegister?.(event._id);
      toast.success(`Successfully registered for ${event.title}!`);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(event._id);
    toast.success(isLiked ? "Removed from wishlist" : "Added to wishlist!");
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
              {/* Event Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                {event.title?.charAt(0) || 'E'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#4D423A] group-hover:text-[#FBAA99] transition-colors duration-300 line-clamp-1">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-[#4D423A]/60 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>4.9</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>45 going</span>
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

          {/* Event Description */}
          <div className="mb-6">
            <p className="text-[#4D423A]/80 line-clamp-3 leading-relaxed text-sm">
              {event.content || "Join us for an exciting beauty event where you'll learn new techniques, meet fellow enthusiasts, and discover the latest trends in the industry."}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {/* Venue */}
            <div className="flex items-center space-x-2 p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/10 transition-colors duration-200 border border-[#FBAA99]/20">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FBAA99]/20 to-[#4D423A]/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#4D423A]" />
              </div>
              <div>
                <div className="text-xs text-[#4D423A]/60 font-medium">Venue</div>
                <div className="text-sm font-bold text-[#4D423A] truncate">{event.venue || "Pink Aura Academy"}</div>
              </div>
            </div>
          </div>

          {/* Event Features */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FBAA99]/20 text-[#4D423A] border border-[#FBAA99]/30">
                <Calendar className="w-3 h-3 mr-1" />
                Workshop
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4D423A]/20 text-[#4D423A] border border-[#4D423A]/30">
                <Clock className="w-3 h-3 mr-1" />
                3 Hours
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Popular
              </span>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-[#FEF4F1]">
            {/* Event Date */}
            <div className="text-xs text-[#4D423A]/60">
              <span className="font-medium">Created:</span> {event.createdAt ? formatDate(new Date(event.createdAt)) : "Recently"}
            </div>

            {/* Registration Button */}
            {/* <button
              onClick={handleRegistration}
              disabled={isRegistering}
              className={`px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                isRegistering ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isRegistering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Register Now</span>
                </>
              )}
            </button> */}
          </div>
        </div>

        {/* Hover indicator */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>

        {/* Floating Registration Badge */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#4D423A] shadow-lg">
            <Users className="w-3 h-3 text-[#FBAA99]" />
            <span>45 spots left</span>
          </div>
        </div>

        {/* Corner Decorative Element */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>

        {/* Early Bird Badge for Special Events */}
        {Math.random() > 0.6 && (
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold transform -rotate-12 shadow-lg">
              EARLY BIRD
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

export default UserEventCard;
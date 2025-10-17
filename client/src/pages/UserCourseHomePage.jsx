import { useEffect, useState } from "react";
import UserCourseCard from "../components/UserCourseCard";
import CoursesNotFound from "../components/CoursesNotFound";
import api from '../lib/axios';
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LikedCoursesProvider, useLikedCourses } from '../context/LikedCoursesContext';
import LikedCoursesIndicator from '../components/LikedCoursesIndicator';
import { 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Award, 
  Users, 
  BookOpen, 
  Search, 
  Heart, 
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Phone
} from "lucide-react";

// Enhanced Floating WhatsApp Component
const FloatingWhatsApp = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleWhatsAppClick = () => {
    setIsClicked(true);
    const phoneNumber = "94784596755";
    const message = "Hi! I'm interested in your salon courses. Could you please provide more information about course schedules, pricing, and enrollment process?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      if (window.open(whatsappUrl, '_blank')) {
        console.log("WhatsApp opened successfully");
        toast.success("Opening WhatsApp...");
      } else {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      navigator.clipboard.writeText(whatsappUrl).then(() => {
        toast.success("WhatsApp link copied to clipboard!");
      }).catch(() => {
        toast.error("Please contact us at +94 78 459 6755");
      });
    }
    
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-4 bg-gradient-to-r from-[#4D423A] to-[#2D1B1B] text-white px-6 py-4 rounded-2xl text-sm whitespace-nowrap shadow-2xl animate-bounce-in border-2 border-[#FBAA99]/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#FBAA99]">Get Course Info!</div>
              <div className="text-xs text-white/80">Click to chat with us</div>
            </div>
          </div>
          <div className="absolute top-full right-8 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-[#4D423A]"></div>
        </div>
      )}

      {/* Enhanced WhatsApp Button */}
      <div className="relative">
        {/* Pulsing Ring Animation */}
        <div className={`absolute inset-0 rounded-full bg-green-400 animate-ping ${isHovered ? 'opacity-30' : 'opacity-20'} pointer-events-none`}></div>
        
        {/* Secondary Ring */}
        <div className={`absolute inset-0 rounded-full bg-green-300 animate-pulse ${isHovered ? 'opacity-40' : 'opacity-10'} pointer-events-none`}></div>

        <button
          onMouseEnter={() => {
            setShowTooltip(true);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setShowTooltip(false);
            setIsHovered(false);
          }}
          onClick={handleWhatsAppClick}
          className={`w-20 h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 flex items-center justify-center text-white relative overflow-hidden group ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${isClicked ? 'scale-95' : ''}`}
          title="Contact us on WhatsApp about courses"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          
          {/* WhatsApp Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <MessageCircle className={`w-10 h-10 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
          </div>

          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white animate-bounce">
            1
          </div>

          {/* Hover Glow Effect */}
          <div className={`absolute inset-0 rounded-full bg-green-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${isHovered ? 'opacity-20' : ''}`}></div>
        </button>

        {/* Floating Particles */}
        <div className="absolute -top-3 -left-3 w-3 h-3 bg-[#FBAA99] rounded-full animate-float opacity-60"></div>
        <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-[#FBAA99] rounded-full animate-float-delayed opacity-40"></div>
      </div>
    </div>
  );
};

// Stats Section for Users
const UserStatsSection = () => {
  const stats = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      value: "25+",
      label: "Professional Courses",
      color: "text-[#FBAA99]",
      bg: "bg-[#FEF4F1]",
      description: "Expert-led programs"
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "1000+",
      label: "Happy Students",
      color: "text-[#4D423A]",
      bg: "bg-[#FEF4F1]",
      description: "Success stories"
    },
    {
      icon: <Award className="w-8 h-8" />,
      value: "95%",
      label: "Job Placement",
      color: "text-[#FBAA99]",
      bg: "bg-[#FEF4F1]",
      description: "Career success rate"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      value: "12+",
      label: "Course Duration",
      color: "text-[#4D423A]",
      bg: "bg-[#FEF4F1]",
      description: "Weeks of training"
    },
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#4D423A] mb-2">Why Choose Pink Aura?</h3>
        <p className="text-[#4D423A]/70">Join thousands of successful beauty professionals</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group relative overflow-hidden text-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FBAA99]/5 to-[#4D423A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className={`inline-flex p-3 rounded-xl ${stat.color} bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-[#4D423A] mb-2">{stat.value}</div>
              <div className="font-semibold text-[#4D423A] mb-1">{stat.label}</div>
              <div className="text-sm text-[#4D423A]/60">{stat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hero Section with Slideshow
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Transform Your Passion Into Profession",
      subtitle: "Professional Beauty Courses at Pink Aura",
      description: "Master the art of beauty with our comprehensive training programs designed to launch your career in the beauty industry.",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#FBAA99] to-[#4D423A]"
    },
    {
      title: "Expert Instructors, Real Results",
      subtitle: "Learn from Industry Professionals",
      description: "Our experienced instructors bring years of industry knowledge to help you master every technique and build confidence.",
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#4D423A] to-[#000000]"
    },
    {
      title: "Hands-On Learning Experience",
      subtitle: "Practice Makes Perfect",
      description: "Get practical experience with our state-of-the-art facilities and real client interactions during your training.",
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#FBAA99] via-[#4D423A] to-[#000000]"
    },
    {
      title: "Your Beauty Career Starts Here",
      subtitle: "Job Placement Assistance",
      description: "Join our network of successful graduates working in top salons and building their own beauty businesses.",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#000000] to-[#4D423A]"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="mb-12">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border-4 border-[#FEF4F1]">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full relative">
              <div className="aspect-[16/6] relative overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-85`}></div>
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="absolute inset-0 flex items-center justify-center relative z-10 text-center text-white px-8">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 mb-6">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-medium">{slide.subtitle}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto drop-shadow-lg leading-relaxed mb-8">
                      {slide.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-full font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>Browse Courses</span>
                      </button>
                      <button className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white rounded-full font-semibold transition-all duration-300 flex items-center space-x-2">
                        <Phone className="w-5 h-5" />
                        <span>Contact Us</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-8 right-8 w-24 h-24 border-4 border-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white/20 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={goToPrevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30 text-white hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={goToNextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30 text-white hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 border-2 border-white ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/40 hover:bg-white/70 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Search and Filter Section
const SearchFilterSection = ({ searchTerm, setSearchTerm, showLikedOnly, setShowLikedOnly, viewMode, setViewMode }) => {
  const { getLikedCoursesCount } = useLikedCourses();

  return (
    <div className="mb-12">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#4D423A] mb-2">Find Your Perfect Course</h2>
          <p className="text-[#4D423A]/70">Discover courses that match your interests and career goals</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4D423A]/60 w-5 h-5 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search courses by name, skills, or career path..."
              className="w-full pl-12 pr-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter and View Controls */}
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex border-2 border-[#FEF4F1] rounded-xl overflow-hidden bg-[#FEF4F1]/50 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-4 transition-all duration-200 flex items-center justify-center ${
                  viewMode === 'grid' ? 'bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white shadow-lg' : 'text-[#4D423A] hover:bg-[#FBAA99]/10'
                }`}
                title="Grid View"
              >
                <div className="grid grid-cols-2 gap-1 w-5 h-5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-4 transition-all duration-200 flex items-center justify-center ${
                  viewMode === 'list' ? 'bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white shadow-lg' : 'text-[#4D423A] hover:bg-[#FBAA99]/10'
                }`}
                title="List View"
              >
                <div className="space-y-1 w-5 h-5">
                  <div className="w-full h-1 bg-current rounded"></div>
                  <div className="w-full h-1 bg-current rounded"></div>
                  <div className="w-full h-1 bg-current rounded"></div>
                </div>
              </button>
            </div>

            {/* Liked Courses Filter */}
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                showLikedOnly
                  ? 'bg-[#FBAA99] text-white shadow-lg'
                  : 'bg-[#FEF4F1] text-[#4D423A] hover:bg-[#FBAA99]/20 hover:text-[#FBAA99] border-2 border-[#FEF4F1] hover:border-[#FBAA99]/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${showLikedOnly ? 'fill-current' : ''}`} />
              <span>Liked Courses</span>
              {getLikedCoursesCount() > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {getLikedCoursesCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserCourseHomePageContent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const { likedCourses, isCourseLiked, clearAllLikedCourses, toggleLike } = useLikedCourses();

  // Handle like toggle for list view
  const handleLikeToggle = (courseId) => {
    toggleLike(courseId);
    toast.success(isCourseLiked(courseId) ? "Course removed from favorites" : "Course added to favorites");
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        console.log(res.data);
        setCourses(res.data);
      } catch (error) {
        console.log("Error fetching courses");
        console.log(error.response);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search and liked filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = !searchTerm || 
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLikedFilter = !showLikedOnly || isCourseLiked(course._id);
    
    return matchesSearch && matchesLikedFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#FEF4F1] rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#FBAA99] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#4D423A] font-medium text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] via-white to-[#FEF4F1] relative overflow-hidden">
      <Navbar />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

       <div className="relative z-10 course-home-page p-6 pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Stats Section */}
          <UserStatsSection />
          
          {/* Search and Filter */}
          <SearchFilterSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showLikedOnly={showLikedOnly}
            setShowLikedOnly={setShowLikedOnly}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Course Results Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#4D423A] mb-2">
                {showLikedOnly 
                  ? `Your Liked Courses (${filteredCourses.length})`
                  : searchTerm 
                    ? `${filteredCourses.length} Course${filteredCourses.length !== 1 ? 's' : ''} Found`
                    : "Available Courses"}
              </h2>
              <p className="text-[#4D423A]/70">
                {showLikedOnly
                  ? "Courses you've marked as favorites"
                  : searchTerm
                    ? "Matching your search criteria"
                    : "Choose from our comprehensive beauty training programs"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LikedCoursesIndicator className="bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30" />
              {showLikedOnly && likedCourses.length > 0 && (
                <button
                  onClick={() => {
                    clearAllLikedCourses();
                    toast.success("All liked courses cleared!");
                  }}
                  className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full border-2 border-red-200 hover:bg-red-100 transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {courses.length} Total Courses Available
              </div>
            </div>
          </div>

          {/* Courses Grid/List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {filteredCourses.map((course) => (
                <UserCourseCard key={course._id} course={course} setCourses={setCourses} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-12">
              {filteredCourses.map((course) => (
                <div key={course._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#FEF4F1] shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    {/* Course Image/Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center flex-shrink-0 mx-auto lg:mx-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Course Info */}
                    <div className="flex-1 min-w-0 text-center lg:text-left">
                      <h3 className="text-xl font-bold text-[#4D423A] mb-2 break-words">{course.courseName}</h3>
                      <p className="text-[#4D423A]/70 mb-3 line-clamp-2">{course.description}</p>
                      
                      {/* Course Details */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-[#4D423A]/60">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span className="truncate max-w-32">{course.instructorName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-32">{course.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-end flex-shrink-0">
                      <button 
                        onClick={() => window.open(`/courses/${course._id}`, '_blank')}
                        className="px-4 py-2 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1 shadow-lg"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleLikeToggle(course._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1 shadow-lg ${
                          isCourseLiked(course._id) 
                            ? 'bg-gradient-to-r from-red-500 to-red-700 text-white' 
                            : 'bg-gradient-to-r from-[#4D423A] to-[#000000] text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isCourseLiked(course._id) ? 'fill-current' : ''}`} />
                        <span>{isCourseLiked(course._id) ? 'Liked' : 'Like'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Courses Found */}
          {filteredCourses.length === 0 && !loading && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg">
              <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-[#FBAA99]" />
              </div>
              <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No courses found</h3>
              <p className="text-[#4D423A]/70 mb-6 max-w-md mx-auto">
                {searchTerm ? `No courses match "${searchTerm}"` : "No courses available"}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                }}
                className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                View All Courses
              </button>
            </div>
          )}

          {courses.length === 0 && !loading && <CoursesNotFound />}
        </div>
      </div>

      {/* Enhanced Floating WhatsApp */}
      <FloatingWhatsApp />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-8px) rotate(-180deg);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }

        /* Enhanced focus styles */
        input:focus {
          box-shadow: 0 0 0 4px rgba(251, 170, 153, 0.2);
        }

        /* Smooth transitions */
        * {
          transition-property: color, background-color, border-color, opacity, box-shadow, transform, filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }
      `}</style>
      <Footer />
    </div>
  );
};

const UserCourseHomePage = () => {
  return (
    <LikedCoursesProvider>
      <UserCourseHomePageContent />
    </LikedCoursesProvider>
  );
};

export default UserCourseHomePage;
import {useEffect, useState } from "react";
import { Link } from 'react-router';
import EnrollmentCard from '../components/EnrollmentCard'; 
import api from '../lib/axios';
import toast from "react-hot-toast";
import { 
  SearchIcon, 
  XIcon, 
  LoaderIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserCheck,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Plus,
  Filter,
  Target,
  Zap,
  Globe,
  BarChart3,
  Mail,
  Calendar,
  FileText,
  Settings
} from "lucide-react";

const EnrollmentListPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Enhanced slideshow data for enrollment management
  const enrollmentSlideImages = [
    {
      title: "Enrollment Management",
      description: "Track and manage all student enrollments in one place",
      gradient: "from-[#FBAA99] to-[#4D423A]",
      icon: <UserCheck className="w-16 h-16" />
    },
    {
      title: "Student Progress Tracking",
      description: "Monitor student progress and course completion rates",
      gradient: "from-[#4D423A] to-[#000000]",
      icon: <TrendingUp className="w-16 h-16" />
    },
    {
      title: "Course Analytics",
      description: "View enrollment statistics and trends",
      gradient: "from-[#FEF4F1] via-[#FBAA99] to-[#4D423A]",
      icon: <BarChart3 className="w-16 h-16" />
    },
    {
      title: "Certificate Issuance",
      description: "Issue certificates to qualified students",
      gradient: "from-[#000000] to-[#4D423A]",
      icon: <Award className="w-16 h-16" />
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % enrollmentSlideImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [enrollmentSlideImages.length]);

  // Navigation functions
  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + enrollmentSlideImages.length) % enrollmentSlideImages.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % enrollmentSlideImages.length);

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get("/enrollments");
        console.log(res.data);
        setEnrollments(res.data);
        setFilteredEnrollments(res.data);
      } catch (error) {
        console.log("Error fetching enrollments");
        console.log(error.response);
        toast.error("Failed to fetch enrollments");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  // Search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredEnrollments(enrollments);
      return;
    }

    setSearching(true);

    try {
      let filtered = enrollments;

      // Filter by search query
      if (searchQuery.trim()) {
        if (enrollments.length > 0) {
          // Try backend search first if available
          try {
            const res = await api.get(`/enrollments/search?q=${encodeURIComponent(searchQuery)}`);
            filtered = res.data;
          } catch (error) {
            // Fall back to client-side search
            filtered = filtered.filter(enrollment =>
              enrollment.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              enrollment.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              enrollment.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              enrollment.courseID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              enrollment.userID?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        }
      }

      setFilteredEnrollments(filtered);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setFilteredEnrollments(enrollments);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Admin Stats Component
  const EnrollmentStatsGrid = () => {
    const stats = [
      { icon: <UserCheck className="w-8 h-8" />, label: "Total Enrollments", value: enrollments.length || "0", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <Users className="w-8 h-8" />, label: "Active Students", value: enrollments.length || "0", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" },
      { icon: <BookOpen className="w-8 h-8" />, label: "Courses Enrolled", value: new Set(enrollments.map(e => e.courseID)).size || "0", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <TrendingUp className="w-8 h-8" />, label: "Completion Rate", value: "87%", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FBAA99]/5 to-[#4D423A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#4D423A]">{stat.value}</div>
                </div>
              </div>
              <div className="text-[#4D423A] font-semibold text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FEF4F1] rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FBAA99] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#4D423A] font-medium">Loading enrollments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] via-white to-[#FEF4F1] relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Admin Hero Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
              <UserCheck className="w-6 h-6 text-[#4D423A]" />
              <span className="text-[#4D423A] font-bold">Enrollment Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Student Enrollments
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
              Track and manage all student enrollments efficiently
            </p>
          </div>

          {/* Stats Grid */}
          <EnrollmentStatsGrid />

          {/* Advanced Search Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {searching ? (
                    <LoaderIcon className="h-5 w-5 text-[#FBAA99] animate-spin" />
                  ) : (
                    <SearchIcon className="h-5 w-5 text-[#4D423A]/60 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
                  )}
                </div>
                
                <input
                  type="text"
                  placeholder="Search by student name, email, course name, user ID, or course ID..."
                  className="w-full pl-12 pr-12 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-red-500 transition-colors text-[#4D423A]/60"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                {/* Add Enrollment Button */}
                <Link 
                  to="/enrollments/create"
                  className="px-6 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Enrollment</span>
                </Link>
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mt-4 text-center">
                <p className="text-sm text-[#4D423A]/70 bg-[#FEF4F1] px-4 py-2 rounded-full inline-block">
                  {searching ? (
                    "Searching..."
                  ) : (
                    <>
                      Found <span className="font-bold text-[#FBAA99]">{filteredEnrollments.length}</span> enrollment{filteredEnrollments.length !== 1 ? 's' : ''} 
                      {searchQuery && ` matching "${searchQuery}"`}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Slideshow */}
          <div className="mb-12">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border-4 border-[#FEF4F1]">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {enrollmentSlideImages.map((slide, index) => (
                    <div key={index} className="min-w-full relative">
                      <div className={`aspect-[16/6] bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10 text-center text-white px-8">
                          <div className="mb-6 opacity-80">
                            {slide.icon}
                          </div>
                          <h3 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h3>
                          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">{slide.description}</p>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-8 right-8 w-20 h-20 border-4 border-white/20 rounded-full"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white/20 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <button
                  onClick={goToPrevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                
                <button
                  onClick={goToNextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30"
                >
                  <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-4">
                  {enrollmentSlideImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 border-2 border-white ${
                        index === currentSlide 
                          ? 'bg-white scale-125 shadow-lg' 
                          : 'bg-white/30 hover:bg-white/60 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#4D423A] mb-2">
                All Enrollments
              </h2>
              <p className="text-[#4D423A]/70">
                {searchQuery
                  ? `${filteredEnrollments.length} enrollment${filteredEnrollments.length !== 1 ? 's' : ''} found`
                  : `Managing ${enrollments.length} total enrollments`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {enrollments.length} Total Enrollments
              </div>
              <Link 
                to="/enrollments/create"
                className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>New Enrollment</span>
              </Link>
            </div>
          </div>

          {/* Enrollments List - Stripe Layout */}
          <div className="space-y-6 mb-8">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment._id} enrollment={enrollment} setEnrollments={setEnrollments} />
            ))}
          </div>

          {/* Empty States */}
          {filteredEnrollments.length === 0 && !loading && !searching && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg">
              {searchQuery ? (
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="h-12 w-12 text-[#FBAA99]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No enrollments found</h3>
                  <p className="text-[#4D423A]/70 mb-6">
                    No enrollments match your current search criteria
                  </p>
                  <button 
                    onClick={clearSearch}
                    className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserCheck className="h-12 w-12 text-[#FBAA99]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No enrollments yet</h3>
                  <p className="text-[#4D423A]/70 mb-6">
                    Start by creating your first enrollment
                  </p>
                  <Link
                    to="/enrollments/create"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Enrollment</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {searchQuery && filteredEnrollments.length === 0 && !searching && (
            <div className="max-w-3xl mx-auto mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1]">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 text-[#FBAA99] mx-auto mb-4" />
                <h4 className="text-xl font-bold text-[#4D423A] mb-2">Search Optimization Tips</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#4D423A] flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-[#FBAA99]" />
                    Quick Tips:
                  </h5>
                  <ul className="text-sm text-[#4D423A]/70 space-y-2 ml-6">
                    <li>• Try different keywords or phrases</li>
                    <li>• Check spelling and try synonyms</li>
                    <li>• Use more general search terms</li>
                    <li>• Try searching by email or ID</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#4D423A] flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-[#FBAA99]" />
                    Search By:
                  </h5>
                  <ul className="text-sm text-[#4D423A]/70 space-y-2 ml-6">
                    <li>• Student names</li>
                    <li>• Email addresses</li>
                    <li>• Course names</li>
                    <li>• User ID or Course ID</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 bg-gradient-to-r from-[#4D423A] to-[#FBAA99] text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Start Fresh Search
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="mt-12 bg-gradient-to-r from-[#FEF4F1] to-white rounded-3xl shadow-lg border-2 border-[#FBAA99]/20 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#4D423A] mb-2">Quick Actions</h3>
              <p className="text-[#4D423A]/70">Streamline your enrollment management</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Plus className="w-6 h-6" />, label: "New Enrollment", desc: "Enroll student", color: "from-[#FBAA99] to-[#4D423A]", link: "/enrollments/create" },
                { icon: <Users className="w-6 h-6" />, label: "View Students", desc: "All students", color: "from-[#4D423A] to-[#000000]", link: "#" },
                { icon: <BookOpen className="w-6 h-6" />, label: "View Courses", desc: "All courses", color: "from-[#FBAA99] to-[#4D423A]", link: "/courses" },
                { icon: <BarChart3 className="w-6 h-6" />, label: "View Analytics", desc: "Statistics", color: "from-[#4D423A] to-[#000000]", link: "#" },
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="group p-6 rounded-2xl border-2 border-[#FEF4F1] hover:border-[#FBAA99] transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm hover:shadow-xl block"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    {action.icon}
                  </div>
                  <div className="text-[#4D423A] font-semibold group-hover:text-[#FBAA99] transition-colors duration-200 mb-1">
                    {action.label}
                  </div>
                  <div className="text-xs text-[#4D423A]/60">
                    {action.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="relative group">
              <Link
                to="/enrollments/create"
                className="w-16 h-16 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <Plus className="w-8 h-8 relative z-10" />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-3 bg-[#4D423A] text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0">
                New Enrollment
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#4D423A]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #FEF4F1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #FBAA99, #4D423A);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4D423A, #000000);
        }

        /* Enhanced focus styles */
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 170, 153, 0.3);
        }

        /* Smooth transitions for all elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default EnrollmentListPage;
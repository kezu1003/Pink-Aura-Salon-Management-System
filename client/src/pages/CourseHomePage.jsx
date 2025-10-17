import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; 
import CourseCard from '../components/CourseCard'; 
import CoursesNotFound from '../components/CoursesNotFound';
import api from '../lib/axios';
import toast from "react-hot-toast";
import { useScrollAnimationMultiple } from '../hooks/useScrollAnimation';
import { 
  SearchIcon, 
  XIcon, 
  LoaderIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Settings,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Plus,
  Filter,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  Calendar,
  Clock,
  Star,
  FileText,
  Download,
  Send,
  Zap,
  Globe,
  Target,
  ArrowLeft 
} from "lucide-react";

const CourseHomePage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState("grid");
  const visibleElements = useScrollAnimationMultiple(0.1);

  // Categories for filtering
  const categories = [
    "All Categories", "Hair Styling", "Makeup Artistry", "Nail Art", 
    "Spa & Wellness", "Bridal Beauty", "Men's Grooming", "Business"
  ];

  // Enhanced slideshow data for admin
  const adminSlideImages = [
    {
      title: "Admin Dashboard Overview",
      description: "Manage all your beauty academy courses efficiently",
      gradient: "from-[#FBAA99] to-[#4D423A]",
      icon: <Settings className="w-16 h-16" />
    },
    {
      title: "Student Management",
      description: "Track student progress and course completions",
      gradient: "from-[#4D423A] to-[#000000]",
      icon: <Users className="w-16 h-16" />
    },
    {
      title: "Course Analytics",
      description: "Monitor course performance and engagement metrics",
      gradient: "from-[#FEF4F1] via-[#FBAA99] to-[#4D423A]",
      icon: <BarChart3 className="w-16 h-16" />
    },
    {
      title: "Certificate Management",
      description: "Issue and manage professional certificates",
      gradient: "from-[#000000] to-[#4D423A]",
      icon: <Award className="w-16 h-16" />
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % adminSlideImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [adminSlideImages.length]);

  // Handle scroll animations
  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll-animation]');
    elements.forEach((element, index) => {
      if (visibleElements.has(index)) {
        element.classList.add('animate-in');
      } else {
        element.classList.remove('animate-in');
      }
    });
  }, [visibleElements]);

  // Navigation functions
  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + adminSlideImages.length) % adminSlideImages.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % adminSlideImages.length);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        console.log(res.data);
        setCourses(res.data);
        setFilteredCourses(res.data);
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

  // Search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategory]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedCategory === "All Categories") {
      setFilteredCourses(courses);
      return;
    }

    setSearching(true);

    try {
      let filtered = courses;

      // Filter by category
      if (selectedCategory !== "All Categories") {
        filtered = filtered.filter(course => 
          course.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        if (courses.length > 0) {
          // Try backend search first if available
          try {
            const res = await api.get(`/courses/search?q=${encodeURIComponent(searchQuery)}`);
            filtered = res.data;
          } catch (error) {
            // Fall back to client-side search
            filtered = filtered.filter(course =>
              course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
        }
      }

      setFilteredCourses(filtered);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setFilteredCourses(courses);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted successfully");
      
      // Refresh the courses list
      const res = await api.get("/courses");
      setCourses(res.data);
      setFilteredCourses(res.data);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete course");
    }
  };

  // Admin Stats Component
  const AdminStatsGrid = () => {
    const stats = [
      { icon: <BookOpen className="w-8 h-8" />, label: "Total Courses", value: courses.length || "0", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <Users className="w-8 h-8" />, label: "Active Students", value: "1,247", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" },
      { icon: <Award className="w-8 h-8" />, label: "Certificates Issued", value: "892", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <TrendingUp className="w-8 h-8" />, label: "Success Rate", value: "94%", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" }
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

  // Enhanced Course Card for Admin
  const AdminCourseCard = ({ course }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleIssueCertificate = (courseId) => {
      toast.success("Certificate issued successfully!");
    };

    return (
      <div 
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border-2 border-[#FEF4F1] hover:border-[#FBAA99] group relative overflow-hidden transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FEF4F1]/50 to-[#FBAA99]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {course.courseName?.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#4D423A] group-hover:text-[#FBAA99] transition-colors duration-300">
                  {course.courseName}
                </h3>
                <div className="flex items-center דו-space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Updated 2 days ago</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
            {course.description || "Professional beauty course designed to enhance your skills and career prospects."}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/20 transition-colors duration-200 border border-[#FBAA99]/20">
              <Users className="w-5 h-5 mx-auto mb-1 text-[#4D423A]" />
              <div className="text-lg font-bold text-[#4D423A]">24</div>
              <div className="text-xs text-gray-500 font-medium">Students</div>
            </div>
            <div className="text-center p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/20 transition-colors duration-200 border border-[#FBAA99]/20">
              <Clock className="w-5 h-5 mx-auto mb-1 text-[#4D423A]" />
              <div className="text-lg font-bold text-[#4D423A]">12h</div>
              <div className="text-xs text-gray-500 font-medium">Duration</div>
            </div>
            <div className="text-center p-3 bg-[#FEF4F1] rounded-xl hover:bg-[#FBAA99]/20 transition-colors duration-200 border border-[#FBAA99]/20">
              <Star className="w-5 h-5 mx-auto mb-1 text-[#4D423A]" />
              <div className="text-lg font-bold text-[#4D423A]">4.8</div>
              <div className="text-xs text-gray-500 font-medium">Rating</div>
            </div>
          </div>

          {/* Action Buttons - First Row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button className="px-3 py-2 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1 shadow-lg">
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="px-3 py-2 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons - Second Row */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleIssueCertificate(course._id)}
              className="px-3 py-2 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1 shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Issue Certificate</span>
            </button>
            <button className="px-3 py-2 bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]/30 hover:border-[#FBAA99] rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Hover indicator */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></div>
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
          <p className="text-[#4D423A] font-medium">Loading admin dashboard...</p>
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

      <div className="relative z-10 course-home-page p-6">
        <div className="max-w-7xl mx-auto">
          {/* Admin Hero Header */}
          <div className="text-center mb-8" data-scroll-animation>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Link 
                to="/admin" 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Admin Dashboard</span>
              </Link>
              <Link 
                to="/courses/create"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Course</span>
              </Link>
            </div>
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
              <Settings className="w-6 h-6 text-[#4D423A]" />
              <span className="text-[#4D423A] font-bold">Admin Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Beauty Academy Management
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
              "Efficiently manage courses, students, and certificates with powerful administrative tools"
            </p>
          </div>

          {/* Stats Grid */}
          <div data-scroll-animation>
            <AdminStatsGrid />
          </div>

          {/* Advanced Search and Filter Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6 mb-8" data-scroll-animation>
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
                  placeholder="Search courses, instructors, categories, or descriptions..."
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
                {/* Category Filter */}
                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4D423A]/60 w-5 h-5 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl transition-all duration-300 hover:shadow-md min-w-48 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

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

                {/* Add Course Button */}
                <Link 
                  to="/courses/create"
                  className="px-6 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Course</span>
                </Link>
              </div>
            </div>

            {/* Search Results Info */}
            {(searchQuery || selectedCategory !== "All Categories") && (
              <div className="mt-4 text-center">
                <p className="text-sm text-[#4D423A]/70 bg-[#FEF4F1] px-4 py-2 rounded-full inline-block">
                  {searching ? (
                    "Searching..."
                  ) : (
                    <>
                      Found <span className="font-bold text-[#FBAA99]">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} 
                      {searchQuery && ` matching "${searchQuery}"`}
                      {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Admin Slideshow */}
          <div className="mb-12" data-scroll-animation>
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border-4 border-[#FEF4F1]">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {adminSlideImages.map((slide, index) => (
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

                {/* Enhanced Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-4">
                  {adminSlideImages.map((_, index) => (
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
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-scroll-animation>
            <div>
              <h2 className="text-3xl font-bold text-[#4D423A] mb-2">
                Course Management
              </h2>
              <p className="text-[#4D423A]/70">
                {(searchQuery || selectedCategory !== "All Categories")
                  ? `${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''} found`
                  : `Managing ${courses.length} total courses`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {courses.length} Total Courses
              </div>
              <Link 
                to="/courses/create"
                className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Create New Course</span>
              </Link>
            </div>
          </div>

          {/* Courses Grid/List View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8" data-scroll-animation>
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8" data-scroll-animation>
              {filteredCourses.map((course) => (
                <div key={course._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#FEF4F1] shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                  <div className="flex items-center space-x-6">
                    {/* Course Image/Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#4D423A] mb-2 truncate">{course.courseName}</h3>
                      <p className="text-[#4D423A]/70 mb-3 line-clamp-2">{course.description}</p>
                      
                      {/* Course Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#4D423A]/60">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.instructorName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>{course.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 flex-shrink-0">
                      <button className="px-4 py-2 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 shadow-lg">
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-[#4D423A] to-[#000000] text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 shadow-lg">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {filteredCourses.length === 0 && !loading && !searching && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg" data-scroll-animation>
              {searchQuery || selectedCategory !== "All Categories" ? (
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="h-12 w-12 text-[#FBAA99]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No courses found</h3>
                  <p className="text-[#4D423A]/70 mb-6">
                    No courses match your current search criteria
                  </p>
                  <button 
                    onClick={clearSearch}
                    className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <CoursesNotFound />
              )}
            </div>
          )}

          {/* Search Tips */}
          {searchQuery && filteredCourses.length === 0 && !searching && (
            <div className="max-w-3xl mx-auto mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1]" data-scroll-animation>
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
                    <li>• Remove category filters</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#4D423A] flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-[#FBAA99]" />
                    Search By:
                  </h5>
                  <ul className="text-sm text-[#4D423A]/70 space-y-2 ml-6">
                    <li>• Course names and descriptions</li>
                    <li>• Instructor names</li>
                    <li>• Course categories</li>
                    <li>• Duration or difficulty level</li>
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
          <div className="mt-12 bg-gradient-to-r from-[#FEF4F1] to-white rounded-3xl shadow-lg border-2 border-[#FBAA99]/20 p-8" data-scroll-animation>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#4D423A] mb-2">Quick Actions</h3>
              <p className="text-[#4D423A]/70">Streamline your administrative tasks</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Plus className="w-6 h-6" />, label: "Create New Course", desc: "Add new course", color: "from-[#FBAA99] to-[#4D423A]", link: "/courses/create" },
                { icon: <Users className="w-6 h-6" />, label: "Manage Students", desc: "View enrollment", color: "from-[#4D423A] to-[#000000]", link: "#" },
                { icon: <Award className="w-6 h-6" />, label: "Issue Certificates", desc: "Bulk certificates", color: "from-[#FBAA99] to-[#4D423A]", link: "/courses/certificate" },
                { icon: <BarChart3 className="w-6 h-6" />, label: "View Analytics", desc: "Performance metrics", color: "from-[#4D423A] to-[#000000]", link: "#" },
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
                to="/courses/create"
                className="w-16 h-16 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <Plus className="w-8 h-8 relative z-10" />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-3 bg-[#4D423A] text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0">
                Create New Course
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#4D423A]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-10px) rotate(2deg); 
          }
        }
        
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
        
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
        input:focus,
        select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 170, 153, 0.3);
        }

        /* Enhanced button hover effects */
        button:hover {
          filter: brightness(1.05);
        }

        /* Smooth transitions for all elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }

        /* Scroll Animation Classes */
        [data-scroll-animation] {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        [data-scroll-animation].animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Staggered animations for grid items */
        [data-scroll-animation] .grid > * {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        [data-scroll-animation].animate-in .grid > *:nth-child(1) { transition-delay: 0.1s; }
        [data-scroll-animation].animate-in .grid > *:nth-child(2) { transition-delay: 0.2s; }
        [data-scroll-animation].animate-in .grid > *:nth-child(3) { transition-delay: 0.3s; }
        [data-scroll-animation].animate-in .grid > *:nth-child(4) { transition-delay: 0.4s; }
        [data-scroll-animation].animate-in .grid > *:nth-child(5) { transition-delay: 0.5s; }
        [data-scroll-animation].animate-in .grid > *:nth-child(6) { transition-delay: 0.6s; }

        [data-scroll-animation].animate-in .grid > * {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default CourseHomePage;
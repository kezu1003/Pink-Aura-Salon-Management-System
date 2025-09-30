import { useEffect, useState } from "react";
import UserCourseCard from "../components/UserCourseCard";
import CoursesNotFound from "../components/CoursesNotFound";
import api from '../lib/axios';
import toast from "react-hot-toast";
import { 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Award, 
  Users, 
  BookOpen, 
  Search, 
  Filter, 
  Heart, 
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Calendar,
  PlayCircle
} from "lucide-react";

// Enhanced Floating WhatsApp Component
const FloatingWhatsApp = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = "94784596755";
    const message = "Hi! I'm interested in your salon courses. Could you please provide more information about course schedules, pricing, and enrollment process?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      if (window.open(whatsappUrl, '_blank')) {
        console.log("WhatsApp opened successfully");
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
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-4 bg-[#4D423A] text-white px-4 py-3 rounded-2xl text-sm whitespace-nowrap shadow-2xl animate-bounce-in border-2 border-[#FBAA99]/20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#FBAA99]" />
            <span>Ask about our courses!</span>
          </div>
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-[#4D423A]"></div>
        </div>
      )}

      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleWhatsAppClick}
        className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-white relative overflow-hidden group"
        title="Contact us on WhatsApp about courses"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        <MessageCircle className="w-8 h-8 relative z-10" />
      </button>

      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20 pointer-events-none"></div>
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
      icon: <Star className="w-8 h-8" />,
      value: "4.9",
      label: "Student Rating",
      color: "text-[#4D423A]",
      bg: "bg-[#FEF4F1]",
      description: "Excellent feedback"
    },
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-[#4D423A] mb-3">Why Choose Pink Aura?</h3>
        <p className="text-[#4D423A]/70 text-lg">Join thousands of successful beauty professionals</p>
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
    <div className="mb-16">
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
const SearchFilterSection = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
  const categories = [
    "All Courses", "Hair Styling", "Makeup Artistry", "Nail Art", 
    "Spa & Wellness", "Bridal Beauty", "Men's Grooming", "Business"
  ];

  return (
    <div className="mb-16">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#4D423A] mb-2">Find Your Perfect Course</h2>
          <p className="text-[#4D423A]/70 text-lg">Discover courses that match your interests and career goals</p>
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
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4D423A]/60 w-5 h-5 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl transition-all duration-300 hover:shadow-md min-w-64 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Featured Courses Section
const FeaturedCourses = ({ courses }) => {
  const featuredCourses = courses.slice(0, 3); // Show first 3 courses as featured
  
  if (featuredCourses.length === 0) return null;
  
  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#4D423A] mb-2">Featured Courses</h2>
        <p className="text-[#4D423A]/70 text-lg">Our most popular beauty training programs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredCourses.map((course, index) => (
          <div 
            key={course._id} 
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#FEF4F1] hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.image || "https://images.unsplash.com/photo-1594736797933-d0e64d1b0c1b?w=400&h=300&fit=crop&q=80"} 
                alt={course.courseName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4D423A] to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-xl">{course.courseName}</h3>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 fill-[#FBAA99] text-[#FBAA99] mr-1" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-[#FBAA99] text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-[#4D423A]/70 mb-4 line-clamp-2">
                {course.description || "Comprehensive beauty training program designed for aspiring professionals."}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-[#4D423A]/60">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.duration || "6 weeks"}</span>
                </div>
                <div className="flex items-center text-[#4D423A]/60">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.enrolledCount || "24"} enrolled</span>
                </div>
              </div>
              
              <button className="w-full bg-[#FEF4F1] hover:bg-[#FBAA99] hover:text-white text-[#4D423A] py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center">
                <BookOpen className="w-5 h-5 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Graduate, Makeup Artistry",
      content: "The instructors at Pink Aura are amazing! I went from knowing nothing about makeup to working at a high-end salon in just 3 months.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Graduate, Hair Styling",
      content: "The hands-on training and job placement assistance helped me start my career immediately after graduation. Highly recommended!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Graduate, Nail Art",
      content: "I loved the comprehensive curriculum and supportive learning environment. Now I run my own successful nail studio!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
      rating: 5
    }
  ];

  return (
    <div className="mb-16 bg-gradient-to-r from-[#FEF4F1] to-[#FBAA99]/20 rounded-3xl p-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#4D423A] mb-2">What Our Students Say</h2>
        <p className="text-[#4D423A]/70 text-lg">Hear from our successful graduates</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#FEF4F1] hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold text-[#4D423A]">{testimonial.name}</h4>
                <p className="text-[#4D423A]/70 text-sm">{testimonial.role}</p>
              </div>
            </div>
            
            <div className="flex mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#FBAA99] text-[#FBAA99]" />
              ))}
            </div>
            
            <p className="text-[#4D423A]/80 italic">"{testimonial.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Upcoming Events Section
const UpcomingEvents = () => {
  const events = [
    {
      title: "Open House & Course Preview",
      date: "15 Oct 2025",
      time: "10:00 AM - 2:00 PM",
      location: "Pink Aura Training Center",
      description: "Come visit our facility, meet instructors, and learn about our programs."
    },
    {
      title: "Free Makeup Workshop",
      date: "22 Oct 2025",
      time: "1:00 PM - 3:00 PM",
      location: "Pink Aura Training Center",
      description: "Learn basic makeup techniques from our expert instructors."
    },
    {
      title: "Career Day & Industry Panel",
      date: "5 Nov 2025",
      time: "11:00 AM - 4:00 PM",
      location: "Pink Aura Training Center",
      description: "Meet beauty industry professionals and learn about career opportunities."
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#4D423A] mb-2">Upcoming Events</h2>
        <p className="text-[#4D423A]/70 text-lg">Join our free workshops and events</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#FEF4F1] hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start mb-4">
              <div className="bg-[#FEF4F1] text-[#4D423A] p-3 rounded-xl mr-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#4D423A] text-lg">{event.title}</h3>
                <p className="text-[#4D423A]/70 text-sm">{event.date} • {event.time}</p>
              </div>
            </div>
            
            <div className="flex items-center text-[#4D423A]/70 mb-3">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.location}</span>
            </div>
            
            <p className="text-[#4D423A]/80 text-sm mb-4">{event.description}</p>
            
            <button className="w-full bg-[#FEF4F1] hover:bg-[#FBAA99] hover:text-white text-[#4D423A] py-2 rounded-xl font-medium transition-all duration-300 text-sm">
              Register Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserCourseHomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Courses");

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

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = !searchTerm || 
      course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Courses" ||
      course.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
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
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-[#4D423A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#FBAA99]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 course-home-page p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Stats Section */}
          <UserStatsSection />
          
          {/* Featured Courses */}
          <FeaturedCourses courses={courses} />
          
          {/* Search and Filter */}
          <SearchFilterSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Course Results Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#4D423A] mb-2">
                {searchTerm || selectedCategory !== "All Courses" 
                  ? `${filteredCourses.length} Course${filteredCourses.length !== 1 ? 's' : ''} Found`
                  : "Available Courses"}
              </h2>
              <p className="text-[#4D423A]/70 text-lg">
                {searchTerm || selectedCategory !== "All Courses"
                  ? "Matching your search criteria"
                  : "Choose from our comprehensive beauty training programs"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {courses.length} Total Courses Available
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {filteredCourses.map((course) => (
              <UserCourseCard key={course._id} course={course} setCourses={setCourses} />
            ))}
          </div>

          {/* No Courses Found */}
          {filteredCourses.length === 0 && !loading && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg">
              <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-[#FBAA99]" />
              </div>
              <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No courses found</h3>
              <p className="text-[#4D423A]/70 mb-6 max-w-md mx-auto">
                {searchTerm ? `No courses match "${searchTerm}"` : `No courses available in ${selectedCategory}`}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All Courses");
                }}
                className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                View All Courses
              </button>
            </div>
          )}

          {/* Testimonials Section */}
          <TestimonialsSection />
          
          {/* Upcoming Events */}
          <UpcomingEvents />

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
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Enhanced focus styles */
        input:focus,
        select:focus {
          box-shadow: 0 0 0 4px rgba(251, 170, 153, 0.2);
        }

        /* Smooth transitions */
        * {
          transition-property: color, background-color, border-color, opacity, box-shadow, transform, filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UserCourseHomePage;
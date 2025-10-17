import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; 
import EventNavbar from '../components/EventNavbar';
import EventCard from '../components/EventCard';
import EventsNotFound from "../components/EventNotFound";
import Footer from '../components/Footer';
import api from '../lib/axios';
import toast from "react-hot-toast";
import { useScrollAnimationMultiple } from '../hooks/useScrollAnimation';
import { 
  Search, 
  X, 
  Loader, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Plus,
  Filter,
  Eye,
  BarChart3,
  Clock,
  MapPin,
  Sparkles,
  Target,
  Zap,
  Globe,
  ArrowLeft 
} from "lucide-react";

const EventHomePage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const visibleElements = useScrollAnimationMultiple(0.1);

  // Enhanced slideshow images with admin context
  const slideImages = [
    {
      url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=400&fit=crop",
      title: "VIP Client Appreciation Night",
      description: "Exclusive evening events for our valued clients"
    },
    {
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
      title: "Professional Training Workshops",
      description: "Advanced techniques and skill development sessions"
    },
    {
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=400&fit=crop",
      title: "Product Launch Events",
      description: "Be the first to experience our latest beauty innovations"
    },
    {
      url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=400&fit=crop",
      title: "Seasonal Beauty Showcases",
      description: "Trending styles and seasonal makeover experiences"
    },
    {
      url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop",
      title: "Bridal Beauty Consultations",
      description: "Special seminars for your perfect wedding day look"
    },
    {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
      title: "Team Building & Celebrations",
      description: "Connect with our talented staff and beauty community"
    },
    {
      url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=400&fit=crop",
      title: "Charity & Community Outreach",
      description: "Giving back through beauty and wellness initiatives"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages.length]);

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

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideImages.length);

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        console.log(res.data);
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (error) {
        console.log("Error fetching events");
        console.log(error.response);
        toast.error("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get(`/events/search?q=${encodeURIComponent(searchQuery)}`);
      setFilteredEvents(res.data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setFilteredEvents(events);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredEvents(events);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Admin Stats Component
  const AdminEventStatsGrid = () => {
    const stats = [
      { icon: <Calendar className="w-8 h-8" />, label: "Total Events", value: events.length || "0", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <Users className="w-8 h-8" />, label: "Total Attendees", value: "2,847", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" },
      { icon: <Award className="w-8 h-8" />, label: "Completed Events", value: "156", color: "text-[#FBAA99]", bg: "bg-[#FEF4F1]" },
      { icon: <Clock className="w-8 h-8" />, label: "Upcoming Events", value: "12", color: "text-[#4D423A]", bg: "bg-[#FEF4F1]" }
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
          <p className="text-[#4D423A] font-medium">Loading events dashboard...</p>
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

      <div className="relative z-10 event-home-page p-6">
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
                to="/events/create"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Event</span>
              </Link>
            </div>
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-[#FBAA99]/20 mb-4">
              <Settings className="w-6 h-6 text-[#4D423A]" />
              <span className="text-[#4D423A] font-bold">Event Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Pink Aura Events Dashboard
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-3xl mx-auto leading-relaxed">
              "Discover your community of beauty enthusiasts through our inspiring events and celebrations."
            </p>
          </div>

          {/* Stats Grid */}
          <div data-scroll-animation>
            <AdminEventStatsGrid />
          </div>

          {/* Enhanced Search Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6 mb-8" data-scroll-animation>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {searching ? (
                    <Loader className="h-5 w-5 text-[#FBAA99] animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-[#4D423A]/60 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
                  )}
                </div>
                
                <input
                  type="text"
                  placeholder="Search events by title, content, venue, or date..."
                  className="w-full pl-12 pr-12 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-red-500 transition-colors text-[#4D423A]/60"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                {/* Add Event Button */}
                <Link 
                  to="/events/create"
                  className="px-6 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Event</span>
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
                      Found <span className="font-bold text-[#FBAA99]">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} 
                      {searchQuery && ` matching "${searchQuery}"`}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Slideshow Section */}
          <div className="mb-12" data-scroll-animation>
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border-4 border-[#FEF4F1]">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slideImages.map((slide, index) => (
                    <div key={index} className="min-w-full relative">
                      <div className="aspect-[16/6] bg-gradient-to-r from-[#FBAA99] to-[#4D423A] flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={slide.url} 
                          alt={slide.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FBAA99]/60 to-[#4D423A]/60"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative z-10 text-center text-white px-6">
                          <h3 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{slide.title}</h3>
                          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">{slide.description}</p>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-8 right-8 w-20 h-20 border-4 border-white/20 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white/20 rounded-full animate-pulse delay-500"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <button
                  onClick={goToPrevSlide}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                
                <button
                  onClick={goToNextSlide}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 border-2 border-white/30"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* Enhanced Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-4">
                  {slideImages.map((_, index) => (
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
                Event Management
              </h2>
              <p className="text-[#4D423A]/70">
                {searchQuery
                  ? `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`
                  : `Managing ${events.length} total events`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {events.length} Total Events
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8" data-scroll-animation>
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} setEvents={setEvents} />
            ))}
          </div>

          {/* No Events Found */}
          {filteredEvents.length === 0 && !loading && !searching && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg" data-scroll-animation>
              {searchQuery ? (
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-[#FBAA99]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No events found</h3>
                  <p className="text-[#4D423A]/70 mb-6">
                    No events match your search for "{searchQuery}"
                  </p>
                  <button 
                    onClick={clearSearch}
                    className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <EventsNotFound />
              )}
            </div>
          )}

          {/* Search Tips */}
          {searchQuery && filteredEvents.length === 0 && !searching && (
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
                    <li>• Check your spelling</li>
                    <li>• Use more general terms</li>
                    <li>• Try searching by date range</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#4D423A] flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-[#FBAA99]" />
                    Search By:
                  </h5>
                  <ul className="text-sm text-[#4D423A]/70 space-y-2 ml-6">
                    <li>• Event title and description</li>
                    <li>• Venue and location</li>
                    <li>• Event type or category</li>
                    <li>• Date or time period</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Custom Styles */}
      <style jsx>{`
        /* Enhanced focus styles */
        input:focus,
        select:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(251, 170, 153, 0.2);
        }

        /* Smooth transitions for all elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-duration: 200ms;
          transition-timing-function: ease-in-out;
        }

        /* Enhanced button hover effects */
        button:hover {
          filter: brightness(1.05);
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

export default EventHomePage;
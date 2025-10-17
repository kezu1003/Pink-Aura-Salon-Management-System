import { useEffect, useState } from "react";
import UserEventCard from '../components/UserEventCard';
import EventsNotFound from "../components/EventNotFound";
import api from '../lib/axios';
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LikedEventsProvider, useLikedEvents } from '../context/LikedEventsContext';
import LikedEventsIndicator from '../components/LikedEventsIndicator';
import { 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Users, 
  Calendar, 
  Search, 
  Heart, 
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Award
} from "lucide-react";

// Enhanced Floating WhatsApp Component
const FloatingWhatsApp = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = "94784596755";
    const message = "Hi! I'm interested in your salon events. Could you please provide more information about upcoming events and how to register?";
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
            <span>Chat about events!</span>
          </div>
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-[#4D423A]"></div>
        </div>
      )}

      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleWhatsAppClick}
        className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-white relative overflow-hidden group"
        title="Contact us on WhatsApp about events"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        <MessageCircle className="w-8 h-8 relative z-10" />
      </button>

      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20 pointer-events-none"></div>
    </div>
  );
};

// Stats Section for Users
const UserEventStatsSection = () => {
  const stats = [
    {
      icon: <Calendar className="w-8 h-8" />,
      value: "50+",
      label: "Monthly Events",
      color: "text-[#FBAA99]",
      bg: "bg-[#FEF4F1]",
      description: "Exciting experiences"
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "2,000+",
      label: "Event Attendees",
      color: "text-[#4D423A]",
      bg: "bg-[#FEF4F1]",
      description: "Community members"
    },
    {
      icon: <Award className="w-8 h-8" />,
      value: "95%",
      label: "Satisfaction Rate",
      color: "text-[#FBAA99]",
      bg: "bg-[#FEF4F1]",
      description: "Happy participants"
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "4.9",
      label: "Event Rating",
      color: "text-[#4D423A]",
      bg: "bg-[#FEF4F1]",
      description: "Outstanding feedback"
    },
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#4D423A] mb-2">Why Join Pink Aura Events?</h3>
        <p className="text-[#4D423A]/70">Connect with beauty enthusiasts and learn from experts</p>
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

// Hero Section with Event Slideshow
const EventHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const eventSlides = [
    {
      title: "Join Our Beauty Community",
      subtitle: "Exclusive Beauty Events at Pink Aura",
      description: "Connect with fellow beauty enthusiasts and discover the latest trends, techniques, and products in our exciting events.",
      image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#FBAA99] to-[#4D423A]"
    },
    {
      title: "Learn from Expert Stylists",
      subtitle: "Professional Workshops & Masterclasses",
      description: "Attend hands-on workshops led by industry professionals and take your beauty skills to the next level.",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#4D423A] to-[#000000]"
    },
    {
      title: "Discover New Products",
      subtitle: "Product Launch Events & Demos",
      description: "Be the first to experience and try the latest beauty innovations at our exclusive product launch events.",
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#FBAA99] via-[#4D423A] to-[#000000]"
    },
    {
      title: "Seasonal Beauty Showcases",
      subtitle: "Trending Styles & Seasonal Looks",
      description: "Stay updated with seasonal trends and get inspired by our curated beauty showcases and style demonstrations.",
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=600&fit=crop&q=80",
      gradient: "from-[#000000] to-[#4D423A]"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % eventSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [eventSlides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + eventSlides.length) % eventSlides.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % eventSlides.length);

  return (
    <div className="mb-12">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border-4 border-[#FEF4F1]">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {eventSlides.map((slide, index) => (
            <div key={index} className="min-w-full relative">
              <div className="aspect-[16/6] relative overflow-hidden">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-85`}></div>
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="absolute inset-0 flex items-center justify-center z-10 text-center text-white px-8">
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
                        <Calendar className="w-5 h-5" />
                        <span>View Events</span>
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
          {eventSlides.map((_, index) => (
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
const EventSearchFilterSection = ({ searchTerm, setSearchTerm, showLikedOnly, setShowLikedOnly }) => {
  const { getLikedEventsCount } = useLikedEvents();

  return (
    <div className="mb-12">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#4D423A] mb-2">Find Your Perfect Event</h2>
          <p className="text-[#4D423A]/70">Discover events that match your beauty interests and schedule</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4D423A]/60 w-5 h-5 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search events by name, type, or description..."
              className="w-full pl-12 pr-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                showLikedOnly
                  ? 'bg-[#FBAA99] text-white shadow-lg'
                  : 'bg-[#FEF4F1] text-[#4D423A] hover:bg-[#FBAA99]/20 hover:text-[#FBAA99] border-2 border-[#FEF4F1] hover:border-[#FBAA99]/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${showLikedOnly ? 'fill-current' : ''}`} />
              <span>Liked Events</span>
              {getLikedEventsCount() > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {getLikedEventsCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserEventHomePageContent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const { likedEvents, isEventLiked, clearAllLikedEvents } = useLikedEvents();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        console.log(res.data);
        setEvents(res.data);
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

  // Filter events based on search and liked filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch = !searchTerm || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLikedFilter = !showLikedOnly || isEventLiked(event._id);
    
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
          <p className="text-[#4D423A] font-medium text-lg">Loading events...</p>
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

      <div className="relative z-10 event-home-page p-6 pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <EventHeroSection />
          
          {/* Stats Section */}
          <UserEventStatsSection />
          
          {/* Search and Filter */}
          <EventSearchFilterSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showLikedOnly={showLikedOnly}
            setShowLikedOnly={setShowLikedOnly}
          />

          {/* Event Results Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#4D423A] mb-2">
                {showLikedOnly 
                  ? `Your Liked Events (${filteredEvents.length})`
                  : searchTerm 
                    ? `${filteredEvents.length} Event${filteredEvents.length !== 1 ? 's' : ''} Found`
                    : "Upcoming Events"}
              </h2>
              <p className="text-[#4D423A]/70">
                {showLikedOnly
                  ? "Events you've marked as favorites"
                  : searchTerm
                    ? "Matching your search criteria"
                    : "Join us for exciting beauty experiences and learning opportunities"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LikedEventsIndicator className="bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30" />
              {showLikedOnly && likedEvents.length > 0 && (
                <button
                  onClick={() => {
                    clearAllLikedEvents();
                    toast.success("All liked events cleared!");
                  }}
                  className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full border-2 border-red-200 hover:bg-red-100 transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
              <div className="text-sm font-medium text-[#4D423A] bg-[#FEF4F1] px-4 py-2 rounded-full border-2 border-[#FBAA99]/30">
                {events.length} Total Events Available
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {filteredEvents.map((event) => (
              <UserEventCard key={event._id} event={event} setEvents={setEvents} />
            ))}
          </div>

          {/* No Events Found */}
          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[#FEF4F1] shadow-lg">
              <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-[#FBAA99]" />
              </div>
              <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No events found</h3>
              <p className="text-[#4D423A]/70 mb-6 max-w-md mx-auto">
                {searchTerm ? `No events match "${searchTerm}"` : "No events available"}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                }}
                className="px-8 py-4 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                View All Events
              </button>
            </div>
          )}

          {events.length === 0 && !loading && <EventsNotFound />}
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

const UserEventHomePage = () => {
  return (
    <LikedEventsProvider>
      <UserEventHomePageContent />
    </LikedEventsProvider>
  );
};

export default UserEventHomePage;
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Loader, 
  Trash2, 
  Download, 
  Save, 
  Edit3, 
  Calendar, 
  FileText, 
  MapPin,
  Eye,
  Settings,
  Sparkles,
  Award,
  Star,
  Users,
  Clock
} from "lucide-react";

const EventDetailsPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.log("Error in fetching event", error);
        toast.error("Failed to fetch the event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Enhanced PDF report with Pink Aura branding
  const handleDownloadReport = async () => {
    if (!event) return;
    
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 25;
      let yPosition = margin;
      
      // Color palette (RGB values)
      const colors = {
        primary: [251, 170, 153], // #FBAA99
        secondary: [77, 66, 58], // #4D423A
        light: [254, 244, 241], // #FEF4F1
        dark: [0, 0, 0] // #000000
      };
      
      // Header Section with brand colors
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Salon name in header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('Pink Aura', margin, 20);
      
      // Tagline
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Beauty Academy & Events', margin, 28);
      
      // Decorative line
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(2);
      doc.line(margin, 40, pageWidth - margin, 40);
      
      yPosition = 55;
      
      // Main Title
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('Event Details Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Event Title
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(event.title || 'Event Title', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;
      
      // Content area with border
      doc.setDrawColor(...colors.light);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), pageHeight - yPosition - 45, 'S');
      
      // Event details with enhanced formatting
      const details = [
        ['Event Title', event.title],
        ['Event Content', event.content],
        ['Event Venue', event.venue],
        ['Event Date', event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''],
        ['Created At', event.createdAt ? new Date(event.createdAt).toLocaleDateString() : '']
      ];
      
      yPosition += 10;
      
      details.forEach(([label, value], index) => {
        if (value) {
          // Alternating background colors for better readability
          if (index % 2 === 0) {
            doc.setFillColor(...colors.light);
            doc.rect(margin + 2, yPosition - 8, pageWidth - (margin * 2) - 4, 16, 'F');
          }
          
          // Label with primary color
          doc.setTextColor(...colors.secondary);
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`${label}:`, margin + 8, yPosition);
          
          // Value with dark color
          doc.setTextColor(...colors.dark);
          doc.setFont(undefined, 'normal');
          const textLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 80);
          doc.text(textLines, margin + 80, yPosition);
          
          yPosition += Math.max(textLines.length * 5, 18);
          
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
          }
        }
      });
      
      // Statistics Section
      if (yPosition < pageHeight - 80) {
        yPosition += 15;
        
        // Section header
        doc.setFillColor(...colors.secondary);
        doc.rect(margin + 2, yPosition - 5, pageWidth - (margin * 2) - 4, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Event Statistics', margin + 8, yPosition + 8);
        
        yPosition += 25;
        
        const stats = [
          ['Expected Attendees', '45 participants'],
          ['Event Duration', '3 hours'],
          ['Event Rating', '4.9/5.0'],
          ['Event Status', 'Active']
        ];
        
        stats.forEach(([label, value], index) => {
          if (index % 2 === 0) {
            doc.setFillColor(...colors.light);
            doc.rect(margin + 2, yPosition - 8, pageWidth - (margin * 2) - 4, 16, 'F');
          }
          
          doc.setTextColor(...colors.secondary);
          doc.setFont(undefined, 'bold');
          doc.text(`${label}:`, margin + 8, yPosition);
          
          doc.setTextColor(...colors.dark);
          doc.setFont(undefined, 'normal');
          doc.text(value, margin + 80, yPosition);
          
          yPosition += 18;
        });
      }
      
      // Footer Section
      const footerY = pageHeight - 25;
      
      // Footer background
      doc.setFillColor(...colors.primary);
      doc.rect(0, footerY - 10, pageWidth, 20, 'F');
      
      // Footer content
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, footerY);
      
      doc.setFont(undefined, 'italic');
      doc.text('Pink Aura Beauty Academy - Event Management Excellence', pageWidth - margin, footerY, { align: 'right' });
      
      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(9);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }
      
      // Save the PDF
      const fileName = `Pink-Aura-Event-Report-${event.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("Professional report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!event) return;
    
    const csvContent = [
      ['Field', 'Value'],
      ['Event Title', event.title || ''],
      ['Event Content', event.content || ''],
      ['Event Venue', event.venue || ''],
      ['Event Date', event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''],
      ['Created At', event.createdAt ? new Date(event.createdAt).toLocaleDateString() : ''],
      ['Generated On', new Date().toLocaleString()]
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Pink-Aura-Event-Report-${event.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'event'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV report downloaded successfully");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      navigate("/events");
    } catch (error) {
      console.log("Error deleting the event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleSave = async () => {
    if (
      !event.title?.trim() ||
      !event.content?.trim() ||
      !event.venue?.trim()
    ) {
      toast.error("Please fill all details");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/events/${id}`, event);
      toast.success("Event updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.log("Error saving the event:", error);
      toast.error("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const formFields = [
    {
      label: 'Event Title',
      field: 'title',
      icon: <Calendar className="w-5 h-5" />,
      placeholder: 'Enter event title'
    },
    {
      label: 'Event Content',
      field: 'content',
      icon: <FileText className="w-5 h-5" />,
      placeholder: 'Enter event description',
      isTextarea: true
    },
    {
      label: 'Event Venue',
      field: 'venue',
      icon: <MapPin className="w-5 h-5" />,
      placeholder: 'Enter event venue'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FEF4F1] rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FBAA99] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#4D423A] font-medium">Loading event details...</p>
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Back Button and Title */}
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/events" 
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-[#FEF4F1] border-2 border-[#FBAA99]/20 hover:border-[#FBAA99] rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-[#4D423A] font-medium w-fit"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Events</span>
                </Link>
                
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4D423A]">
                      Event Details
                    </h1>
                    <p className="text-[#4D423A]/70 mt-1">View and edit event information</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Download Dropdown */}
                <div className="relative group">
                  <button className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>{downloading ? "Generating..." : "Download"}</span>
                  </button>
                  
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-[#FEF4F1] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <button 
                        onClick={handleDownloadReport}
                        disabled={downloading}
                        className="w-full px-4 py-3 text-left hover:bg-[#FEF4F1] rounded-lg transition-colors duration-200 flex items-center space-x-3 text-[#4D423A]"
                      >
                        <Download className="w-4 h-4" />
                        <span>PDF Report</span>
                      </button>
                      <button 
                        onClick={handleDownloadCSV}
                        disabled={downloading}
                        className="w-full px-4 py-3 text-left hover:bg-[#FEF4F1] rounded-lg transition-colors duration-200 flex items-center space-x-3 text-[#4D423A]"
                      >
                        <Download className="w-4 h-4" />
                        <span>CSV Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Toggle Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                    isEditing 
                      ? 'bg-[#FEF4F1] hover:bg-[#FBAA99]/20 text-[#4D423A] border-2 border-[#FBAA99]' 
                      : 'bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white'
                  }`}
                >
                  {isEditing ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                  <span>{isEditing ? "View Mode" : "Edit Mode"}</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Event Information Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-[#FEF4F1] overflow-hidden mb-8">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#FBAA99] to-[#4D423A] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{event?.title || "Event Title"}</h2>
                  <p className="text-white/90">Manage event information and settings</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.9</div>
                    <div className="text-sm text-white/80 flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-white/80">Attendees</div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 right-8 w-16 h-16 border-2 border-white/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/20 rounded-full"></div>
            </div>

            {/* Form Fields */}
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8">
                {formFields.map((field, index) => (
                  <div key={field.field}>
                    <label className="block text-[#4D423A] font-semibold mb-3 text-lg">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                          {field.icon}
                        </div>
                        <span>{field.label}</span>
                      </div>
                    </label>
                    
                    <div className="relative group">
                      {isEditing ? (
                        field.isTextarea ? (
                          <textarea
                            className="w-full px-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/30 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 resize-none min-h-32 focus:outline-none"
                            value={event?.[field.field] || ''}
                            onChange={(e) => setEvent({ ...event, [field.field]: e.target.value })}
                            placeholder={field.placeholder}
                            rows={4}
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full px-6 py-4 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-2xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/30 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60 focus:outline-none"
                            value={event?.[field.field] || ''}
                            onChange={(e) => setEvent({ ...event, [field.field]: e.target.value })}
                            placeholder={field.placeholder}
                          />
                        )
                      ) : (
                        <div className={`w-full px-6 py-4 border-2 border-[#FEF4F1] rounded-2xl text-lg bg-[#FEF4F1]/30 text-[#4D423A] ${field.isTextarea ? 'min-h-32' : 'h-14'} flex items-start`}>
                          <span className={field.isTextarea ? 'pt-0' : 'pt-1'}>
                            {event?.[field.field] || `No ${field.label.toLowerCase()} provided`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button - Only show in edit mode */}
              {isEditing && (
                <div className="flex justify-end pt-8 border-t-2 border-[#FEF4F1] mt-8">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-8 py-4 bg-gradient-to-r from-[#4D423A] to-[#000000] hover:from-[#000000] hover:to-[#4D423A] text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 min-w-48 ${
                      saving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#4D423A]">Event Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#4D423A]/70">Expected Attendees</span>
                  <span className="font-semibold text-[#4D423A]">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4D423A]/70">Duration</span>
                  <span className="font-semibold text-[#FBAA99]">3 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4D423A]/70">Average Rating</span>
                  <span className="font-semibold text-[#4D423A]">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#4D423A]">Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[#4D423A]">Active Event</span>
                </div>
                <div className="text-sm text-[#4D423A]/70">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#FEF4F1] rounded-lg text-[#FBAA99]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#4D423A]">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-left hover:bg-[#FEF4F1] rounded-lg transition-colors duration-200 text-[#4D423A] text-sm">
                  View Registrations
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-[#FEF4F1] rounded-lg transition-colors duration-200 text-[#4D423A] text-sm">
                  Send Notifications
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-[#FEF4F1] rounded-lg transition-colors duration-200 text-[#4D423A] text-sm">
                  Export Attendees
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
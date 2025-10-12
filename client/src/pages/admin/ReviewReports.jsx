import React, { useEffect, useState } from "react";
import axios from "../../api/axios"; 
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { 
  SearchIcon, 
  XIcon, 
  LoaderIcon, 
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Download,
  Filter,
  Calendar,
  FileText,
  Settings,
  MessageSquare,
  ThumbsUp
} from "lucide-react";

const AdminReviewReports = () => {
  const [reportType, setReportType] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [monthlyFilter, setMonthlyFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("format", "json");
      if (monthlyFilter) params.set("monthly", monthlyFilter);
      if (searchQuery) params.set("q", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);
      if (staffFilter) params.set("staffId", staffFilter);

      const url = `/api/reviews/report?${params.toString()}`;
      
      const res = await axios.get(url, { responseType: "json" });
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === "summary") {
      fetchReport();
    } else {
      setData(null);
    }
  }, [reportType]);

  const onDownloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("format", "csv");
      if (monthlyFilter) params.set("monthly", monthlyFilter);
      if (searchQuery) params.set("q", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);
      if (staffFilter) params.set("staffId", staffFilter);

      const url = `/api/reviews/report?${params.toString()}`;
      const res = await axios.get(url, { responseType: "blob" });
      
      const blob = res.data;
      const fileName = `review-report-${reportType}.csv`;
      saveAs(blob, fileName);
      toast.success("CSV report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download CSV report");
    }
  };

  const handleGeneratePDF = async () => {
    if (!data) {
      toast.error("No data available to generate PDF report");
      return;
    }
    
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up colors (same as enrollment report)
      const headerColor = [251, 170, 153]; // #FBAA99 - Pink
      const darkColor = [77, 66, 58]; // #4D423A - Dark brown
      const lightPink = [254, 244, 241]; // #FEF4F1 - Light pink
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Header Section
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add main title in center
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Pink Aura', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Pink Aura - Review Report', pageWidth / 2, 25, { align: 'center' });
      
      // Decorative circle on the right
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.circle(pageWidth - 20, 20, 8, 'F');
      
      // Separator line
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 40, pageWidth, 3, 'F');
      
      // Main content
      let yPosition = 60;
      
      // Report title
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Review Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Report type subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Generate content based on report type
      if (reportType === "summary" && data.report) {
        const report = data.report;
        
        // Summary statistics
        const summaryData = [
          { label: 'Total Reviews:', value: report.totalReviews.toString() },
          { label: 'Average Rating:', value: report.averageRating.toFixed(1) },
          { label: '5-Star Reviews:', value: report.fiveStarCount.toString() },
          { label: '1-Star Reviews:', value: report.oneStarCount.toString() }
        ];
        
        // Add summary data with alternating colors
        summaryData.forEach((item, index) => {
          const isEven = index % 2 === 0;
          const bgColor = isEven ? lightPink : [255, 255, 255];
          
          // Background
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
          
          // Text
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(item.label, margin + 5, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(item.value, margin + 80, yPosition);
          
          yPosition += 15;
        });
        
        yPosition += 20;
        
        // Category breakdown
        if (report.byCategory && report.byCategory.length > 0) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Category Breakdown', margin, yPosition);
          yPosition += 15;
          
          report.byCategory.forEach((category, index) => {
            const isEven = index % 2 === 0;
            const bgColor = isEven ? lightPink : [255, 255, 255];
            
            // Background
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
            
            // Text
            doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(category.category || 'Unknown', margin + 5, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(`${category.count} reviews (Avg: ${category.averageRating.toFixed(1)})`, pageWidth - margin - 50, yPosition);
            
            yPosition += 15;
          });
        }
        
        yPosition += 20;
        
        // Top Rated Staff Section
        if (report.topStaff && report.topStaff.length > 0) {
          // Check if we have enough space for the top rated staff section
          const requiredSpace = 30 + (6 * 25) + 20; // Title + 6 staff + spacing
          if (yPosition + requiredSpace > pageHeight - 100) {
            doc.addPage();
            
            // Add header to new page
            doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Pink Aura', pageWidth / 2, 15, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Pink Aura - Review Report', pageWidth / 2, 25, { align: 'center' });
            
            doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
            doc.rect(0, 40, pageWidth, 3, 'F');
            
            yPosition = 60;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top Rated Staff', margin, yPosition);
          yPosition += 20;
          
          // Top 6 staff in a simple list format
          const topStaff = report.topStaff.slice(0, 6);
          
          topStaff.forEach((staff, index) => {
            const isEven = index % 2 === 0;
            const bgColor = isEven ? lightPink : [255, 255, 255];
            
            // Background
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20, 'F');
            
            // Border
            doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20, 'S');
            
            // Rank number
            doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
            doc.circle(margin + 15, yPosition + 2, 6, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}`, margin + 12, yPosition + 5);
            
            // Staff name
            doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(staff.staffName || 'Unknown', margin + 30, yPosition + 2);
            
            // Staff stats
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Reviews: ${staff.reviewCount}`, margin + 30, yPosition + 8);
            doc.text(`Avg Rating: ${staff.averageRating.toFixed(1)}`, margin + 30, yPosition + 14);
            
            // Rating stars on the right
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`★ ${staff.averageRating.toFixed(1)}`, pageWidth - margin - 30, yPosition + 6);
            
            yPosition += 25;
          });
          
          yPosition += 10;
        }
      } else if (data.reviews && data.reviews.length > 0) {
        // Review list
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Reviews (${data.total || data.reviews.length})`, margin, yPosition);
        yPosition += 20;
        
        // Table headers
        doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
        doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('User', margin + 5, yPosition);
        doc.text('Staff', margin + 50, yPosition);
        doc.text('Category', margin + 100, yPosition);
        doc.text('Rating', margin + 150, yPosition);
        doc.text('Comment', margin + 180, yPosition);
        
        yPosition += 15;
        
        // Review rows
        data.reviews.slice(0, 20).forEach((review, index) => {
          const isEven = index % 2 === 0;
          const bgColor = isEven ? [255, 255, 255] : lightPink;
          
          // Background
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
          
          // Text
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(review.userName || 'N/A', margin + 5, yPosition);
          doc.text(review.staffName || 'N/A', margin + 50, yPosition);
          doc.text(review.category || 'N/A', margin + 100, yPosition);
          doc.text(`${review.rating}★`, margin + 150, yPosition);
          doc.text((review.comment || '').substring(0, 30) + (review.comment && review.comment.length > 30 ? '...' : ''), margin + 180, yPosition);
          
          yPosition += 12;
        });
        
        if (data.reviews.length > 20) {
          yPosition += 10;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(`... and ${data.reviews.length - 20} more reviews`, margin, yPosition);
        }
      }
      
      // Footer
      const footerY = pageHeight - 30;
      
      // Footer background (pink bar)
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, footerY, pageWidth, 20, 'F');
      
      // Footer text in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`, margin, footerY + 8);
      doc.setFont('helvetica', 'italic');
      doc.text('Pink Aura Beauty Academy - Professional Training Excellence', pageWidth - margin, footerY + 8, { align: 'right' });
      
      // White strip for page number
      doc.setFillColor(255, 255, 255);
      doc.rect(0, footerY + 20, pageWidth, 10, 'F');
      
      // Page number in dark text
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Save the PDF
      doc.save(`Pink-Aura-Review-Report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Review report generated successfully!");
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error("Failed to generate PDF report: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  // Review Stats Component
  const ReviewStatsGrid = () => {
    const stats = [
      { 
        icon: <MessageSquare className="w-8 h-8" />, 
        label: "Total Reviews", 
        value: data?.report?.totalReviews || data?.total || "0", 
        color: "text-[#FBAA99]", 
        bg: "bg-[#FEF4F1]" 
      },
      { 
        icon: <Star className="w-8 h-8" />, 
        label: "Average Rating", 
        value: data?.report?.averageRating ? data.report.averageRating.toFixed(1) : "0.0", 
        color: "text-[#4D423A]", 
        bg: "bg-[#FEF4F1]" 
      },
      { 
        icon: <ThumbsUp className="w-8 h-8" />, 
        label: "5-Star Reviews", 
        value: data?.report?.fiveStarCount || "0", 
        color: "text-[#FBAA99]", 
        bg: "bg-[#FEF4F1]" 
      },
      { 
        icon: <TrendingUp className="w-8 h-8" />, 
        label: "Satisfaction Rate", 
        value: data?.report?.satisfactionRate ? `${data.report.satisfactionRate.toFixed(1)}%` : "0%", 
        color: "text-[#4D423A]", 
        bg: "bg-[#FEF4F1]" 
      }
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
          <p className="text-[#4D423A] font-medium">Loading review reports...</p>
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
              <Star className="w-6 h-6 text-[#4D423A]" />
              <span className="text-[#4D423A] font-bold">Review Reports</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4D423A] via-[#FBAA99] to-[#4D423A] bg-clip-text text-transparent">
                Review Analytics
              </span>
            </h1>
            <p className="text-xl text-[#4D423A]/80 max-w-2xl mx-auto leading-relaxed">
              Comprehensive review reports and customer satisfaction analytics
            </p>
          </div>

          {/* Stats Grid */}
          {data && <ReviewStatsGrid />}

          {/* Advanced Search and Filter Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Report Type Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4D423A] mb-2">Report Type</label>
                  <select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A]"
                  >
                    <option value="summary">Summary</option>
                    <option value="detailed">Detailed Reviews</option>
                    <option value="staff">Staff Performance</option>
                    <option value="category">Category Analysis</option>
                  </select>
                </div>

                {/* Monthly Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[#4D423A] mb-2">Monthly Filter</label>
                  <select 
                    value={monthlyFilter} 
                    onChange={(e) => setMonthlyFilter(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A]"
                  >
                    <option value="">All Time</option>
                    <option value="2025-01">January 2025</option>
                    <option value="2025-02">February 2025</option>
                    <option value="2025-03">March 2025</option>
                    <option value="2025-04">April 2025</option>
                    <option value="2025-05">May 2025</option>
                    <option value="2025-06">June 2025</option>
                    <option value="2025-07">July 2025</option>
                    <option value="2025-08">August 2025</option>
                    <option value="2025-09">September 2025</option>
                    <option value="2025-10">October 2025</option>
                    <option value="2025-11">November 2025</option>
                    <option value="2025-12">December 2025</option>
                  </select>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {searching ? (
                      <LoaderIcon className="h-5 w-5 text-[#FBAA99] animate-spin" />
                    ) : (
                      <SearchIcon className="h-5 w-5 text-[#4D423A]/60 group-focus-within:text-[#FBAA99] transition-colors duration-200" />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    className="w-full pl-12 pr-12 py-3 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 hover:shadow-md bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A] placeholder-[#4D423A]/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-red-500 transition-colors text-[#4D423A]/60"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4D423A] mb-2">Category</label>
                    <select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A]"
                    >
                      <option value="">All Categories</option>
                      <option value="Hair">Hair</option>
                      <option value="Skin">Skin</option>
                      <option value="Makeup">Makeup</option>
                      <option value="Nails">Nails</option>
                      <option value="Spa">Spa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4D423A] mb-2">Staff</label>
                    <select 
                      value={staffFilter} 
                      onChange={(e) => setStaffFilter(e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] focus:border-[#FBAA99] rounded-xl text-lg transition-all duration-300 bg-[#FEF4F1]/50 backdrop-blur-sm focus:bg-white text-[#4D423A]"
                    >
                      <option value="">All Staff</option>
                      {/* Staff options would be populated from API */}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={fetchReport} 
                className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Generate Report</span>
              </button>

              <button 
                onClick={onDownloadCSV} 
                className="px-6 py-3 bg-gradient-to-r from-[#4D423A] to-[#FBAA99] hover:from-[#FBAA99] hover:to-[#4D423A] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5" />
                <span>Download CSV</span>
              </button>

              <button 
                onClick={handleGeneratePDF} 
                disabled={downloading || !data}
                className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {downloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Results */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-[#FEF4F1] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#4D423A] font-medium">Loading report...</p>
              </div>
            )}

            {!loading && data && reportType === "summary" && (
              <div>
                <h3 className="text-2xl font-bold text-[#4D423A] mb-6">Summary Report ({data.report.totalReviews} reviews)</h3>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-lg font-semibold text-[#4D423A] mb-4">By Category</h4>
                    <div className="space-y-2">
                      {data.report.byCategory.map((category, index) => (
                        <div key={category.category} className={`p-4 rounded-xl ${index % 2 === 0 ? 'bg-[#FEF4F1]' : 'bg-white'} border border-[#FBAA99]/20`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#4D423A]">{category.category}</span>
                            <span className="text-[#FBAA99] font-bold">{category.count} reviews</span>
                          </div>
                          <div className="text-sm text-[#4D423A]/70 mt-1">
                            Average Rating: {category.averageRating.toFixed(1)}★
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[#4D423A] mb-4">Top Staff</h4>
                    <div className="space-y-2">
                      {data.report.topStaff.map((staff, index) => (
                        <div key={staff.staffId} className={`p-4 rounded-xl ${index % 2 === 0 ? 'bg-[#FEF4F1]' : 'bg-white'} border border-[#FBAA99]/20`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#4D423A]">{staff.staffName}</span>
                            <span className="text-[#FBAA99] font-bold">{staff.reviewCount} reviews</span>
                          </div>
                          <div className="text-sm text-[#4D423A]/70 mt-1">
                            Average Rating: {staff.averageRating.toFixed(1)}★
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Rated Staff Section */}
                <div className="mt-8">
                  <h4 className="text-2xl font-bold text-[#4D423A] mb-6 text-center">🏆 Top Rated Staff</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.report.topStaff.slice(0, 6).map((staff, index) => (
                      <div key={staff.staffId} className={`p-6 rounded-2xl ${index % 2 === 0 ? 'bg-gradient-to-br from-[#FEF4F1] to-white' : 'bg-gradient-to-br from-white to-[#FEF4F1]'} border-2 border-[#FBAA99]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-xl">#{index + 1}</span>
                          </div>
                          <h5 className="text-xl font-bold text-[#4D423A] mb-2">{staff.staffName}</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#4D423A]/70">Reviews:</span>
                              <span className="font-semibold text-[#FBAA99]">{staff.reviewCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#4D423A]/70">Rating:</span>
                              <span className="font-bold text-[#FBAA99]">{staff.averageRating.toFixed(1)}★</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && data && reportType !== "summary" && data.reviews && (
              <div>
                <h3 className="text-2xl font-bold text-[#4D423A] mb-6">
                  {reportType === "detailed" && `Detailed Reviews (${data.total} reviews)`}
                  {reportType === "staff" && `Staff Performance (${data.total} reviews)`}
                  {reportType === "category" && `Category Analysis (${data.total} reviews)`}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FEF4F1] text-[#4D423A]">
                        <th className="px-4 py-3 text-left font-semibold">User</th>
                        <th className="px-4 py-3 text-left font-semibold">Staff</th>
                        <th className="px-4 py-3 text-left font-semibold">Category</th>
                        <th className="px-4 py-3 text-left font-semibold">Rating</th>
                        <th className="px-4 py-3 text-left font-semibold">Comment</th>
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reviews.map((review, index) => (
                        <tr key={review.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#FEF4F1]/50'} hover:bg-[#FBAA99]/10 transition-colors duration-200`}>
                          <td className="px-4 py-3 font-medium text-[#4D423A]">{review.userName}</td>
                          <td className="px-4 py-3 text-[#4D423A]/70">{review.staffName}</td>
                          <td className="px-4 py-3 text-[#4D423A]/70">{review.category}</td>
                          <td className="px-4 py-3 text-[#FBAA99] font-semibold">{review.rating}★</td>
                          <td className="px-4 py-3 text-[#4D423A]/70 max-w-xs truncate">{review.comment || '-'}</td>
                          <td className="px-4 py-3 text-[#4D423A]/70">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && !data && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-12 w-12 text-[#FBAA99]" />
                </div>
                <h3 className="text-2xl font-bold text-[#4D423A] mb-4">No report loaded</h3>
                <p className="text-[#4D423A]/70 mb-6">
                  Select a report type and click "Generate Report" to view data
                </p>
              </div>
            )}
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
        input:focus, select:focus {
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

export default AdminReviewReports;

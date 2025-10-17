import { useEffect, useState } from "react";
import { Link } from 'react-router';
import { toast } from "react-toastify";
import PieChart from '../components/PieChart';
import { 
  ArrowLeft,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Target,
  Award,
  UserCheck,
  Globe,
  Zap
} from "lucide-react";

const EnrollmentReportsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch enrollments from localStorage
  useEffect(() => {
    const fetchEnrollments = () => {
      try {
        const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        console.log('Stored enrollments for reports:', storedEnrollments);
        setEnrollments(storedEnrollments);
      } catch (error) {
        console.log("Error fetching enrollments from localStorage");
        console.log(error);
        toast.error("Failed to fetch enrollments");
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Calculate enrollment statistics
  const calculateStats = () => {
    const totalEnrollments = enrollments.length;
    const courseStats = {};
    const userStats = {};
    
    enrollments.forEach(enrollment => {
      // Course statistics
      const courseName = enrollment.courseName || 'Unknown Course';
      courseStats[courseName] = (courseStats[courseName] || 0) + 1;
      
      // User statistics
      const userName = enrollment.userName || 'Unknown User';
      userStats[userName] = (userStats[userName] || 0) + 1;
    });

    return {
      totalEnrollments,
      courseStats,
      userStats,
      uniqueCourses: Object.keys(courseStats).length,
      uniqueUsers: Object.keys(userStats).length
    };
  };

  const stats = calculateStats();

  // Prepare data for pie chart
  const pieChartData = Object.entries(stats.courseStats).map(([courseName, count]) => ({
    label: courseName,
    value: count
  }));

  // Generate PDF report with pie chart
  const generatePDFReport = async () => {
    setDownloading(true);
    try {
      // Dynamic import for jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Page setup
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Enrollment Reports', margin, yPosition);
      yPosition += 20;

      // Date
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 30;

      // Summary Statistics
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Summary Statistics', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Enrollments: ${stats.totalEnrollments}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Unique Courses: ${stats.uniqueCourses}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Unique Users: ${stats.uniqueUsers}`, margin, yPosition);
      yPosition += 30;

      // Pie Chart Section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Enrollment Distribution by Course', margin, yPosition);
      yPosition += 20;

      // Prepare data for pie chart
      const courseEntries = Object.entries(stats.courseStats);
      const totalEnrollmentsForChart = courseEntries.reduce((sum, [, count]) => sum + count, 0);

      // Define colors for pie chart segments
      const pieColors = [
        '#FBAA99', '#4D423A', '#000000', '#FEF4F1',
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
      ];

      // Pie chart dimensions
      const chartCenterX = pageWidth / 2;
      const chartCenterY = yPosition + 60;
      const chartRadius = 50;

      // Draw pie chart using simple approach
      if (courseEntries.length > 0) {
        // Draw the main pie chart circle outline
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.circle(chartCenterX, chartCenterY, chartRadius, 'S');

        // Draw pie segments as individual circles positioned around the center
        courseEntries.forEach(([courseName, count], index) => {
          const percentage = (count / totalEnrollmentsForChart) * 100;
          const angle = (count / totalEnrollmentsForChart) * 360;
          const startAngle = courseEntries.slice(0, index).reduce((sum, [, c]) => sum + (c / totalEnrollmentsForChart) * 360, 0);
          const midAngle = startAngle + angle / 2;

          // Color for this segment
          const colorIndex = index % pieColors.length;
          const color = pieColors[colorIndex];

          // Convert hex color to RGB
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);

          // Draw segment as a small circle
          const segmentX = chartCenterX + Math.cos(midAngle * Math.PI / 180) * (chartRadius * 0.6);
          const segmentY = chartCenterY + Math.sin(midAngle * Math.PI / 180) * (chartRadius * 0.6);
          const segmentSize = Math.max(8, chartRadius * (percentage / 100) * 0.4);

          doc.setFillColor(r, g, b);
          doc.circle(segmentX, segmentY, segmentSize, 'F');
        });

        // Add legend below the pie chart
        yPosition = chartCenterY + chartRadius + 30;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        courseEntries.forEach(([courseName, count], index) => {
          const colorIndex = index % pieColors.length;
          const color = pieColors[colorIndex];
          const percentage = (count / totalEnrollmentsForChart) * 100;

          // Draw color box
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          doc.setFillColor(r, g, b);
          doc.rect(margin, yPosition - 3, 8, 8, 'F');

          // Add text
          doc.setFillColor(0, 0, 0);
          doc.text(`${courseName}: ${count} (${percentage.toFixed(1)}%)`, margin + 12, yPosition);
          yPosition += 12;
        });
      }

      // Add detailed breakdown
      yPosition += 30;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Detailed Breakdown', margin, yPosition);
      yPosition += 20;

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      courseEntries.forEach(([courseName, count]) => {
        doc.text(`${courseName}: ${count} enrollments`, margin, yPosition);
        yPosition += 10;
      });

      // Save the PDF
      doc.save(`enrollment-reports-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF report generated successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF4F1] to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#FEF4F1] rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#FBAA99] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#4D423A] font-medium text-lg">Loading enrollment reports...</p>
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

      <div className="relative z-10 p-6 pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to="/enrollments"
                className="flex items-center space-x-2 text-[#4D423A] hover:text-[#FBAA99] transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Enrollments</span>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-[#4D423A] mb-2">Enrollment Reports</h1>
            <p className="text-[#4D423A]/70">Comprehensive analytics and insights for enrollment data</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4D423A]">{stats.totalEnrollments}</div>
                  <div className="text-sm text-[#4D423A]/60">Total Enrollments</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4D423A] to-[#000000] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4D423A]">{stats.uniqueCourses}</div>
                  <div className="text-sm text-[#4D423A]/60">Unique Courses</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FBAA99] to-[#4D423A] rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4D423A]">{stats.uniqueUsers}</div>
                  <div className="text-sm text-[#4D423A]/60">Unique Users</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4D423A] to-[#000000] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4D423A]">
                    {stats.uniqueCourses > 0 ? (stats.totalEnrollments / stats.uniqueCourses).toFixed(1) : '0'}
                  </div>
                  <div className="text-sm text-[#4D423A]/60">Avg per Course</div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#FEF4F1] p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#4D423A] mb-2">Course Distribution</h2>
                <p className="text-[#4D423A]/70">Enrollment breakdown by course</p>
              </div>
              <button
                onClick={generatePDFReport}
                disabled={downloading}
                className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] hover:from-[#4D423A] hover:to-[#000000] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </>
                )}
              </button>
            </div>

            {Object.keys(stats.courseStats).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-[#4D423A] mb-4 flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>Enrollment Distribution</span>
                  </h3>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-[#FEF4F1]">
                    <PieChart data={pieChartData} width={300} height={300} />
                  </div>
                </div>

                {/* Course List */}
                <div>
                  <h3 className="text-lg font-semibold text-[#4D423A] mb-4">Enrollment by Course</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.courseStats).map(([courseName, count], index) => {
                      const percentage = (count / stats.totalEnrollments) * 100;
                      const colors = ['#FBAA99', '#4D423A', '#000000', '#FEF4F1', '#FF6B6B', '#4ECDC4'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={courseName} className="flex items-center justify-between p-4 bg-[#FEF4F1] rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="font-medium text-[#4D423A]">{courseName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#4D423A]">{count}</div>
                            <div className="text-sm text-[#4D423A]/60">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-[#FEF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-12 w-12 text-[#FBAA99]" />
                </div>
                <h3 className="text-xl font-bold text-[#4D423A] mb-2">No Enrollment Data</h3>
                <p className="text-[#4D423A]/70 mb-6">No enrollments found to generate reports</p>
                <Link
                  to="/enrollments"
                  className="px-6 py-3 bg-gradient-to-r from-[#FBAA99] to-[#4D423A] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  View Enrollments
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentReportsPage;

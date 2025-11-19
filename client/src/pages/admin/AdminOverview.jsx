import React, { useState, useEffect, useContext } from 'react';
import { Chart as ChartJS, LineElement, BarElement, PieController, ArcElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks, format } from 'date-fns';
import { saveAs } from 'file-saver';
import 'react-datepicker/dist/react-datepicker.css';


const CalendarIcon = () => <span>📅</span>;
const RevenueIcon = () => <span>💰</span>;
const UsersIcon = () => <span>👥</span>;
const StaffIcon = () => <span>⚡</span>;
const AlertIcon = () => <span>⚠️</span>;
const StarIcon = () => <span>⭐</span>;
const DownloadIcon = () => <span>📥</span>;

ChartJS.register(LineElement, BarElement, PieController, ArcElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function AdminOverview() {
  const { backendUrl } = useContext(AppContext);
  const [data, setData] = useState({
    appointmentsToday: 0,
    revenueThisMonth: 0,
    activeClients: 0,
    staffUtilization: 0,
    inventoryAlerts: 0,
    customerSatisfaction: 0,
    revenueTrend: { labels: [], data: [] },
    appointmentDistribution: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [0, 0, 0, 0, 0, 0, 0] },
    topServices: { labels: [], data: [] },
    recentActivities: [],
    staffOverview: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    rangeType: 'This Month',
  });
  const [loading, setLoading] = useState(false);

  const predefinedRanges = [
    { label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { label: 'Last Month', start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'This Week', start: startOfWeek(new Date()), end: endOfWeek(new Date()) },
    { label: 'Last Week', start: startOfWeek(subWeeks(new Date(), 1)), end: endOfWeek(subWeeks(new Date(), 1)) },
    { label: 'Custom', start: null, end: null },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        };

        const [
          appointmentsRes,
          revenueRes,
          clientsRes,
          utilizationRes,
          inventoryRes,
          satisfactionRes,
          revenueTrendRes,
          distributionRes,
          servicesRes,
          activitiesRes,
          staffRes,
        ] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/dashboard/appointments-today`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/revenue-monthly`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/active-clients`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/staff-utilization`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/inventory-alerts`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/customer-satisfaction`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/revenue-trend`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/appointment-distribution`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/top-services`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/recent-activities`, { params }),
          axios.get(`${backendUrl}/api/admin/dashboard/staff-overview`, { params }),
        ]);

        setData({
          appointmentsToday: appointmentsRes.data.count || 0,
          revenueThisMonth: revenueRes.data.total || 0,
          activeClients: clientsRes.data.count || 0,
          staffUtilization: utilizationRes.data.utilization || 0,
          inventoryAlerts: inventoryRes.data.count || 0,
          customerSatisfaction: satisfactionRes.data.average || 0,
          revenueTrend: {
            labels: revenueTrendRes.data.weeks || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: revenueTrendRes.data.values || [0, 0, 0, 0],
          },
          appointmentDistribution: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: distributionRes.data.values || [0, 0, 0, 0, 0, 0, 0],
          },
          topServices: {
            labels: servicesRes.data.services.map(s => s.name) || [],
            data: servicesRes.data.services.map(s => s.count) || [],
          },
          recentActivities: activitiesRes.data.activities || [],
          staffOverview: staffRes.data.staff || [],
        });
      } catch (error) {
        toast.error('Failed to fetch dashboard data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [backendUrl, dateRange]);

  const handleRangeChange = (rangeLabel) => {
    const range = predefinedRanges.find(r => r.label === rangeLabel);
    if (rangeLabel === 'Custom') {
      setDateRange({ ...dateRange, rangeType: 'Custom' });
    } else {
      setDateRange({
        startDate: range.start,
        endDate: range.end,
        rangeType: range.label,
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/dashboard/report`, {
        params: {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
        },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `dashboard_report_${format(dateRange.startDate, 'yyyyMMdd')}.pdf`);
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message);
    }
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      }, 
      title: { 
        display: true, 
        text: 'Revenue Trend',
        font: {
          size: 16,
          weight: '600'
        },
        padding: { bottom: 20 }
      } 
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const revenueChartData = {
    labels: data.revenueTrend.labels,
    datasets: [{ 
      label: 'Revenue (LKR)', 
      data: data.revenueTrend.data, 
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 3,
      fill: true
    }],
  };

  const appointmentChartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      }, 
      title: { 
        display: true, 
        text: 'Appointments by Day',
        font: {
          size: 16,
          weight: '600'
        },
        padding: { bottom: 20 }
      } 
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const appointmentChartData = {
    labels: data.appointmentDistribution.labels,
    datasets: [{ 
      label: 'Appointments', 
      data: data.appointmentDistribution.data, 
      backgroundColor: [
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(14, 165, 233, 0.7)'
      ],
      borderColor: [
        '#8B5CF6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#3B82F6',
        '#EC4899',
        '#0EA5E9'
      ],
      borderWidth: 1,
      borderRadius: 6
    }],
  };

  const servicesChartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      }, 
      title: { 
        display: true, 
        text: 'Top Services',
        font: {
          size: 16,
          weight: '600'
        },
        padding: { bottom: 20 }
      } 
    },
  };

  const servicesChartData = {
    labels: data.topServices.labels,
    datasets: [{ 
      data: data.topServices.data, 
      backgroundColor: [
        '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', 
        '#EC4899', '#0EA5E9', '#84CC16', '#F97316', '#6EE7B7'
      ],
      borderWidth: 0
    }],
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'booking': return '📋';
      case 'payment': return '💳';
      case 'cancellation': return '❌';
      default: return '🔔';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'text-green-600 bg-green-50';
      case 'Busy': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Date Range Selector */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your business performance and key metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap gap-2">
              {predefinedRanges.map(range => (
                <button
                  key={range.label}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    dateRange.rangeType === range.label 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRangeChange(range.label)}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {dateRange.rangeType === 'Custom' && (
              <div className="flex gap-2 bg-white p-2 rounded-lg border border-gray-200">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={date => setDateRange({ ...dateRange, startDate: date })}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  className="p-2 border-0 text-sm w-32 focus:ring-0"
                  placeholderText="Start Date"
                />
                <span className="text-gray-400 self-center">→</span>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={date => setDateRange({ ...dateRange, endDate: date })}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  className="p-2 border-0 text-sm w-32 focus:ring-0"
                  placeholderText="End Date"
                />
              </div>
            )}
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-pink-200 text-pink-800 border border-pink-600 rounded-lg shadow-sm font-medium hover:bg-pink-300 transition-all"

              onClick={handleDownloadReport}
            >
              <DownloadIcon />
              Export Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.appointmentsToday}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <CalendarIcon />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">For selected range</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">LKR  {data.revenueThisMonth.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <RevenueIcon />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">For selected range</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.activeClients}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <UsersIcon />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">For selected range</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Staff Utilization</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.staffUtilization}%</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <StaffIcon />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Based on bookings</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.inventoryAlerts}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertIcon />
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-2 font-medium">Low stock or expiring items</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{data.customerSatisfaction}/5</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <StarIcon />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">Based on recent reviews</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Line options={revenueChartOptions} data={revenueChartData} />
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Bar options={appointmentChartOptions} data={appointmentChartData} />
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
                <div className="max-w-md mx-auto">
                  <Pie options={servicesChartOptions} data={servicesChartData} />
                </div>
              </div>
            </div>

            {/* Recent Activity and Staff Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-lg mt-1">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Overview</h2>
                <div className="space-y-3">
                  {data.staffOverview.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                          <p className="text-xs text-gray-600">{staff.appointmentsToday} appointments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <StarIcon />
                          <p className="text-sm font-medium text-gray-900">{staff.rating}/5</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                          {staff.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
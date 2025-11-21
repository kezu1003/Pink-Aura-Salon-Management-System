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

// Modern SVG Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

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
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: false
      }, 
      title: { 
        display: false
      } 
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  const revenueChartData = {
    labels: data.revenueTrend.labels,
    datasets: [{ 
      label: 'Revenue (LKR)', 
      data: data.revenueTrend.data, 
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.05)',
      borderWidth: 2,
      fill: true
    }],
  };

  const appointmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: false
      }, 
      title: { 
        display: false
      } 
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const appointmentChartData = {
    labels: data.appointmentDistribution.labels,
    datasets: [{ 
      label: 'Appointments', 
      data: data.appointmentDistribution.data, 
      backgroundColor: '#8B5CF6',
      borderColor: '#8B5CF6',
      borderWidth: 0,
      borderRadius: 4
    }],
  };

  const servicesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
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
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor your salon performance and key metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 border border-gray-200">
              {predefinedRanges.map(range => (
                <button
                  key={range.label}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateRange.rangeType === range.label 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
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
                  className="p-1 border-0 text-sm w-28 focus:ring-0 text-gray-600"
                  placeholderText="Start Date"
                />
                <span className="text-gray-400 self-center text-sm">→</span>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={date => setDateRange({ ...dateRange, endDate: date })}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  className="p-1 border-0 text-sm w-28 focus:ring-0 text-gray-600"
                  placeholderText="End Date"
                />
              </div>
            )}
            
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={handleDownloadReport}
            >
              <DownloadIcon />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid - Minimal Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Appointments</p>
                    <p className="text-2xl font-light text-gray-900">{data.appointmentsToday}</p>
                    <p className="text-xs text-gray-400 mt-1">Selected range</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Revenue</p>
                    <p className="text-2xl font-light text-gray-900">LKR {data.revenueThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Selected range</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <RevenueIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Clients</p>
                    <p className="text-2xl font-light text-gray-900">{data.activeClients}</p>
                    <p className="text-xs text-gray-400 mt-1">Selected range</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <UsersIcon />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Staff Utilization</p>
                    <p className="text-2xl font-light text-gray-900">{data.staffUtilization}%</p>
                    <p className="text-xs text-gray-400 mt-1">Based on bookings</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <StaffIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Inventory Alerts</p>
                    <p className="text-2xl font-light text-gray-900">{data.inventoryAlerts}</p>
                    <p className="text-xs text-gray-400 mt-1">Low stock items</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertIcon />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Satisfaction</p>
                    <p className="text-2xl font-light text-gray-900">{data.customerSatisfaction}/5</p>
                    <p className="text-xs text-gray-400 mt-1">Recent reviews</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <StarIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Revenue Trend</h3>
                  <span className="text-xs text-gray-500">LKR</span>
                </div>
                <div className="h-64">
                  <Line options={revenueChartOptions} data={revenueChartData} />
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Appointments by Day</h3>
                  <span className="text-xs text-gray-500">This week</span>
                </div>
                <div className="h-64">
                  <Bar options={appointmentChartOptions} data={appointmentChartData} />
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 lg:col-span-1">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Top Services</h3>
                <div className="h-64">
                  <Pie options={servicesChartOptions} data={servicesChartData} />
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {data.recentActivities.slice(0, 5).map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm mt-0.5">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Staff Overview</h3>
                    <div className="space-y-3">
                      {data.staffOverview.slice(0, 3).map(staff => (
                        <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                              <p className="text-xs text-gray-500">{staff.appointmentsToday} appts</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end text-xs">
                              <StarIcon />
                              <span className="text-gray-900">{staff.rating}/5</span>
                            </div>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(staff.status)}`}>
                              {staff.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
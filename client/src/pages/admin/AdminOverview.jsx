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

  const predefinedRanges = [
    { label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { label: 'Last Month', start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'This Week', start: startOfWeek(new Date()), end: endOfWeek(new Date()) },
    { label: 'Last Week', start: startOfWeek(subWeeks(new Date(), 1)), end: endOfWeek(subWeeks(new Date(), 1)) },
    { label: 'Custom', start: null, end: null },
  ];

  useEffect(() => {
    const fetchData = async () => {
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

  // Chart configurations
  const revenueChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Revenue Trend' } },
  };
  const revenueChartData = {
    labels: data.revenueTrend.labels,
    datasets: [{ label: 'Revenue ($)', data: data.revenueTrend.data, borderColor: '#FBAA99', backgroundColor: '#FBAA99' }],
  };

  const appointmentChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Appointments by Day' } },
  };
  const appointmentChartData = {
    labels: data.appointmentDistribution.labels,
    datasets: [{ label: 'Appointments', data: data.appointmentDistribution.data, backgroundColor: '#FEF4F1' }],
  };

  const servicesChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'right' }, title: { display: true, text: 'Top Services' } },
  };
  const servicesChartData = {
    labels: data.topServices.labels,
    datasets: [{ data: data.topServices.data, backgroundColor: ['#FBAA99', '#FFD1C7', '#FEF4F1', '#D9E8F5'] }],
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          {predefinedRanges.map(range => (
            <button
              key={range.label}
              className={`px-3 py-1 rounded-md text-sm ${dateRange.rangeType === range.label ? 'bg-[#FBAA99] text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => handleRangeChange(range.label)}
            >
              {range.label}
            </button>
          ))}
        </div>
        {dateRange.rangeType === 'Custom' && (
          <div className="flex gap-2">
            <DatePicker
              selected={dateRange.startDate}
              onChange={date => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="p-2 border rounded-md"
              placeholderText="Start Date"
            />
            <DatePicker
              selected={dateRange.endDate}
              onChange={date => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="p-2 border rounded-md"
              placeholderText="End Date"
            />
          </div>
        )}
        <button
          className="px-4 py-2 bg-[#4D423A] text-white rounded-md hover:bg-[#3B322D]"
          onClick={handleDownloadReport}
        >
          Download Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Appointments</h3>
          <p className="text-2xl font-bold text-[#4D423A]">{data.appointmentsToday}</p>
          <p className="text-xs text-green-600">For selected range</p>
        </div>
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-2xl font-bold text-[#4D423A]">${data.revenueThisMonth.toLocaleString()}</p>
          <p className="text-xs text-gray-600">For selected range</p>
        </div>
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Active Clients</h3>
          <p className="text-2xl font-bold text-[#4D423A]">{data.activeClients}</p>
          <p className="text-xs text-green-600">For selected range</p>
        </div>
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Staff Utilization</h3>
          <p className="text-2xl font-bold text-[#4D423A]">{data.staffUtilization}%</p>
          <p className="text-xs text-gray-600">Based on bookings</p>
        </div>
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Inventory Alerts</h3>
          <p className="text-2xl font-bold text-[#4D423A]">{data.inventoryAlerts}</p>
          <p className="text-xs text-red-600">Low stock or expiring items</p>
        </div>
        <div className="p-4 rounded-xl border bg-pink-50 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-600">Customer Satisfaction</h3>
          <p className="text-2xl font-bold text-[#4D423A]">{data.customerSatisfaction}/5</p>
          <p className="text-xs text-green-600">Based on recent reviews</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border bg-white shadow-sm">
          <Line options={revenueChartOptions} data={revenueChartData} />
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm">
          <Bar options={appointmentChartOptions} data={appointmentChartData} />
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm lg:col-span-2">
          <div className="max-w-md mx-auto">
            <Pie options={servicesChartOptions} data={servicesChartData} />
          </div>
        </div>
      </div>

      {/* Recent Activity and Staff Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-[#4D423A] mb-4">Recent Activity</h2>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {data.recentActivities.map(activity => (
              <li key={activity.id} className="flex items-center gap-3 text-sm text-gray-600">
                <span className={`w-2 h-2 rounded-full ${activity.type === 'booking' ? 'bg-green-500' : activity.type === 'payment' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <div>
                  <p>{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-[#4D423A] mb-4">Staff Overview</h2>
          <div className="space-y-3">
            {data.staffOverview.map(staff => (
              <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#4D423A]">{staff.name}</p>
                  <p className="text-xs text-gray-600">{staff.appointmentsToday} appointments</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#4D423A]">{staff.rating}/5</p>
                  <p className={`text-xs ${staff.status === 'Available' ? 'text-green-600' : staff.status === 'Busy' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {staff.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
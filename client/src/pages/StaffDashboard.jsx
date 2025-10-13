import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm hover:shadow transition bg-white ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function RatingStars({ rating, size = "sm" }) {
  const sizeClass = size === "lg" ? "text-2xl" : "text-sm";
  return (
    <div className={`flex items-center ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

function PerformanceChart({ data }) {
  const maxValue = Math.max(...Object.values(data));
  
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([rating, count]) => (
        <div key={rating} className="flex items-center">
          <span className="w-8 text-sm">{rating}★</span>
          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${maxValue > 0 ? (count / maxValue) * 100 : 0}%` }}
            />
          </div>
          <span className="w-8 text-sm text-gray-600">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function StaffDashboard() {
  const { userData, backendUrl } = useContext(AppContext);
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pos, setPOs] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = userData?.role || "";
  const jobTitle = userData?.jobTitle || "";
  const can = (perm) => (userData?.permissions || []).includes(perm);

  const WORK_START = "10:00";
  const WORK_END = "17:00";

  const loadData = async () => {
    try {
      setLoading(true);
      const calls = [];

      // Load performance data
      calls.push(
        axios
          .get(`${backendUrl}/api/staff/performance?period=30`, { withCredentials: true })
          .then((r) => setPerformance(r.data.performance))
      );

      if (can("view:own-schedule")) {
        calls.push(
          axios
            .get(`${backendUrl}/api/staff/schedule?range=today`, { withCredentials: true })
            .then((r) => setSchedule(r.data.items || []))
        );
      }

      if (can("read:announcements")) {
        calls.push(
          axios
            .get(`${backendUrl}/api/staff/announcements`, { withCredentials: true })
            .then((r) => setAnnouncements(r.data.items || []))
        );
      }

      if (can("supplier:view-pos")) {
        calls.push(
          axios
            .get(`${backendUrl}/api/staff/suppliers/pos`, { withCredentials: true })
            .then((r) => setPOs(r.data.items || []))
        );
      }

      await Promise.allSettled(calls);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;
    loadData();
  }, [backendUrl, userData]);

  const startAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/start`, {}, { withCredentials: true });
      toast.success("Appointment started");
      await loadData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to start");
    }
  };

  const completeAppt = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/staff/appointments/${id}/complete`, {}, { withCredentials: true });
      toast.success("Appointment completed");
      await loadData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to complete");
    }
  };

  const fulfillPO = async (id) => {
    try {
      await axios.post(
        `${backendUrl}/api/staff/suppliers/pos/${id}/fulfill`,
        { status: "delivered" },
        { withCredentials: true }
      );
      toast.success("PO marked delivered");
      const { data } = await axios.get(`${backendUrl}/api/staff/suppliers/pos`, { withCredentials: true });
      setPOs(data.items || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update PO");
    }
  };

  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userData?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {role} {jobTitle ? `• ${jobTitle}` : ""} • Working hours: {WORK_START} – {WORK_END}
        </p>
      </div>

      {/* Performance Overview */}
      {performance && (
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Average Rating" className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="text-center">
              <RatingStars rating={performance.averageRating} size="lg" />
              <p className="text-sm text-gray-600 mt-2">
                Based on {performance.totalReviews} reviews
              </p>
            </div>
          </Card>

          <Card title="Completion Rate" className="bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {performance.completionRate}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {performance.completedAppointments} of {performance.totalAppointments} appointments
              </p>
            </div>
          </Card>

          <Card title="This Month" className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {performance.totalAppointments}
              </div>
              <p className="text-sm text-gray-600 mt-2">Total appointments</p>
            </div>
          </Card>

          <Card title="Customer Feedback" className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {performance.totalReviews}
              </div>
              <p className="text-sm text-gray-600 mt-2">Reviews received</p>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule */}
          {can("view:own-schedule") && (
            <Card title="Today's Schedule">
              {schedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedule.map((appointment) => {
                    const id = appointment._id;
                    const start = appointment.startTime;
                    const end = appointment.endTime;
                    const services = appointment.services || [];
                    const serviceNames = services.length
                      ? services.map((s) => s.name || s).join(", ")
                      : "Service";
                    const status = appointment.status;
                    const customer = appointment.customer;

                    return (
                      <div key={id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{serviceNames}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                status === 'completed' ? 'bg-green-100 text-green-800' :
                                status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>🕐 {fmtTime(start)} – {fmtTime(end)}</p>
                              {customer && <p>👤 {customer.name}</p>}
                            </div>
                          </div>

                          {can("manage:appointments:assigned") && (
                            <div className="ml-4 space-x-2">
                              {status === "confirmed" && (
                                <button
                                  onClick={() => startAppt(id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Start
                                </button>
                              )}
                              {status === "in_progress" && (
                                <button
                                  onClick={() => completeAppt(id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Recent Reviews */}
          {performance?.recentReviews && performance.recentReviews.length > 0 && (
            <Card title="Recent Customer Reviews" className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="space-y-4">
                {performance.recentReviews.map((review, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {fmtDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm italic mb-2">"{review.comment}"</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        — {review.user?.name || 'Anonymous'}
                      </p>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {review.category || 'Service'}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    View All Reviews →
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Rating Distribution */}
          {performance?.ratingDistribution && (
            <Card title="Rating Distribution">
              <PerformanceChart data={performance.ratingDistribution} />
            </Card>
          )}

          {/* Staff Notices */}
          {can("read:announcements") && (
            <Card title="Staff Notices">
              {announcements.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">📢</div>
                  <p className="text-sm">No notices</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((notice) => {
                    const getPriorityColor = (priority) => {
                      switch (priority) {
                        case 'high': return 'bg-red-50 border-red-200 text-red-900';
                        case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
                        case 'low': return 'bg-green-50 border-green-200 text-green-900';
                        default: return 'bg-blue-50 border-blue-200 text-blue-900';
                      }
                    };

                    const getTypeIcon = (type) => {
                      switch (type) {
                        case 'meeting': return '👥';
                        case 'training': return '🎓';
                        case 'inventory': return '📦';
                        case 'feedback': return '⭐';
                        case 'schedule': return '📅';
                        default: return '📢';
                      }
                    };

                    const isExpiringSoon = notice.expiresAt && 
                      new Date(notice.expiresAt) - new Date() < 24 * 60 * 60 * 1000; // 24 hours

                    return (
                      <div 
                        key={notice._id} 
                        className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notice.priority)} ${
                          isExpiringSoon ? 'ring-2 ring-orange-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getTypeIcon(notice.type)}</span>
                            <h4 className="font-semibold">{notice.title}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {notice.priority}
                            </span>
                            {isExpiringSoon && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                Expires Soon
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-1 mb-2">{notice.body}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Posted: {fmtDate(notice.createdAt)}</span>
                          {notice.expiresAt && (
                            <span>Expires: {fmtDate(notice.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Services */}
          {can("read:services") && (
            <Card title="Service Catalog">
              <button
                onClick={async () => {
                  try {
                    const { data } = await axios.get(`${backendUrl}/api/staff/services`, {
                      withCredentials: true,
                    });
                    const n = data.items?.length || 0;
                    toast.info(`${n} services available`);
                  } catch (e) {
                    toast.error(e?.response?.data?.message || "Failed to load services");
                  }
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Services
              </button>
            </Card>
          )}

          {/* Inventory Requests */}
          {can("request:inventory") && (
            <Card title="Inventory Requests">
              <button
                onClick={async () => {
                  try {
                    await axios.post(
                      `${backendUrl}/api/staff/inventory/requests`,
                      { items: [{ name: "Gloves", qty: 2, unit: "packs" }] },
                      { withCredentials: true }
                    );
                    toast.success("Request sent");
                  } catch (e) {
                    toast.error(e?.response?.data?.message || "Failed to send request");
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Supplies
              </button>
            </Card>
          )}

          {/* Purchase Orders (Supplier) */}
          {can("supplier:view-pos") && (
            <Card title="Purchase Orders">
              {pos.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">📦</div>
                  <p className="text-sm">No POs assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pos.map((po) => (
                    <div key={po._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">PO #{po.code}</div>
                        <div className="text-sm text-gray-600">Status: {po.status}</div>
                      </div>
                      {can("supplier:update-fulfillment") && (
                        <button
                          onClick={() => fulfillPO(po._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

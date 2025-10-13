import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { Plus, Edit, Trash2, Calendar, AlertCircle } from "lucide-react";

export default function StaffNoticesAdmin() {
  const { backendUrl } = useContext(AppContext);
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "general",
    priority: "medium",
    expiresAt: ""
  });

  const noticeTypes = [
    { value: "general", label: "General", icon: "📢" },
    { value: "meeting", label: "Meeting", icon: "👥" },
    { value: "training", label: "Training", icon: "🎓" },
    { value: "inventory", label: "Inventory", icon: "📦" },
    { value: "feedback", label: "Feedback", icon: "⭐" },
    { value: "schedule", label: "Schedule", icon: "📅" },
    { value: "policy", label: "Policy", icon: "📋" },
    { value: "urgent", label: "Urgent", icon: "🚨" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "green" },
    { value: "medium", label: "Medium", color: "yellow" },
    { value: "high", label: "High", color: "red" }
  ];

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/staff-notices`, {
        withCredentials: true
      });
      if (data.success) {
        setNotices(data.items || []);
      }
    } catch (error) {
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };

      if (editingNotice) {
        await axios.put(`${backendUrl}/api/admin/staff-notices/${editingNotice._id}`, payload, {
          withCredentials: true
        });
        toast.success("Notice updated successfully");
      } else {
        await axios.post(`${backendUrl}/api/admin/staff-notices`, payload, {
          withCredentials: true
        });
        toast.success("Notice created successfully");
      }

      setShowForm(false);
      setEditingNotice(null);
      setFormData({ title: "", body: "", type: "general", priority: "medium", expiresAt: "" });
      loadNotices();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save notice");
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      body: notice.body,
      type: notice.type,
      priority: notice.priority,
      expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : ""
    });
    setShowForm(true);
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      await axios.delete(`${backendUrl}/api/admin/staff-notices/${noticeId}`, {
        withCredentials: true
      });
      toast.success("Notice deleted successfully");
      loadNotices();
    } catch (error) {
      toast.error("Failed to delete notice");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    const typeObj = noticeTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : "📢";
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) - new Date() < 24 * 60 * 60 * 1000; // 24 hours
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Notices Management</h1>
          <p className="text-gray-600 mt-1">Create and manage notices for your staff members</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNotice(null);
            setFormData({ title: "", body: "", type: "general", priority: "medium", expiresAt: "" });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Notice
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingNotice ? "Edit Notice" : "Create New Notice"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notice title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter notice message"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {noticeTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for notices that don't expire
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingNotice ? "Update Notice" : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notices yet</h3>
            <p className="text-gray-600 mb-4">Create your first notice to communicate with staff</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Notice
            </button>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notice.priority)} ${
                isExpiringSoon(notice.expiresAt) ? 'ring-2 ring-orange-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(notice.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{notice.title}</h3>
                    <p className="text-sm text-gray-600">{notice.body}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                  {isExpiringSoon(notice.expiresAt) && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      Expires Soon
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-4">
                  <span>Posted: {new Date(notice.createdAt).toLocaleDateString()}</span>
                  {notice.expiresAt && (
                    <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit notice"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Delete notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useContext } from 'react';
import { Plus, Filter, RefreshCw, Search, Grid, List, TrendingUp, Trash2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext.jsx';

const AdvertisementDashboard = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const { backendUrl } = useContext(AppContext);

  // Form state for create/edit
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: true,
    imageFile: null,
  });
  // Media preview (blob URL or existing server URL) and type flag
  const [imagePreview, setImagePreview] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);

  // Helper to guess video from filename if mediaType is missing
  const isVideoFilename = (name) => /\.(mp4|webm|ogg|mov|mkv)$/i.test(name || '');

  // When opening the form, prefill if editing
  useEffect(() => {
    if (showForm) {
      if (editingAd) {
        setFormValues({
          title: editingAd.title || '',
          description: editingAd.description || '',
          // Convert to yyyy-mm-dd for input type=date
          startDate: editingAd.startDate ? new Date(editingAd.startDate).toISOString().slice(0, 10) : '',
          endDate: editingAd.endDate ? new Date(editingAd.endDate).toISOString().slice(0, 10) : '',
          status: Boolean(editingAd.status),
          imageFile: null,
        });
        // If switching from a blob preview, revoke it first
        setImagePreview((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return editingAd.image ? `${backendUrl}/uploads/${editingAd.image}` : null;
        });
        setPreviewIsVideo(Boolean(editingAd?.mediaType === 'video' || isVideoFilename(editingAd?.image)));
      } else {
        setFormValues({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          status: true,
          imageFile: null,
        });
        // Clear preview (and revoke blob if present)
        setImagePreview((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return null;
        });
        setPreviewIsVideo(false);
      }
    }
  }, [showForm, editingAd, backendUrl]);

  // Fetch advertisements
  const fetchAdvertisements = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const filterStatus = status === 'all' ? null : status === 'active';
      const response = await fetch(`${backendUrl}/api/ads?page=${page}&limit=10${filterStatus !== null ? `&status=${filterStatus}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setAdvertisements(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error(error.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreateNew = () => {
    setEditingAd(null);
    setShowForm(true);
  };

  const handleEdit = (advertisement) => {
    setEditingAd(advertisement);
    setShowForm(true);
  };

  const handleDelete = (advertisement) => {
    setShowDeleteConfirm(advertisement);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      const response = await fetch(`${backendUrl}/api/ads/${showDeleteConfirm._id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Advertisement deleted successfully');
        setShowDeleteConfirm(null);
        fetchAdvertisements(currentPage, statusFilter);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error(error.message || 'Failed to delete advertisement');
    }
  };

  const handleFormSuccess = () => {
    fetchAdvertisements(currentPage, statusFilter);
  };

  const handleRefresh = () => {
    fetchAdvertisements(currentPage, statusFilter);
  };

  // Handlers for form inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormValues((prev) => ({ ...prev, imageFile: file }));
    // Update preview and revoke old blob if any
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPreviewIsVideo(Boolean(file && file.type && file.type.startsWith('video/')));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAd(null);
    // Revoke blob URL if used
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewIsVideo(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEditing = Boolean(editingAd && editingAd._id);
      const url = isEditing ? `${backendUrl}/api/ads/${editingAd._id}` : `${backendUrl}/api/ads`;
      const method = isEditing ? 'PUT' : 'POST';

      const fd = new FormData();
      fd.append('title', formValues.title);
      fd.append('description', formValues.description);
      fd.append('startDate', formValues.startDate);
      fd.append('endDate', formValues.endDate);
      fd.append('status', String(Boolean(formValues.status)));
      if (!isEditing || formValues.imageFile) {
        if (!formValues.imageFile && !isEditing) {
          toast.error('Please select an image');
          return;
        }
        if (formValues.imageFile) {
          fd.append('image', formValues.imageFile);
        }
      }

      const resp = await fetch(url, { method, body: fd });
      const data = await resp.json();
      if (!data.success) {
        const firstValidation = Array.isArray(data.errors) && data.errors.length ? data.errors[0].msg : null;
        throw new Error(firstValidation || data.message || 'Failed to save advertisement');
      }

      toast.success(isEditing ? 'Advertisement updated' : 'Advertisement created');
      // Revoke any blob preview after successful save
      setImagePreview((prev) => {
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        return null;
      });
      setPreviewIsVideo(false);
      closeForm();
      handleFormSuccess();
    } catch (err) {
      console.error('Save advertisement error:', err);
      toast.error(err.message || 'Failed to save advertisement');
    }
  };

  // Calculate stats for dashboard overview
  const getStats = () => {
    if (!advertisements.length) return { active: 0, inactive: 0, total: pagination.totalItems || 0 };
    
    const stats = advertisements.reduce((acc, ad) => {
      if (ad.status && ad.isActive) {
        acc.active++;
      } else {
        acc.inactive++;
      }
      return acc;
    }, { active: 0, inactive: 0 });
    
    return { ...stats, total: pagination.totalItems || 0 };
  };
  
  const stats = getStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (advertisement) => {
    const isActive = advertisement.isActive;
    
    if (!advertisement.status) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Inactive</span>;
    }
    
    if (isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>;
    } else {
      const now = new Date();
      const startDate = new Date(advertisement.startDate);
      const endDate = new Date(advertisement.endDate);
      
      if (now < startDate) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Scheduled</span>;
      } else if (now > endDate) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Expired</span>;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your salon advertisements and promotions</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Advertisement
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Advertisements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">All campaigns</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                <p className="text-xs text-green-600">Currently running</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive & Drafts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-xs text-gray-500">Not running</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Filter by Status</label>
                  <p className="text-xs text-gray-500">Show specific advertisement types</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">📊 All Advertisements</option>
                  <option value="active">🟢 Active Only</option>
                  <option value="inactive">⚫ Inactive Only</option>
                </select>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-gray-900 font-medium">
                    {pagination.totalItems || 0} result{(pagination.totalItems || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading advertisements...</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && advertisements.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No advertisements yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first advertisement campaign for Pink Aura Salon.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Advertisement
            </button>
          </div>
        )}

        {/* Advertisement Grid */}
        {!loading && advertisements.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {advertisements.map((ad) => (
                <div key={ad._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Image */}
                  <div className="relative">
                    {ad.image ? (
                      (ad.mediaType === 'video' || isVideoFilename(ad.image)) ? (
                        <video
                          src={`${backendUrl}/uploads/${ad.image}`}
                          className="w-full h-48 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={`${backendUrl}/uploads/${ad.image}`}
                          alt={ad.title}
                          className="w-full h-48 object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">No image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(ad)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ad.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ad.description}</p>
                    
                    {/* Dates */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Start: {formatDate(ad.startDate)}</span>
                      <span>End: {formatDate(ad.endDate)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-pink-700 bg-pink-50 rounded-lg hover:bg-pink-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-pink-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Advertisement Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAd ? 'Edit Advertisement' : 'New Advertisement'}
              </h3>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formValues.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Winter Discount Campaign"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={4}
                  placeholder="Short description of the campaign"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formValues.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formValues.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formValues.status}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-pink-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media (image or video)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="text-sm"
                    required={!editingAd}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      {previewIsVideo ? (
                        <video src={imagePreview} controls className="h-32 w-full object-cover rounded border" />
                      ) : (
                        <img
                          src={imagePreview}
                          alt="Selected preview"
                          className="h-32 w-full object-cover rounded border"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700"
                >
                  {editingAd ? 'Save Changes' : 'Create Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the advertisement:
              </p>
              <p className="font-medium text-gray-900 bg-gray-100 rounded p-3">
                "{showDeleteConfirm.title}"
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Advertisement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementDashboard;
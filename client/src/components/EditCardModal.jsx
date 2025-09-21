import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { X, CreditCard, Loader, Shield, CheckCircle, AlertCircle, Star, Info } from 'lucide-react';

const EditCardModal = ({ isOpen, onClose, card }) => {
  const [formData, setFormData] = useState({
    billingDetails: {
      name: '',
      email: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Sri Lanka'
      }
    },
    isDefault: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Initialize form with card data
  useEffect(() => {
    if (card) {
      setFormData({
        billingDetails: {
          name: card.billingDetails?.name || '',
          email: card.billingDetails?.email || '',
          address: {
            line1: card.billingDetails?.address?.line1 || '',
            line2: card.billingDetails?.address?.line2 || '',
            city: card.billingDetails?.address?.city || '',
            state: card.billingDetails?.address?.state || '',
            postal_code: card.billingDetails?.address?.postal_code || '',
            country: 'Sri Lanka'
          }
        },
        isDefault: card.isDefault || false
      });
    }
  }, [card]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.billingDetails.email && !/\S+@\S+\.\S+/.test(formData.billingDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          billingDetails: {
            ...prev.billingDetails,
            address: {
              ...prev.billingDetails.address,
              [child]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          billingDetails: {
            ...prev.billingDetails,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error for this field
    if (errors[name] || errors[name.split('.')[1]]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors[name.split('.')[1]];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${backendUrl}/api/payments/${card._id}`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Payment method updated successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update payment method';
      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.toLowerCase().replace(/\s+/g, '')] = err;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCardBrandStyle = (brand) => {
    const brandStyles = {
      visa: { gradient: 'from-blue-600 to-blue-700', color: 'text-white', accent: 'text-blue-100' },
      mastercard: { gradient: 'from-red-600 to-red-700', color: 'text-white', accent: 'text-red-100' },
      amex: { gradient: 'from-green-600 to-green-700', color: 'text-white', accent: 'text-green-100' },
      discover: { gradient: 'from-orange-600 to-orange-700', color: 'text-white', accent: 'text-orange-100' },
      unknown: { gradient: 'from-gray-600 to-gray-700', color: 'text-white', accent: 'text-gray-100' }
    };

    return brandStyles[brand] || brandStyles.unknown;
  };

  if (!isOpen || !card) return null;

  const brandStyle = getCardBrandStyle(card.cardBrand);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Payment Method</h2>
                <p className="text-white/80 capitalize">
                  {card.cardBrand} ending in {card.last4}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Security Indicators */}
          <div className="relative mt-6 flex items-center justify-center space-x-6 text-white/90">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Secure Update</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Verified Card</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Card Preview & Info */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Card</h3>
                  
                  {/* Card Preview */}
                  <div className={`relative bg-gradient-to-br ${brandStyle.gradient} rounded-2xl p-6 shadow-xl max-w-sm mx-auto text-white`}>
                    {/* Default Badge */}
                    {card.isDefault && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">EXPIRES</p>
                        <p className="font-mono">
                          {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="font-mono text-lg tracking-wider">
                        •••• •••• •••• {card.last4}
                      </p>
                      <div>
                        <p className="text-xs opacity-75">CARDHOLDER NAME</p>
                        <p className="font-medium">
                          {formData.billingDetails.name || 'Cardholder Name'}
                        </p>
                      </div>
                      <div className="text-xs opacity-75 capitalize">
                        {card.cardBrand}
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 opacity-10">
                      <div className="w-16 h-16 rounded-full bg-white"></div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <div className="w-12 h-12 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* Card Information (Read-only) */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                  <h4 className="flex items-center font-medium text-gray-900 mb-4">
                    <Info className="w-5 h-5 mr-2" />
                    Card Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Card Type:</span>
                      <span className="font-medium capitalize px-3 py-1 bg-white rounded-lg shadow-sm">
                        {card.cardBrand}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Card Number:</span>
                      <span className="font-mono font-medium px-3 py-1 bg-white rounded-lg shadow-sm">
                        •••• •••• •••• {card.last4}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Expiration:</span>
                      <span className="font-mono font-medium px-3 py-1 bg-white rounded-lg shadow-sm">
                        {String(card.expMonth).padStart(2, '0')}/{String(card.expYear)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      {card.isDefault ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Default Payment
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Update Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">What can you update?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You can update billing information and default status. Card number, expiration date, and brand cannot be changed for security reasons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Update Billing Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="billingDetails.name"
                      value={formData.billingDetails.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="billingDetails.email"
                      value={formData.billingDetails.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-300'
                      }`}
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Address Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Billing Address
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="address.line1"
                      value={formData.billingDetails.address.line1}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="address.line2"
                      value={formData.billingDetails.address.line2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.billingDetails.address.city}
                        onChange={handleInputChange}
                        placeholder="Colombo"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.billingDetails.address.state}
                        onChange={handleInputChange}
                        placeholder="Western Province"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="address.postal_code"
                        value={formData.billingDetails.address.postal_code}
                        onChange={handleInputChange}
                        placeholder="10001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address.country"
                        value="Sri Lanka"
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                      />
                      <div className="absolute right-3 top-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Payment Settings
                  </h4>
                  
                  {/* Default Option */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        id="isDefaultEdit"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label htmlFor="isDefaultEdit" className="text-sm font-medium text-gray-900">
                          Default Payment Method
                        </label>
                        <p className="text-xs text-gray-600">
                          Use this card for all future payments by default
                        </p>
                      </div>
                    </div>
                    {formData.isDefault && (
                      <div className="flex items-center text-green-600">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
                {loading ? 'Updating Payment Method...' : 'Update Payment Method'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCardModal;
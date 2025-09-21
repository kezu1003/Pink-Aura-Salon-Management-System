import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { X, CreditCard, Loader, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const AddCardModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardBrand: 'visa',
    expMonth: '',
    expYear: '',
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

  const cardBrands = [
    { value: 'visa', label: 'Visa', color: 'from-blue-600 to-blue-700' },
    { value: 'mastercard', label: 'Mastercard', color: 'from-red-600 to-red-700' },
    { value: 'amex', label: 'American Express', color: 'from-green-600 to-green-700' },
    { value: 'discover', label: 'Discover', color: 'from-orange-600 to-orange-700' },
    { value: 'unknown', label: 'Other', color: 'from-gray-600 to-gray-700' }
  ];

  // Auto-detect card brand based on card number
  const detectCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]|^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    return 'unknown';
  };

  // Generate years for expiration dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    }

    if (!formData.expMonth || formData.expMonth < 1 || formData.expMonth > 12) {
      newErrors.expMonth = 'Please select a valid month';
    }

    if (!formData.expYear || formData.expYear < currentYear) {
      newErrors.expYear = 'Please select a valid year';
    }

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
      const response = await axios.post(
        `${backendUrl}/api/payments`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Payment method added successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add payment method';
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

  const getCurrentBrandStyle = () => {
    return cardBrands.find(brand => brand.value === formData.cardBrand) || cardBrands[0];
  };

  if (!isOpen) return null;

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
                <h2 className="text-2xl font-bold">Add Payment Method</h2>
                <p className="text-white/80">Secure and encrypted payment processing</p>
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
              <span className="text-sm">SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Bank-level Security</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Card Preview */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Preview</h3>
                  
                  {/* Card Preview */}
                  <div className={`relative bg-gradient-to-br ${getCurrentBrandStyle().color} rounded-2xl p-6 shadow-xl max-w-sm mx-auto text-white`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">EXPIRES</p>
                        <p className="font-mono">
                          {formData.expMonth ? String(formData.expMonth).padStart(2, '0') : 'MM'}/
                          {formData.expYear ? String(formData.expYear).slice(-2) : 'YY'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="font-mono text-lg tracking-wider">
                        {formData.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div>
                        <p className="text-xs opacity-75">CARDHOLDER NAME</p>
                        <p className="font-medium">
                          {formData.billingDetails.name || 'Your Name'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-10">
                      <div className="w-16 h-16 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Secure Processing</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your card information is encrypted and never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        // Format card number with spaces
                        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                        value = value.replace(/(.{4})/g, '$1 ').trim();
                        
                        // Auto-detect card brand
                        const detectedBrand = detectCardBrand(value);
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          cardNumber: value,
                          cardBrand: detectedBrand
                        }));
                        
                        // Clear error
                        if (errors.cardNumber) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.cardNumber;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="23"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-300'
                      }`}
                    />
                    <div className="absolute right-3 top-3">
                      <CreditCard className={`w-5 h-5 ${errors.cardNumber ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cardNumber}
                    </div>
                  )}
                </div>

                {/* Card Brand - Auto-detected */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Brand (Auto-detected)
                  </label>
                  <select
                    name="cardBrand"
                    value={formData.cardBrand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                  >
                    {cardBrands.map(brand => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiration Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Month *
                    </label>
                    <select
                      name="expMonth"
                      value={formData.expMonth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.expMonth ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-300'
                      }`}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {String(month).padStart(2, '0')} - {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    {errors.expMonth && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.expMonth}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Year *
                    </label>
                    <select
                      name="expYear"
                      value={formData.expYear}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.expYear ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-300'
                      }`}
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors.expYear && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.expYear}
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Details */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h4>
                  
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
                        Email
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

                  {/* Address */}
                  <div className="mt-4 space-y-4">
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
                        placeholder="Apartment, suite, etc."
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
                      <input
                        type="text"
                        name="address.country"
                        value="Sri Lanka"
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Default Option */}
                <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-3 text-sm font-medium text-gray-700">
                    Set as default payment method
                  </label>
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
                {loading ? 'Adding Payment Method...' : 'Add Payment Method'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
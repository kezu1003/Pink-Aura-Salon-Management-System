import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Star,
  Shield,
  Loader,
  Wallet,
  CheckCircle
} from 'lucide-react';
import AddCardModal from '../components/AddCardModal';
import EditCardModal from '../components/EditCardModal';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all payment methods
  const fetchCards = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/payments`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setCards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Set card as default
  const setAsDefault = async (cardId) => {
    setActionLoading(cardId);
    try {
      const response = await axios.patch(
        `${backendUrl}/api/payments/${cardId}/default`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Default payment method updated');
        fetchCards();
      }
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error(error.response?.data?.message || 'Failed to set as default');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete card
  const deleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    setActionLoading(cardId);
    try {
      const response = await axios.delete(`${backendUrl}/api/payments/${cardId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Payment method deleted successfully');
        fetchCards();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment method');
    } finally {
      setActionLoading(null);
    }
  };

  // Get card brand colors and gradients
  const getCardBrandStyle = (brand) => {
    const brandStyles = {
      visa: {
        gradient: 'from-blue-600 via-blue-700 to-blue-800',
        color: 'text-white',
        accent: 'text-blue-100'
      },
      mastercard: {
        gradient: 'from-red-600 via-red-700 to-red-800',
        color: 'text-white',
        accent: 'text-red-100'
      },
      amex: {
        gradient: 'from-green-600 via-green-700 to-green-800',
        color: 'text-white',
        accent: 'text-green-100'
      },
      discover: {
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        color: 'text-white',
        accent: 'text-orange-100'
      },
      unknown: {
        gradient: 'from-gray-600 via-gray-700 to-gray-800',
        color: 'text-white',
        accent: 'text-gray-100'
      }
    };

    return brandStyles[brand] || brandStyles.unknown;
  };

  // Handle edit card
  const handleEditCard = (card) => {
    setSelectedCard(card);
    setShowEditModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCard(null);
    fetchCards();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center space-x-4">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium text-gray-700">Loading your payment methods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Wallet className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Payment Methods
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Manage your saved cards and billing information with enterprise-grade security
            </p>
            <div className="flex items-center justify-center mt-6 space-x-2 text-white/80">
              <Shield className="w-5 h-5" />
              <span>Protected by 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add New Card Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            Add New Payment Method
          </button>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-xl max-w-md mx-auto">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-2xl mb-6 inline-block">
                <CreditCard className="w-16 h-16 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Payment Methods Yet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Add your first payment method to start making secure transactions with enhanced protection.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Card
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const brandStyle = getCardBrandStyle(card.cardBrand);
              return (
                <div
                  key={card._id}
                  className="group relative transform hover:scale-105 transition-all duration-300"
                >
                  {/* Credit Card Design */}
                  <div className={`relative bg-gradient-to-br ${brandStyle.gradient} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 min-h-[200px]`}>
                    {/* Default Badge */}
                    {card.isDefault && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <CreditCard className={`w-6 h-6 ${brandStyle.color}`} />
                        </div>
                        <div>
                          <p className={`font-bold ${brandStyle.color} capitalize text-lg`}>
                            {card.cardBrand}
                          </p>
                          <p className={`text-sm ${brandStyle.accent}`}>
                            •••• •••• •••• {card.last4}
                          </p>
                        </div>
                      </div>
                      
                      {card.isDefault && (
                        <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-current text-yellow-300 mr-1" />
                          <span className="text-xs font-medium text-white">Default</span>
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className={`text-xs ${brandStyle.accent} uppercase tracking-wider`}>
                          Valid Thru
                        </p>
                        <p className={`text-lg font-mono ${brandStyle.color}`}>
                          {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                        </p>
                      </div>
                      {card.billingDetails?.name && (
                        <div>
                          <p className={`text-xs ${brandStyle.accent} uppercase tracking-wider`}>
                            Cardholder
                          </p>
                          <p className={`${brandStyle.color} font-medium truncate`}>
                            {card.billingDetails.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 opacity-10">
                      <div className="w-16 h-16 rounded-full bg-white"></div>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-5">
                      <div className="w-12 h-12 rounded-full bg-white"></div>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="bg-white rounded-b-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300 -mt-2 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCard(card)}
                          disabled={actionLoading === card._id}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Edit Payment Method"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCard(card._id)}
                          disabled={actionLoading === card._id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Payment Method"
                        >
                          {actionLoading === card._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {!card.isDefault && (
                        <button
                          onClick={() => setAsDefault(card._id)}
                          disabled={actionLoading === card._id}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors duration-200"
                        >
                          {actionLoading === card._id ? (
                            <Loader className="w-3 h-3 animate-spin inline" />
                          ) : (
                            'Set as Default'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Payment Information is Secure</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We use industry-standard encryption to protect your payment information. Your card details are never stored in plain text and are protected by multiple layers of security.
              </p>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddCardModal
            isOpen={showAddModal}
            onClose={handleModalClose}
          />
        )}

        {showEditModal && selectedCard && (
          <EditCardModal
            isOpen={showEditModal}
            onClose={handleModalClose}
            card={selectedCard}
          />
        )}
      </div>
    </div>
  );
};

export default CardManagement;
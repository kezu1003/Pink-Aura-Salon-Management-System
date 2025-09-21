import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  ShoppingBag, 
  ArrowLeft, 
  Shield, 
  Lock, 
  CheckCircle, 
  Clock,
  Truck,
  Phone,
  Mail,
  Loader,
  Star,
  Package,
  Zap,
  Users
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totals, clear, refreshStocks } = useCart();
  const [loading, setLoading] = useState(false);

  // Legacy checkout function (for cash on delivery or direct orders)
  const placeOrder = async () => {
    setLoading(true);
    try {
      await refreshStocks(); // optional preflight
      const payload = { items: items.map((i) => ({ productId: i.productId, qty: i.qty })) };
      const { data } = await api.post("/api/orders/checkout", payload);
      if (data.success) {
        toast.success("Order placed successfully!");
        clear();
        navigate("/shop");
      } else {
        toast.error(data.message || "Checkout failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Stripe payment
  const proceedToPayment = () => {
    navigate("/payment");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl mb-6 inline-block">
            <ShoppingBag className="w-20 h-20 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Checkout</h1>
                <p className="text-white/80 mt-2">Choose your preferred payment method</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-white/90">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm">Protected Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-indigo-600" />
                  Order Summary
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {totals.totalQty} qty
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="group hover:bg-gray-50 rounded-xl p-4 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                              alt={item.name} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {item.qty}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600">
                            LKR {item.price.toFixed(2)} each
                          </p>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          LKR {(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Total Items</span>
                  <span className="font-medium">{totals.totalQty} items</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">LKR {totals.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Processing Fee</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <span>Total Amount</span>
                    <span>LKR {totals.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Fast Delivery</p>
                    <p className="text-sm text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Secure Packaging</p>
                    <p className="text-sm text-gray-600">Protected delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Options */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Options</h2>
                <p className="text-gray-600">Choose your preferred payment method to complete your order</p>
              </div>

              <div className="space-y-6">
                {/* Online Payment with Stripe */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-200"></div>
                  <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-blue-900 mb-2">Online Payment</h3>
                          <p className="text-blue-700 mb-4">Secure payment with credit/debit card via Stripe</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <Zap className="w-4 h-4" />
                              <span>Instant confirmation</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <Shield className="w-4 h-4" />
                              <span>Bank-level security</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <CheckCircle className="w-4 h-4" />
                              <span>SSL encrypted</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <Star className="w-4 h-4" />
                              <span>Preferred method</span>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-600 font-medium">Accepted Cards:</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Visa</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Mastercard</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Amex</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Discover</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={proceedToPayment}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay Online Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery / Direct Order */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
                  <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-xl shadow-lg">
                          <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Order</h3>
                          <p className="text-gray-700 mb-4">Place order without online payment</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4" />
                              <span>No online payment</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Truck className="w-4 h-4" />
                              <span>Pay on delivery</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Phone className="w-4 h-4" />
                              <span>Phone confirmation</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Mail className="w-4 h-4" />
                              <span>Email updates</span>
                            </div>
                          </div>
                          
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-600 font-medium">Payment Options:</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Cash</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Bank Transfer</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Mobile Payment</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={placeOrder}
                        disabled={loading}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Place Order
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Security & Trust
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">SSL Encrypted</p>
                    <p className="text-sm text-gray-600">256-bit security</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Trusted by 1000+</p>
                    <p className="text-sm text-gray-600">Happy customers</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Your information is secure and encrypted with industry-standard protection</span>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-600">
                  <span>🔒 SSL Secured</span>
                  <span>🛡️ PCI Compliant</span>
                  <span>✅ Bank Grade Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
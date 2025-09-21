import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  ShoppingBag, 
  ArrowRight, 
  Shield, 
  Clock, 
  MapPin,
  Package,
  Truck,
  Star,
  Heart,
  Share2,
  Home,
  ShoppingCart
} from "lucide-react";
import api from "../api/axios";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { orderId, paymentIntentId, amount } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate("/shop");
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        if (data.success) {
          setOrder(data.order);
        } else {
          console.error("Failed to fetch order");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleDownloadReceipt = () => {
    // In a real app, this would generate a PDF receipt
    alert("Receipt download functionality would be implemented here");
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Order Confirmation",
        text: `I just placed an order for LKR ${amount?.toFixed(2)}!`,
        url: window.location.href,
      }).catch(() => {
        alert("Order shared successfully!");
      });
    } else {
      alert("Order details copied to clipboard!");
      navigator.clipboard.writeText(`Order #${orderId} - LKR ${amount?.toFixed(2)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-8 rounded-3xl mb-6 inline-block">
            <Shield className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h3>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header with Celebration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl inline-block mb-6">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-white/90 text-xl mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full inline-flex items-center space-x-4">
              <span className="text-white font-semibold">Order #{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-white/80">•</span>
              <span className="text-white font-bold">LKR {amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-pink-500" />
                Order Summary
              </h2>
              
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{item.qty}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">LKR {item.price?.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">LKR {(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">LKR {amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl mt-4">
                  <span>Total Paid</span>
                  <span>LKR {amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-pink-500" />
                Order Status
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Payment Confirmed</p>
                    <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
                  </div>
                  <span className="text-sm text-gray-500">Just now</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
                  </div>
                  <span className="text-sm text-gray-500">Next</span>
                </div>
                
                <div className="flex items-center space-x-4 opacity-50">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <Truck className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Shipped</p>
                    <p className="text-sm text-gray-600">Your order is on the way</p>
                  </div>
                  <span className="text-sm text-gray-500">Soon</span>
                </div>
                
                <div className="flex items-center space-x-4 opacity-50">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Delivered</p>
                    <p className="text-sm text-gray-600">Your order has been delivered</p>
                  </div>
                  <span className="text-sm text-gray-500">Later</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Order Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Download className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="font-medium text-gray-900">Download Receipt</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600" />
                </button>
                
                <button
                  onClick={handleShareOrder}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Share2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Share Order</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
                
                <Link
                  to="/shop"
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Continue Shopping</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                </Link>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl shadow-xl p-6 border border-pink-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-pink-600" />
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our customer support team is here to help with any questions about your order.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-sm text-gray-700">support@yourstore.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-sm text-gray-700">24/7 Support Available</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-sm text-gray-600">Check your inbox for order details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipping Updates</p>
                    <p className="text-sm text-gray-600">We'll notify you when your order ships</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg mt-1">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Leave a Review</p>
                    <p className="text-sm text-gray-600">Share your experience after delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
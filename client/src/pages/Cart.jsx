import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Package, 
  Tag, 
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  Star,
  Heart,
  Loader,
  ArrowLeft
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, totals, refreshStocks } = useCart();
  const [liveStocks, setLiveStocks] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (items.length === 0) return setLiveStocks(new Map());
        const { data } = await api.get("/api/products", {
          params: { ids: items.map((i) => i.productId).join(",") },
        });
        const map = new Map(data.products.map((p) => [p._id, p.stock]));
        setLiveStocks(map);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [items]);

  const handleRemoveItem = async (productId) => {
    setRemovingItems(prev => new Set([...prev, productId]));
    // Small delay for animation
    setTimeout(() => {
      removeItem(productId);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  const handleQuantityChange = (productId, newQty, maxStock) => {
    const validQty = Math.max(1, Math.min(newQty, maxStock));
    updateQty(productId, validQty, maxStock);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl mb-6 inline-block">
            <ShoppingCart className="w-20 h-20 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ready to start shopping? Discover our amazing products and add them to your cart!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
          </Link>
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Shopping Cart</h1>
                <p className="text-white/80 mt-2">Review your items and proceed to checkout</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-white/90">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-medium">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-indigo-600" />
                  Cart Items
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {totals.totalQty} total
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl p-6 flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const maxStock = liveStocks.get(item.productId) ?? item.stockSnapshot ?? 1;
                    const isRemoving = removingItems.has(item.productId);
                    
                    return (
                      <div 
                        key={item.productId} 
                        className={`group bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 ${
                          isRemoving ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-6">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                                  alt={item.name}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  <Package className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {item.qty}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate mb-1">{item.name}</h3>
                            <div className="flex items-center space-x-4 mb-3">
                              <p className="text-indigo-600 font-semibold flex items-center">
                                <Tag className="w-4 h-4 mr-1" />
                                LKR {item.price?.toFixed(2)}
                              </p>
                              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                Stock: {maxStock}
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center bg-white rounded-xl border-2 border-gray-200">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.qty - 1, maxStock)}
                                  disabled={item.qty <= 1}
                                  className="p-2 hover:bg-gray-100 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={maxStock}
                                  value={item.qty}
                                  onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value || 1), maxStock)}
                                  className="w-16 px-3 py-2 text-center border-0 focus:outline-none font-medium"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.qty + 1, maxStock)}
                                  disabled={item.qty >= maxStock}
                                  className="p-2 hover:bg-gray-100 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {item.qty >= maxStock && (
                                <div className="flex items-center text-amber-600 text-sm">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Max quantity reached
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              LKR {(item.qty * item.price).toFixed(2)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {/* Add to wishlist functionality */}}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Add to Wishlist"
                              >
                                <Heart className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                disabled={isRemoving}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Remove Item"
                              >
                                {isRemoving ? (
                                  <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Continue Shopping */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Need more items?</h3>
                    <p className="text-sm text-gray-600">Continue shopping to add more products</p>
                  </div>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-indigo-600" />
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Items ({totals.totalQty})</span>
                  <span className="font-medium">LKR {totals.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>LKR {totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>

            {/* Savings Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">Free Shipping!</h4>
                  <p className="text-sm text-green-700">You've qualified for free delivery</p>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-green-800 font-medium">
                  Save on shipping costs with orders over LKR 1,000
                </p>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Why Shop With Us?</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Fast & reliable delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Easy returns & exchanges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
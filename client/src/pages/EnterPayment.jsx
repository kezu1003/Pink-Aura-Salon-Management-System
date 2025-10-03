import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ShoppingBag,
  ArrowLeft,
  Loader,
  Star,
  MapPin,
  Mail,
  User
} from "lucide-react";

// Load Stripe
const stripePromise = loadStripe("pk_test_51S9IQbHMk9ohtPD1WwNLEKiiuaznHDqpW4z4KWdoF3eLNZBtdXEQ7a1f2NN4quF7jcaxpnNHQHG8VhvZf6Yq430C00YnxxpcSZ");

// Enhanced card element options with modern styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#4D423A",
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: "400",
      "::placeholder": {
        color: "#4D423A80",
      },
      iconColor: "#FBAA99",
    },
    invalid: {
      color: "#4D423A",
      iconColor: "#FBAA99",
    },
    complete: {
      color: "#4D423A",
      iconColor: "#FBAA99",
    },
  },
  hidePostalCode: false,
};

// Payment Form Component
function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, totals, clear } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "LK",
    },
  });

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await api.post("/api/stripe/create-payment-intent", {
          amount: Math.round(totals.totalAmount * 100), // Convert to cents
          currency: "lkr",
          items: items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            name: item.name,
            price: item.price
          }))
        });
        
        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          toast.error("Failed to initialize payment");
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast.error("Payment initialization failed");
      }
    };

    if (items.length > 0) {
      createPaymentIntent();
    }
  }, [items, totals.totalAmount]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBillingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      toast.error("Stripe not loaded properly");
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed");
        navigate("/payment-failed", { state: { error: error.message } });
      } else if (paymentIntent.status === "succeeded") {
        // Payment successful, process the order
        const orderData = {
          paymentIntentId: paymentIntent.id,
          items: items.map(item => ({
            productId: item.productId,
            qty: item.qty
          })),
          billingDetails,
          paymentMethod: paymentIntent.payment_method
        };

        const { data } = await api.post("/api/orders/complete-order", orderData);
        
        if (data.success) {
          clear(); // Clear cart
          navigate("/payment-success", { 
            state: { 
              orderId: data.order._id,
              paymentIntentId: paymentIntent.id,
              amount: totals.totalAmount
            } 
          });
        } else {
          navigate("/payment-failed", { state: { error: data.message } });
        }
      }
    } catch (err) {
      console.error("Order processing error:", err);
      toast.error("Order processing failed");
      navigate("/payment-failed", { state: { error: "Order processing failed" } });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FEF4F1] flex items-center justify-center">
        <div className="text-center bg-[#FFFFFF] p-12 rounded-3xl shadow-xl max-w-md">
          <div className="bg-[#FEF4F1] p-6 rounded-2xl mb-6 inline-block">
            <ShoppingBag className="w-16 h-16 text-[#4D423A]" />
          </div>
          <h3 className="text-2xl font-bold text-[#4D423A] mb-3">Cart is Empty</h3>
          <p className="text-[#4D423A]/80 mb-6">Add some items to your cart before proceeding to payment.</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-[#FBAA99] text-[#FFFFFF] rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF4F1]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#FBAA99]">
        <div className="absolute inset-0 bg-[#000000] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-[#FFFFFF]/80 hover:text-[#FFFFFF] bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 p-2 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#FFFFFF]">Secure Payment</h1>
                <p className="text-[#FFFFFF]/80 mt-2">Complete your purchase with confidence</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-[#FFFFFF]/90">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">256-bit SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm">Bank Grade Security</span>
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
            <div className="bg-[#FFFFFF] rounded-3xl shadow-xl p-8 border border-[#FEF4F1]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#4D423A] flex items-center">
                  <ShoppingBag className="w-6 h-6 mr-3 text-[#FBAA99]" />
                  Order Summary
                </h2>
                <span className="bg-[#FEF4F1] text-[#4D423A] px-3 py-1 rounded-full text-sm font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-4 bg-[#FEF4F1] rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#FBAA99] rounded-lg flex items-center justify-center">
                        <span className="text-[#FFFFFF] font-bold text-sm">{item.qty}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4D423A]">{item.name}</h3>
                        <p className="text-sm text-[#4D423A]/80">LKR {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4D423A]">LKR {(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#4D423A]/80">Subtotal</span>
                  <span className="font-medium">LKR {totals.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#4D423A]/80">Processing Fee</span>
                  <span className="font-medium text-[#FBAA99]">Free</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-[#4D423A] bg-[#FEF4F1] p-4 rounded-xl">
                  <span>Total</span>
                  <span>LKR {totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-[#FFFFFF] rounded-3xl shadow-xl p-6 border border-[#FEF4F1]">
              <h3 className="font-bold text-[#4D423A] mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#FBAA99]" />
                Your Payment is Protected
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#FEF4F1] p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-[#FBAA99]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#4D423A]">SSL Encrypted</p>
                    <p className="text-sm text-[#4D423A]/80">Bank-level security</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#FEF4F1] p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-[#FBAA99]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#4D423A]">PCI Compliant</p>
                    <p className="text-sm text-[#4D423A]/80">Industry standard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="bg-[#FFFFFF] rounded-3xl shadow-xl p-8 border border-[#FEF4F1]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#4D423A] mb-2">Payment Information</h2>
              <p className="text-[#4D423A]/80">Please enter your payment and billing details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing Details Section */}
              <div className="space-y-6">
                <div className="border-b border-[#FEF4F1] pb-4">
                  <h3 className="text-lg font-semibold text-[#4D423A] mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#FBAA99]" />
                    Billing Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4D423A] mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={billingDetails.name}
                        onChange={handleBillingChange}
                        className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                        placeholder="Enter your full name"
                      />
                      <User className="absolute right-3 top-3 w-5 h-5 text-[#4D423A]/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4D423A] mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={billingDetails.email}
                        onChange={handleBillingChange}
                        className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                        placeholder="Enter your email"
                      />
                      <Mail className="absolute right-3 top-3 w-5 h-5 text-[#4D423A]/50" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4D423A] mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address.line1"
                      required
                      value={billingDetails.address.line1}
                      onChange={handleBillingChange}
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                      placeholder="123 Main Street"
                    />
                    <MapPin className="absolute right-3 top-3 w-5 h-5 text-[#4D423A]/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4D423A] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      required
                      value={billingDetails.address.city}
                      onChange={handleBillingChange}
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                      placeholder="Colombo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4D423A] mb-2">
                      Province
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={billingDetails.address.state}
                      onChange={handleBillingChange}
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                      placeholder="Western Province"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4D423A] mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="address.postal_code"
                      required
                      value={billingDetails.address.postal_code}
                      onChange={handleBillingChange}
                      className="w-full px-4 py-3 border-2 border-[#FEF4F1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FBAA99] focus:border-[#FBAA99] transition-colors"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="space-y-4">
                <div className="border-b border-[#FEF4F1] pb-4">
                  <h3 className="text-lg font-semibold text-[#4D423A] mb-2 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-[#FBAA99]" />
                    Payment Method
                  </h3>
                  <p className="text-sm text-[#4D423A]/80">All transactions are secure and encrypted</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4D423A] mb-2">
                    Card Details *
                  </label>
                  <div className={`border-2 rounded-xl p-4 bg-[#FFFFFF] transition-colors ${
                    cardError ? 'border-[#FBAA99] bg-[#FEF4F1]' : 
                    cardComplete ? 'border-[#FBAA99] bg-[#FEF4F1]' : 
                    'border-[#FEF4F1] focus-within:border-[#FBAA99]'
                  }`}>
                    <CardElement 
                      options={cardElementOptions} 
                      onChange={handleCardChange}
                    />
                  </div>
                  {cardError && (
                    <div className="flex items-center mt-2 text-sm text-[#4D423A]">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {cardError}
                    </div>
                  )}
                  {cardComplete && (
                    <div className="flex items-center mt-2 text-sm text-[#4D423A]">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Card details are complete
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!stripe || loading || !clientSecret || !cardComplete}
                  className="w-full px-6 py-4 bg-[#FBAA99] text-[#FFFFFF] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay LKR {totals.totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-[#FEF4F1] rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-[#4D423A]">
                  <Shield className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted with 256-bit SSL</span>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-[#4D423A]/80">
                  <span>🔒 SSL Secured</span>
                  <span>🛡️ PCI Compliant</span>
                  <span>✅ Bank Grade Security</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component with Stripe Elements Provider
export default function EnterPayment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
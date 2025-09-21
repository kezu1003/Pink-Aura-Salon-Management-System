import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { XCircle, RefreshCcw, ArrowLeft, CreditCard, AlertTriangle } from "lucide-react";

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error } = location.state || {};

  // Common error messages and their user-friendly equivalents
  const getErrorMessage = (errorMsg) => {
    if (!errorMsg) return "An unexpected error occurred during payment processing.";
    
    const lowerError = errorMsg.toLowerCase();
    
    if (lowerError.includes("card_declined")) {
      return "Your card was declined. Please try a different payment method or contact your bank.";
    }
    if (lowerError.includes("insufficient_funds")) {
      return "Insufficient funds. Please check your account balance or try a different card.";
    }
    if (lowerError.includes("expired_card")) {
      return "Your card has expired. Please use a different payment method.";
    }
    if (lowerError.includes("incorrect_cvc")) {
      return "The security code (CVC) you entered is incorrect. Please try again.";
    }
    if (lowerError.includes("processing_error")) {
      return "There was a processing error. Please try again in a few moments.";
    }
    if (lowerError.includes("authentication_required")) {
      return "Additional authentication is required. Please try again or use a different card.";
    }
    if (lowerError.includes("network")) {
      return "Network connection issue. Please check your internet connection and try again.";
    }
    
    return errorMsg;
  };

  const errorMessage = getErrorMessage(error);

  const handleRetryPayment = () => {
    navigate("/payment", { replace: true });
  };

  const handleBackToCart = () => {
    navigate("/cart", { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 text-lg">
          We couldn't process your payment. Please try again.
        </p>
      </div>

      {/* Error Details Card */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">What went wrong?</h3>
            <p className="text-red-800 text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Troubleshooting Tips</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Double-check your card details (number, expiry date, CVC)</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Ensure your billing address matches your card's registered address</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Check if your card has sufficient funds or available credit</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Try using a different payment method if available</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Contact your bank if the problem persists</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={handleRetryPayment}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Payment Again
        </button>
        
        <button
          onClick={handleBackToCart}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>
      </div>

      {/* Alternative Payment Methods */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Alternative Payment Options</h3>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Try a different credit or debit card</p>
          <p>• Use a digital wallet if available</p>
          <p>• Contact us for bank transfer instructions</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/shop"
          className="flex-1 px-6 py-3 text-center text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/contact"
          className="flex-1 px-6 py-3 text-center text-blue-600 border border-blue-300 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Contact Support
        </Link>
      </div>

      {/* Support Information */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Still having trouble?</p>
        <p>
          Contact us at{" "}
          <a href="mailto:support@example.com" className="text-blue-600 underline">
            support@example.com
          </a>{" "}
          or call{" "}
          <a href="tel:+94112345678" className="text-blue-600 underline">
            +94 11 234 5678
          </a>
        </p>
        <p className="mt-2 text-xs">
          Reference ID: {Date.now().toString(36).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
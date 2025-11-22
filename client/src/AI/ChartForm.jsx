import React, { useRef } from "react";
import { IoSend } from "react-icons/io5";
import api from "../api/axios";

const ChartForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    setChatHistory((h) => [...h, { role: "user", text: userMessage }]);

    // Check if user is asking about products or skin type
    const isProductQuery = /product|skincare|skin|recommend|suitable|oily|dry|sensitive|combination|normal|mature|acne/i.test(userMessage);
    
    let enhancedMessage = userMessage;
    
    if (isProductQuery) {
      try {
        // Extract potential skin type from user message
        const skinTypes = ["dry skin", "oily skin", "sensitive skin", "combination skin", "normal skin", "mature skin", "acne-prone skin"];
        const detectedSkinType = skinTypes.find(type => userMessage.toLowerCase().includes(type));
        
        // Fetch relevant products
        const params = detectedSkinType ? { skinType: detectedSkinType } : {};
        const { data } = await api.get('/api/products/chatbot', { params });
        
        if (data.success && data.products.length > 0) {
          enhancedMessage = `User query: ${userMessage}. Available products data: ${JSON.stringify(data.products.slice(0, 10))}. Please provide personalized recommendations based on the user's needs and skin type preferences.`;
        }
      } catch (error) {
        console.error('Failed to fetch products for recommendation:', error);
      }
    }

    // Simulate typing delay before bot responds
    setTimeout(() => {
      setChatHistory((h) => [...h, { role: "model", text: "Thinking..." }]);
      generateBotResponse([
        ...chatHistory,
        {
          role: "user",
          text: `Using the salon details and product catalog provided above, please address this query: ${enhancedMessage}`,
        },
      ]);
    }, 600);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="relative flex items-center gap-3 bg-white p-3 rounded-2xl shadow-lg border border-[#FBAA99]/20"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask about services, products, or skin recommendations..."
        required
        className="flex-1 rounded-xl border-none bg-transparent px-4 py-3 text-sm text-[#4D423A] placeholder-[#4D423A]/60 outline-none transition-all focus:ring-2 focus:ring-[#FBAA99]/30"
      />
      <button
        type="submit"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBAA99] text-white shadow-lg transition-all duration-300 hover:bg-[#f68c7c] hover:shadow-xl hover:scale-105 active:scale-95"
        aria-label="Send message"
      >
        <IoSend className="text-lg" />
      </button>
    </form>
  );
};

export default ChartForm;
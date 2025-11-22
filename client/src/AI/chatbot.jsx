import { useState, useEffect, useRef } from "react";
import ChatbotIcon from "./ChatbotIcon";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from "./companyInfo";
import { IoChatbubblesOutline, IoClose, IoChevronDown } from "react-icons/io5";
import api from "../api/axios";

function Chatbot() {
  const [products, setProducts] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  // Fetch products for chatbot context
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products/chatbot');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products for chatbot:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize chat history with company info and products when available
  useEffect(() => {
    if (products.length > 0) {
      const contextData = {
        companyInfo,
        products: products.map(p => ({
          name: p.name,
          category: p.category,
          brand: p.brand,
          price: p.price,
          description: p.description,
          skinType: p.skinType
        }))
      };
      
      setChatHistory([
        { hideInChat: true, role: "model", text: JSON.stringify(contextData) },
        { role: "model", text: "💖 Hi there! Welcome to Pink Aura Salon. I can help you with our services, products, and recommendations based on your skin type. How can I help you today?" },
      ]);
    } else {
      setChatHistory([
        { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
        { role: "model", text: "💖 Hi there! Welcome to Pink Aura Salon. How can I help you today?" },
      ]);
    }
  }, [products]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || "Failed to fetch response");
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*|__|\*/g, "")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <div className="relative">
      {/* FAB toggler */}
      <button
        id="chatbot-toggler"
        onClick={() => setShowChatbot((p) => !p)}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBAA99] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#f68c7c] hover:shadow-3xl focus:outline-none backdrop-blur-sm"
        aria-label={showChatbot ? 'Close chatbot' : 'Open chatbot'}
      >
        {showChatbot ? (
          <IoClose className="text-2xl" />
        ) : (
          <IoChatbubblesOutline className="text-2xl" />
        )}
      </button>

      {/* Popup */}
      <div
        className={[
          "fixed bottom-28 right-8 z-50 w-[440px] max-w-[90vw] overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#FBAA99]/20 transition-all duration-300 backdrop-blur-md",
          showChatbot
            ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
            : "pointer-events-none opacity-0 scale-95 translate-y-4",
          "origin-bottom-right",
        ].join(" ")}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#FBAA99] to-[#f68c7c] px-6 py-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <ChatbotIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pink Aura Assistant</h2>
                <p className="text-white/90 text-sm">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="rounded-xl p-2 text-white/90 transition-all duration-200 hover:bg-white/20 hover:scale-110"
              aria-label="Minimize"
            >
              <IoChevronDown className="text-2xl" />
            </button>
          </div>
          
          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Body */}
        <div
          ref={chatBodyRef}
          className="flex h-[400px] flex-col gap-4 overflow-y-auto bg-gradient-to-b from-[#FEF4F1] to-white px-6 py-5 text-[#4D423A] scrollbar-thin scrollbar-thumb-[#FBAA99]/30 scrollbar-track-transparent"
        >
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur-sm px-6 py-5 rounded-b-3xl border-t border-[#FBAA99]/10">
          <ChartForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
          <p className="text-center text-xs text-[#4D423A]/50 mt-3">
            Powered by Pink Aura Salon • Your beauty companion
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
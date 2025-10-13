import React, { useRef } from "react";
import { IoSend } from "react-icons/io5";

const ChartForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    setChatHistory((h) => [...h, { role: "user", text: userMessage }]);

    // Simulate typing delay before bot responds
    setTimeout(() => {
      setChatHistory((h) => [...h, { role: "model", text: "Thinking..." }]);
      generateBotResponse([
        ...chatHistory,
        {
          role: "user",
          text: `Using the salon details provided above, please address this query: ${userMessage}`,
        },
      ]);
    }, 600);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="relative flex items-center gap-2 bg-[#FEF4F1] p-2 rounded-full shadow-inner"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Ask something about Pink Aura Salon..."
        required
        className="w-full rounded-full border border-[#FBAA99]/50 bg-white px-4 py-2.5 text-sm text-[#4D423A] outline-none transition focus:border-[#FBAA99] focus:ring-1 focus:ring-[#FBAA99]"
      />
      <button
        type="submit"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBAA99] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#f68c7c]"
        aria-label="Send message"
      >
        <IoSend className="text-lg" />
      </button>
    </form>
  );
};

export default ChartForm;

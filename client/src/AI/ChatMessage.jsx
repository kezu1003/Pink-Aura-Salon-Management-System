import React from "react";
import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  if (chat.hideInChat) return null;

  const isBot = chat.role === "model";
  const isError = chat.isError;

  return (
    <div
      className={[
        "message flex items-start gap-3 animate-fade-in",
        isBot ? "bot-message" : "user-message flex-col items-end",
        isError ? "text-red-600" : "",
      ].join(" ")}
    >
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBAA99] to-[#f68c7c] shadow-lg">
          <ChatbotIcon />
        </div>
      )}

      <div className={[
        "message-container max-w-[85%]",
        isBot ? "" : "flex flex-col items-end"
      ].join(" ")}>
        <p
          className={[
            "message-text whitespace-pre-line break-words px-4 py-3 text-sm leading-relaxed backdrop-blur-sm",
            isBot
              ? "rounded-2xl rounded-tl-none bg-white/80 text-[#4D423A] shadow-sm border border-[#FBAA99]/10"
              : "rounded-2xl rounded-tr-none bg-gradient-to-br from-[#FBAA99] to-[#f68c7c] text-white shadow-lg",
            isError ? "!text-red-600 !bg-red-50 !border !border-red-200" : "",
          ].join(" ")}
        >
          {chat.text}
        </p>
        
        {/* Timestamp */}
        <span className={[
          "text-xs mt-1 px-2 opacity-60",
          isBot ? "text-[#4D423A]/60" : "text-[#4D423A]/60 text-right"
        ].join(" ")}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

     
    </div>
  );
};

export default ChatMessage;
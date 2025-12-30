import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const MessageBubble = ({ message }) => {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
        tabIndex={0}
        role="article"
      >
        <article
          className={`relative max-w-[92%] sm:max-w-[75%] ${
            message.type === "user"
              ? isDarkMode
                ? "bg-gradient-to-br from-[#195427] to-[#2d7a47]"
                : "bg-gradient-to-br from-[#0582CA] to-[#084062]"
              : isDarkMode
              ? "bg-gradient-to-br from-[#0b5e8e] to-[#165177]"
              : "bg-gradient-to-br from-[#93ebaf] to-[#95eec4]"
          } rounded-2xl p-4 shadow-md break-words`}
        >
          <p
            className={`${
              message.type === "user"
                ? "text-white"
                : isDarkMode
                ? "text-white"
                : "text-[#003D61]"
            } text-base leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere`}
          >
            {message.content}
          </p>

          {message.fileName && (
            <p className={`mt-2 text-xs ${isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"}`}>
              Documento asociado: <span className="font-semibold">{message.fileName}</span>
            </p>
          )}

          <div className="flex justify-between items-center mt-3">
            <button
              onClick={copyToClipboard}
              className={`${isDarkMode ? "hover:bg-[#195427]" : "hover:bg-black/10"} p-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
              }`}
              aria-label="Copiar mensaje"
            >
              <Copy size={16} className={isDarkMode ? "text-[#CCFFCE]" : "text-[#003554]"} />
            </button>

            <div
              className={`text-xs ${
                message.type === "user" ? "text-white/70" : isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"
              }`}
            >
              {message.timestamp?.toLocaleTimeString?.([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </article>
      </motion.div>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div
              className={`px-5 py-3 rounded-2xl shadow-lg text-base font-semibold backdrop-blur-md bg-opacity-90 ${
                isDarkMode ? "bg-[#195427]/90 text-[#CCFFCE]" : "bg-[#0582CA]/90 text-white"
              }`}
            >
              TEXTO COPIADO ✅
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageBubble;

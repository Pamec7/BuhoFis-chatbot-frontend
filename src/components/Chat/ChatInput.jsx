// src/components/Chat/ChatInput.jsx
import React, { useRef, useEffect, useState } from "react";
import { Send, Square } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";

const ChatInput = () => {
  const { isDarkMode } = useTheme();
  const { inputValue, setInputValue, sendMessage, isTyping, flowPath, stopStreaming } = useChat();
  const textareaRef = useRef(null);

  const isFlowActive = !!flowPath;
  const [inputError, setInputError] = useState("");

  const sanitizeInput = (text) => {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  const containsInappropriateContent = (text) => {
    const inappropriateWords = ["muerte", "no sirves", "joder", "tonto"];
    const lowerText = text.toLowerCase();
    return inappropriateWords.some((word) => lowerText.includes(word));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setInputError("");

    if (isTyping) return;

    if (isFlowActive) {
      setInputError("Estás en opciones guiadas. Usa los botones de arriba o presiona “Chat libre”.");
      return;
    }

    if (!inputValue.trim() || inputValue.length > 1000) return;

    const sanitized = sanitizeInput(inputValue);

    if (!sanitized) {
      setInputError("El contendio de tu mensaje no esta permitido. Reformúlalo.");
      return;
    }

    if (containsInappropriateContent(sanitized)) {
      setInputError("Tu mensaje contiene lenguaje no permitido. Por favor reformúlalo.");
      return;
    }

    if (sanitized !== inputValue.trim()) {
      setInputError("Tu mensaje contiene caracteres o formato no permitido. Por favor reformúlalo.");
      return;
    }

    sendMessage(sanitized);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  useEffect(() => {
    if (inputError) setInputError("");
  }, [inputValue, flowPath]);

  const showStop = isTyping;

  return (
    <div
      className={`p-4 ${
        isDarkMode ? "bg-gradient-to-r from-[#002a4a] to-[#003D61]" : "bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9]"
      } border-t ${isDarkMode ? "border-[#084062]" : "border-gray-300"} shadow-lg`}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto" aria-label="Formulario de envío de mensaje">
        <div className="flex gap-3 items-end">
          <label htmlFor="message-input" className="sr-only">
            Escribe tu pregunta aquí
          </label>

          <div className="flex-1 relative">
            <textarea
              id="message-input"
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isFlowActive
                  ? "Estás en opciones guiadas. Usa los botones de arriba o presiona “Chat libre”."
                  : "Escribe tu pregunta aquí..."
              }
              maxLength={1000}
              disabled={showStop || isFlowActive}
              className={`w-full ${
                isDarkMode ? "bg-[#001a2e] text-white placeholder-gray-400" : "bg-white text-gray-900 placeholder-gray-500"
              } border-2 ${isDarkMode ? "border-[#084062] focus:border-[#6EC971]" : "border-[#0582CA] focus:border-[#084062]"} rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 ${
                isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
              } resize-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              style={{ minHeight: "52px", maxHeight: "120px" }}
              aria-describedby="char-count message-info input-error"
            />
          </div>

          {showStop ? (
            <button
              type="button"
              onClick={stopStreaming}
              className={`${
                isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-[#003D61]"
              } p-3.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
              } shadow-lg`}
              aria-label="Detener respuesta"
            >
              <Square size={22} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isFlowActive || inputValue.trim() === "" || inputValue.length > 1000}
              className={`${
                isDarkMode
                  ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427]"
                  : "bg-gradient-to-r from-[#0582CA] to-[#084062] hover:from-[#084062] hover:to-[#0582CA]"
              } text-white p-3.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
              } shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none`}
              aria-label="Enviar mensaje"
            >
              <Send size={22} aria-hidden="true" />
            </button>
          )}
        </div>

        {inputError && (
          <p
            id="input-error"
            className={`mt-2 text-xs font-medium ${isDarkMode ? "text-red-300" : "text-red-600"}`}
            role="status"
            aria-live="polite"
          >
            {inputError}
          </p>
        )}

        <div className="flex justify-between items-center mt-2 px-1">
          <p id="message-info" className={`text-xs ${isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"}`}>
            ⚠️ Uso anónimo • Las conversaciones no se almacenan permanentemente. Al cerrar el navegador se perderá el historial.
          </p>
          <p
            id="char-count"
            className={`text-xs font-medium ${
              inputValue.length > 950 ? "text-red-500" : isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"
            }`}
          >
            {inputValue.length}/1000
          </p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;

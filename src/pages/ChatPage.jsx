import React from "react";
import BUHOALADARK from "../assets/BUHOALADARK.png";
import BUHOALALIGHT from "../assets/BUHOALALIGHT.png";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

import NavBar from "../components/common/NavBar";
import Sidebar from "../components/sidebar/Sidebar";
import MessageBubble from "../components/Chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import FlowOptionsBar from "../components/Chat/FlowOptionsBar";

import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";

const ChatPage = ({ onNavigate, onNewChat }) => {
  const { isDarkMode } = useTheme();
  const {
    messages,
    isTyping,
    startFlow,
    pickFlowOption,
    flowOptions,
    flowTitle,
    isFlowLoading,
    exitFlow,
    restartFlow,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 768);


  // SCROLL REFERS
  const scrollContainerRef = React.useRef(null);
  const messagesTopRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  const [showScrollDown, setShowScrollDown] = React.useState(false);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = React.useCallback(() => {
    messagesTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // distancia desde el final
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    // si el usuario se aleja del final, mostraR botón 
    setShowScrollDown(distanceFromBottom > 150);
  }, []);

  //  Auto-scroll
  const lastMessageContent = messages[messages.length - 1]?.content;

  React.useLayoutEffect(() => {
    
    scrollToBottom();
  }, [messages.length, isTyping, lastMessageContent, scrollToBottom]);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]"
          : "bg-gradient-to-br from-[#F1F8E9] via-[#E3F2FD] to-[#E8F5E9]"
      }`}
    >
      <NavBar currentPage="chat" onNavigate={onNavigate} />

      <div className="flex h-[calc(100vh-72px)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={onNewChat}
        />

        <main className="flex-1 flex flex-col relative" role="main">
          {/* Barra botones arriba */}
          <FlowOptionsBar
            title={flowTitle}
            options={flowOptions}
            onPick={pickFlowOption}
            isLoading={isFlowLoading}
            onExitFlow={exitFlow}
            onRestartFlow={restartFlow}
            onStartFlow={startFlow}
          />

          {/* Área de mensajes  */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 relative"
            role="log"
            aria-live="polite"
          >
            {/* Ancla para subir al inicio */}
            <div ref={messagesTopRef} />

            <div className="max-w-4xl mx-auto space-y-4 pb-32">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-start pt-12 min-h-[500px]"
                >
                  <div className="text-center mb-12 max-w-3xl">
                    <h2
                      className={`text-3xl md:text-4xl font-bold mb-4 ${
                        isDarkMode ? "text-[#6EC971]" : "text-[#195427]"
                      }`}
                    >
                      ¡Hola! Soy BuhoFIS, Tu Asistente Virtual
                      <br />
                      Estoy Aquí Para Ayudarte
                    </h2>
                    <div
                      className={`flex items-center justify-center gap-2 text-base ${
                        isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"
                      }`}
                    >
                      <span role="img" aria-label="idea" className="text-2xl">
                        💡
                      </span>
                      <p className="font-medium">
                        Puedes escribir tu pregunta directamente o usar los botones de acceso rápido.
                      </p>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-4xl px-4">
                    {[
                      { label: "Malla curricular" },
                      { label: "Trámites administrativos" },
                      { label: "Información General" },
                    ].map((item, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startFlow()}
                        className={`${
                          isDarkMode ? "bg-[#4C7A5D] hover:bg-[#195427]" : "bg-[#4C7A5D] hover:bg-[#195427]"
                        } text-white px-6 py-3 rounded-full text-base font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
                        } min-w-[200px]`}
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
               
                <>
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </AnimatePresence>

                  {isTyping && <TypingIndicator />}
                </>
              )}

              {/* Ancla para bajar al final */}
              <div ref={messagesEndRef} />
            </div>

            {/* Búho decorativo*/} <div className="fixed bottom-24 right-6 pointer-events-none z-40" aria-hidden="true" > <motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} src={isDarkMode ? BUHOALADARK : BUHOALALIGHT} alt="Búho FISWise" className="h-48 md:h-64 lg:h-72 object-contain select-none drop-shadow-2xl" draggable="false" /> </div> </div>

          {/* Botón subir al inicio */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-40 right-6 z-50 p-3 rounded-full shadow-lg transition-all
                       bg-[#084062] text-white hover:bg-[#0582CA]"
            aria-label="Ir al inicio del chat"
            type="button"
          >
            <ArrowUp size={20} />
          </button>

          {/* Botón bajar al final (solo si  subió) */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-28 right-6 z-50 p-3 rounded-full shadow-lg transition-all
                         bg-[#195427] text-white hover:bg-[#2d7a47] animate-bounce"
              aria-label="Ir al último mensaje"
              type="button"
            >
              <ArrowDown size={20} />
            </button>
          )}

          {}
          <ChatInput />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;

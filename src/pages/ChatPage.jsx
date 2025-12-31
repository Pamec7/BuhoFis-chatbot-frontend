import React from "react";
import BUHOALADARK from "../assets/BUHOALADARK.png";
import BUHOALALIGHT from "../assets/BUHOALALIGHT.png";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

import NavBar from "../components/common/NavBar";
import Sidebar from "../components/sidebar/Sidebar";

import MessageBubble from "../components/Chat/MessageBubble";
import ChatInput from "../components/Chat/ChatInput";
import TypingIndicator from "../components/Chat/TypingIndicator";
import FlowOptionsBar from "../components/Chat/FlowOptionsBar";

import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";

const ChatPage = ({ onNavigate, onNewChat }) => {
  const { isDarkMode } = useTheme();

  const {
    messages,
    isTyping,

    // flujo
    startFlow,
    pickFlowOption,
    flowOptions,
    flowTitle,
    isFlowLoading,
    exitFlow,
    restartFlow,
    backFlow,
    flowPath,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => window.innerWidth >= 768);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // SCROLL REFS
  const scrollContainerRef = React.useRef(null);
  const messagesTopRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  const [showScrollDown, setShowScrollDown] = React.useState(false);
  const [isNearBottom, setIsNearBottom] = React.useState(true);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = React.useCallback(() => {
    messagesTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setShowScrollDown(distanceFromBottom > 150);
    setIsNearBottom(distanceFromBottom < 220);
  }, []);

  const lastMessageContent = messages[messages.length - 1]?.content;

  // Auto-scroll 
  React.useLayoutEffect(() => {
    // Cuando NO hay mensajes (pantalla inicial)
    if (messages.length === 0) return;

    if (isNearBottom || isTyping) {
      scrollToBottom();
    }
  }, [messages.length, lastMessageContent, isTyping, isNearBottom, scrollToBottom]);

  const showWelcome = messages.length === 0;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-[#000000] via-[#000000] to-[#000000]"
          : "bg-gradient-to-br from-[#F1F8E9] via-[#E3F2FD] to-[#E8F5E9]"
      }`}
    >
      <NavBar
        currentPage="chat"
        onNavigate={onNavigate}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex h-[calc(100vh-72px)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((v) => !v)}
          onNewChat={onNewChat}
        />

        <main className="flex-1 flex flex-col relative" role="main">
          {/*  */}
          <FlowOptionsBar
            title={flowTitle}
            options={flowPath ? flowOptions : []} // solo muestra opciones cuando flowPath existe
            onPick={pickFlowOption}
            isLoading={isFlowLoading}
            onExitFlow={exitFlow}
            onRestartFlow={restartFlow}
            onStartFlow={startFlow} 
            onBackFlow={backFlow}
            isFlowActive={!!flowPath}
          />

          {/* Área de mensajes */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 relative"
            role="log"
            aria-live="polite"
          >
            <div ref={messagesTopRef} />

            <div className="max-w-4xl mx-auto space-y-4 pb-28">
              {showWelcome ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-start pt-10 min-h-[460px]"
                >
                  <div className="text-center mb-8 max-w-3xl">
                    <h2
                      className={`text-3xl md:text-4xl font-bold mb-4 ${
                        isDarkMode ? "text-[#6EC971]" : "text-[#195427]"
                      }`}
                    >
                      ¡Hola! Soy BuhoFIS, tu asistente virtual
                      <br />
                      Estoy aquí para ayudarte
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
                        Escribe tu pregunta o usa “Opciones guiadas” arriba.
                      </p>
                    </div>
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

              <div ref={messagesEndRef} />
            </div>

            {/* */}
            <div className="hidden md:block fixed bottom-24 right-6 pointer-events-none z-40" aria-hidden="true">
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={isDarkMode ? BUHOALADARK : BUHOALALIGHT}
                alt="Búho FISWise"
                className="h-48 md:h-64 lg:h-72 object-contain select-none drop-shadow-2xl"
                draggable="false"
              />
            </div>
          </div>

          {/* Botón subir */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-40 right-4 md:right-6 z-50 p-3 rounded-full shadow-lg transition-all bg-[#084062] text-white hover:bg-[#0582CA]"
            aria-label="Ir al inicio del chat"
            type="button"
          >
            <ArrowUp size={20} />
          </button>

          {/* Botón bajar */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-28 right-4 md:right-6 z-50 p-3 rounded-full shadow-lg transition-all bg-[#195427] text-white hover:bg-[#2d7a47] animate-bounce"
              aria-label="Ir al último mensaje"
              type="button"
            >
              <ArrowDown size={20} />
            </button>
          )}

          <ChatInput />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;

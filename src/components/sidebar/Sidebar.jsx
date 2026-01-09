import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";

const Sidebar = ({ isOpen, onToggle, onNewChat }) => {
  const { isDarkMode } = useTheme();
  const { chatHistory, switchChat, activeChat, deleteChat, clearAllChats } = useChat();

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    const ok = window.confirm("¿Eliminar esta conversación?");
    if (!ok) return;
    deleteChat(chatId);
  };

  const handleClearAll = () => {
    const ok = window.confirm("¿Borrar todo el historial? Esto no se puede deshacer.");
    if (!ok) return;
    clearAllChats();
    if (window.innerWidth < 768) onToggle();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />

          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={`fixed md:static left-0 top-[72px] md:top-0 z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto w-72 md:w-64 p-4 shadow-lg overflow-y-auto flex flex-col ${
              isDarkMode ? "bg-gradient-to-b from-[#003D61] to-[#084062]" : "bg-gradient-to-b from-[#003D61] to-[#084062]"
            }`}
            aria-label="Historial de conversaciones"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
              <h2 className="text-white text-base font-semibold">Historial</h2>

              <button
                onClick={onToggle}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Cerrar historial"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <button
              onClick={() => {
                onNewChat?.();
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 mb-3 transition-all focus:outline-none focus:ring-2 focus:ring-white shadow-md"
              type="button"
            >
              <Plus size={20} aria-hidden="true" />
              <span className="font-medium">Nuevo Chat</span>
            </button>

            <button
              onClick={handleClearAll}
              className="w-full bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-white"
              type="button"
            >
              <Trash2 size={18} aria-hidden="true" />
              <span className="text-sm font-medium">Borrar todo</span>
            </button>

            <nav aria-label="Lista de conversaciones" className="flex-1 overflow-y-auto">
              <div className="space-y-2" role="list">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      switchChat(chat.id);
                      if (window.innerWidth < 768) onToggle();
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg cursor-pointer transition-all text-white focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-between gap-3 ${
                      chat.id === activeChat ? "bg-[#39617a]" : "bg-white/5 hover:bg-white/10"
                    }`}
                    type="button"
                  >
                    <p className="text-sm font-medium truncate flex-1">{chat.name}</p>

                    <span
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-all"
                      role="button"
                      aria-label="Eliminar conversación"
                      tabIndex={0}
                    >
                      <Trash2 size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;

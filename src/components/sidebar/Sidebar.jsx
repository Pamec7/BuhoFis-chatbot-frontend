import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";

const Sidebar = ({ isOpen, onToggle, onNewChat }) => {
  const { isDarkMode } = useTheme();
  const { chatHistory, switchChat, activeChat } = useChat();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ✅ Overlay solo en móvil */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />

          {/* ✅ Drawer / Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={`fixed md:static left-0 top-[72px] md:top-0 z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto w-72 md:w-64 p-4 shadow-lg overflow-y-auto flex flex-col ${
              isDarkMode
                ? "bg-gradient-to-b from-[#003D61] to-[#084062]"
                : "bg-gradient-to-b from-[#003D61] to-[#084062]"
            }`}
            aria-label="Historial de conversaciones"
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
              <h2 className="text-white text-base font-semibold">Historial</h2>

              {/* Botón cerrar solo en móvil */}
              <button
                onClick={onToggle}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Cerrar historial"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nuevo Chat */}
            <button
              onClick={() => {
                onNewChat?.();
                // en móvil cerramos drawer al crear chat
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-white shadow-md"
              type="button"
            >
              <Plus size={20} aria-hidden="true" />
              <span className="font-medium">Nuevo Chat</span>
            </button>

            {/* Lista */}
            <nav aria-label="Lista de conversaciones" className="flex-1 overflow-y-auto">
              <div className="space-y-2" role="list">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      switchChat(chat.id);
                      // en móvil cerramos drawer al seleccionar chat
                      if (window.innerWidth < 768) onToggle();
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg cursor-pointer transition-all text-white focus:outline-none focus:ring-2 focus:ring-white ${
                      chat.id === activeChat ? "bg-[#39617a]" : "bg-white/5 hover:bg-white/10"
                    }`}
                    type="button"
                  >
                    <p className="text-sm font-medium truncate">{chat.name}</p>
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

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';

const Sidebar = ({ isOpen, onToggle, onNewChat }) => {
  const { isDarkMode } = useTheme();
  const { chatHistory, switchChat, activeChat } = useChat();

  return (
    <AnimatePresence>
    {!isOpen && (
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        exit={{ x: -100 }}
        className={`fixed left-0  z-50 ${isDarkMode ? 'bg-[#003D61]' : 'bg-[#003D61]'} shadow-xl overflow-hidden h-full flex flex-col items-center justify-start`}
      
      >
        <div className="flex flex-col">
          {/* Botón para abrir sidebar */}
          <button
            onClick={onToggle}
            className={`text-white p-3 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white border-b ${isDarkMode ? 'border-[#084062]' : 'border-[#003D61]'}`}
            aria-label="Mostrar historial"
            title="Mostrar historial"
          >
            <ChevronRight size={22} />
          </button>
          
          {/* Botón Nuevo Chat */}
          <button
            onClick={onNewChat}
            className="text-white p-3 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Crear nueva conversación"
            title="Nuevo chat"
          >
            <Plus size={22} />
          </button>
        </div>
      </motion.div>
    )}

  {isOpen && (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className={`w-64 ${isDarkMode ? 'bg-gradient-to-b from-[#003D61] to-[#084062]' : 'bg-gradient-to-b from-[#003D61] to-[#084062]'} p-4 shadow-lg overflow-y-auto flex flex-col h-full`}
      aria-label="Historial de conversaciones"
    >
    {/* Encabezado  */}
          <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
            <button
              onClick={onToggle}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Ocultar historial"
              title="Ocultar historial"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

      {/* Botón Nuevo Chat */}
      <button
        onClick={onNewChat}
        className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427]' : 'bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427]'} text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-white shadow-md`}
        aria-label="Crear nueva conversación"
      >
        <Plus size={20} aria-hidden="true" />
        <span className="font-medium">Nuevo Chat</span>
      </button>

      {/* Título del Sidebar */}
      <h2 className="text-white text-lg font-thin mb-3 px-2">Historial de Chat</h2>
      
      {/* Lista de conversaciones */}
      <nav aria-label="Lista de conversaciones" className="flex-1 overflow-y-auto">
        <div className="space-y-2" role="list">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`w-full text-left ${
                chat.id === activeChat 
                  ? (isDarkMode ? 'bg-[#39617a]' : 'bg-[#39617a]') 
                  : 'bg-white/5 hover:bg-white/10'
              } px-3 py-3 rounded-lg cursor-pointer transition-all text-white focus:outline-none focus:ring-2 focus:ring-white group`}
              aria-label={`Cambiar a conversación: ${chat.name}`}
            >
              <p className="text-sm font-medium truncate">{chat.name}</p>
              
            </button>
          ))}
        </div>
      </nav>

    </motion.aside>
  )}
  </AnimatePresence>
  );
};

export default Sidebar;
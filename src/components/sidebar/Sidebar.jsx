// src/components/sidebar/Sidebar.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";
import ConfirmDialog from "../common/ConfirmDialog";

const Sidebar = ({
  isMobileOpen,
  onToggleMobile,
  isDesktopCollapsed,
  onToggleDesktopCollapsed,
  onNewChat,
}) => {
  const { isDarkMode } = useTheme();
  const { chatHistory, switchChat, activeChat, deleteChat, clearAllChats } = useChat();

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmData, setConfirmData] = React.useState({
    action: null,
    chatId: null,
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    variant: "danger",
  });

  const openDeleteChatConfirm = (chatId) => {
    setConfirmData({
      action: "deleteChat",
      chatId,
      title: "Eliminar conversación",
      message: "¿Deseas eliminar esta conversación? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    setConfirmOpen(true);
  };

  const openClearAllConfirm = () => {
    setConfirmData({
      action: "clearAll",
      chatId: null,
      title: "Borrar historial",
      message: "¿Deseas borrar todo el historial? Esta acción no se puede deshacer.",
      confirmText: "Borrar todo",
      cancelText: "Cancelar",
      variant: "danger",
    });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirm = () => {
    const { action, chatId } = confirmData;

    if (action === "deleteChat" && chatId != null) deleteChat(chatId);
    if (action === "clearAll") {
      clearAllChats();
      if (window.innerWidth < 768) onToggleMobile?.();
    }

    setConfirmOpen(false);
  };

  const baseBg = isDarkMode
    ? "bg-gradient-to-b from-[#003D61] to-[#084062]"
    : "bg-gradient-to-b from-[#003D61] to-[#084062]";

  return (
    <>
      <aside
        className={`hidden md:flex flex-col h-[calc(100vh-72px)] shrink-0 border-r border-white/10 ${baseBg} ${
          isDesktopCollapsed ? "w-16" : "w-72"
        } transition-all duration-200`}
        aria-label="Historial de conversaciones"
      >
        <div className={`flex items-center ${isDesktopCollapsed ? "justify-center" : "justify-between"} p-3`}>
          {!isDesktopCollapsed && <h2 className="text-white text-base font-semibold">Historial</h2>}
          <button
            onClick={onToggleDesktopCollapsed}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isDesktopCollapsed ? "Abrir historial" : "Colapsar historial"}
            type="button"
            title={isDesktopCollapsed ? "Abrir historial" : "Colapsar historial"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <div className={`${isDesktopCollapsed ? "px-2" : "px-3"} pb-2`}>
          <button
            onClick={() => onNewChat?.()}
            className={`w-full bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427] text-white ${
              isDesktopCollapsed ? "px-0 py-3 justify-center" : "px-4 py-3 justify-center gap-2"
            } rounded-lg flex items-center transition-all focus:outline-none focus:ring-2 focus:ring-white shadow-md`}
            type="button"
            title="Nuevo chat"
          >
            <Plus size={20} aria-hidden="true" />
            {!isDesktopCollapsed && <span className="font-medium">Nuevo Chat</span>}
          </button>
        </div>

        {!isDesktopCollapsed && (
          <div className="px-3 pb-3">
            <button
              onClick={openClearAllConfirm}
              className="w-full bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-white"
              type="button"
            >
              <Trash2 size={18} aria-hidden="true" />
              <span className="text-sm font-medium">Borrar todo</span>
            </button>
          </div>
        )}

        {!isDesktopCollapsed && (
          <nav aria-label="Lista de conversaciones" className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="space-y-2" role="list">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => switchChat(chat.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg cursor-pointer transition-all text-white focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-between gap-3 ${
                    chat.id === activeChat ? "bg-[#39617a]" : "bg-white/5 hover:bg-white/10"
                  }`}
                  type="button"
                >
                  <p className="text-sm font-medium truncate flex-1">{chat.name}</p>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteChatConfirm(chat.id);
                    }}
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
        )}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleMobile}
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className={`fixed left-0 top-[72px] z-50 h-[calc(100vh-72px)] w-72 p-4 shadow-lg overflow-y-auto flex flex-col ${baseBg}`}
              aria-label="Historial de conversaciones"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
                <h2 className="text-white text-base font-semibold">Historial</h2>
                <button
                  onClick={onToggleMobile}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Cerrar historial"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              <button
                onClick={() => {
                  onNewChat?.();
                  onToggleMobile?.();
                }}
                className="w-full bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 mb-3 transition-all focus:outline-none focus:ring-2 focus:ring-white shadow-md"
                type="button"
              >
                <Plus size={20} aria-hidden="true" />
                <span className="font-medium">Nuevo Chat</span>
              </button>

              <button
                onClick={openClearAllConfirm}
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
                        onToggleMobile?.();
                      }}
                      className={`w-full text-left px-3 py-3 rounded-lg cursor-pointer transition-all text-white focus:outline-none focus:ring-2 focus:ring-white flex items-center justify-between gap-3 ${
                        chat.id === activeChat ? "bg-[#39617a]" : "bg-white/5 hover:bg-white/10"
                      }`}
                      type="button"
                    >
                      <p className="text-sm font-medium truncate flex-1">{chat.name}</p>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteChatConfirm(chat.id);
                        }}
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

      <ConfirmDialog
        open={confirmOpen}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        cancelText={confirmData.cancelText}
        variant={confirmData.variant}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default Sidebar;

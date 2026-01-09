import React from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import logo from "../../assets/BUHOLOGO.png";
import { useTheme } from "../../context/ThemeContext";

const NavBar = ({ currentPage, onNavigate, onToggleSidebar, isSidebarOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav
      className={`${isDarkMode ? "bg-[#002a4a]" : "bg-[#003554]"} px-4 md:px-6 py-4 flex items-center justify-between shadow-lg`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center gap-3">
        {/* ✅ Botón hamburguesa: solo en chat y solo en móvil */}
        {currentPage === "chat" && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white rounded p-2"
            aria-label={isSidebarOpen ? "Cerrar historial" : "Abrir historial"}
            type="button"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        <div
          className={`w-10 h-10 ${isDarkMode ? "bg-[#ffffff]" : "bg-[#f5f5f6]"} rounded-full flex items-center justify-center overflow-hidden`}
          aria-hidden="true"
        >
          <img src={logo} alt="BuhoFis logo" className="w-14 h-14 object-contain" />
        </div>
        <span className="text-white font-bold text-lg md:text-xl">BUHOCHAT</span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={() => onNavigate("landing")}
          className={`${currentPage === "landing" ? "text-white border-b-2 border-white" : "text-[#60bdf3]"} hover:text-white transition-colors font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white rounded`}
          type="button"
        >
          INICIO
        </button>

        <button
          onClick={() => onNavigate("chat")}
          className={`${currentPage === "chat" || currentPage === "home" ? "text-white border-b-2 border-white" : "text-[#60bdf3]"} hover:text-white transition-colors font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white rounded`}
          type="button"
        >
          CHAT
        </button>

        <button
          onClick={toggleTheme}
          className="text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white rounded p-2"
          aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          type="button"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;

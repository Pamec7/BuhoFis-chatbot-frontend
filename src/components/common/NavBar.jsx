import React from 'react';
import { Moon, Sun } from 'lucide-react';
import logo from '../../assets/BUHOLOGO.png';
import { useTheme } from '../../context/ThemeContext';

const NavBar = ({ currentPage, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav 
      className={`${isDarkMode ? 'bg-[#002a4a]' : 'bg-[#003554]'} px-6 py-4 flex items-center justify-between shadow-lg`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffffff]' : 'bg-[#f5f5f6]'} rounded-full flex items-center justify-center overflow-hidden`}
          aria-hidden="true"
        >
          <img src={logo} alt="FISWise logo" className="w-14 h-14 object-contain" />
        </div>
        <span className="text-white font-bold text-xl">BuhoFIS</span>
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className={`${currentPage === 'landing' ? 'text-white border-b-2 border-white' : 'text-[#60bdf3]'} hover:text-white transition-colors font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white rounded`}
        >
          INICIO
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className={`${currentPage === 'chat' || currentPage === 'home' ? 'text-white border-b-2 border-white' : 'text-[#60bdf3]'} hover:text-white transition-colors font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white rounded`}
        >
          CHAT
        </button>
        
        <button
          onClick={toggleTheme}
          className="text-white hover:opacity-80 transition-opacity ml-4 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
          aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
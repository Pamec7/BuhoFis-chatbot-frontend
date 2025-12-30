import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const TypingIndicator = () => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#003D61] to-[#084062]' : 'bg-gradient-to-br from-[#B3E5FC] to-[#E3F2FD]'} rounded-2xl p-4 shadow-lg`}>
        <div className="flex gap-1">
          <div 
            className={`w-2 h-2 ${isDarkMode ? 'bg-[#6EC971]' : 'bg-[#0582CA]'} rounded-full animate-bounce`} 
            style={{ animationDelay: '0ms' }}
          ></div>
          <div 
            className={`w-2 h-2 ${isDarkMode ? 'bg-[#6EC971]' : 'bg-[#0582CA]'} rounded-full animate-bounce`} 
            style={{ animationDelay: '150ms' }}
          ></div>
          <div 
            className={`w-2 h-2 ${isDarkMode ? 'bg-[#6EC971]' : 'bg-[#0582CA]'} rounded-full animate-bounce`} 
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
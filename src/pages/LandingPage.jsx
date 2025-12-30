import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, ClipboardList, Info } from 'lucide-react';
import NavBar from '../components/common/NavBar';
import buhoLight from '../assets/BUHOLOGO.png';
import buhoDark from '../assets/BUHOLOGODARK.png';
import { useTheme } from '../context/ThemeContext';

const LandingPage = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      icon: <BookOpen/>,
      title: 'Consultas Académicas',
      desc: 'Pregunta sobre malla curricular, contenido de materias, prerrequisitos, profesores de una materia, periodo y más.'
    },
    {
      icon: <ClipboardList/>,
      title: 'Consultas Administrativas',
      desc: 'Consulta sobre inscripciones, trámites, requisitos para solicitudes, documentos certificados y más.'
    },
    {
      icon: <Info/>,
      title: 'Información General',
      desc: 'Averigua Sobre Horarios de Atención, Ubicación de Oficinas, contactos del coordinador, laboratorios y más.'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-[#001a2e] via-[#000000] to-[#003554]' : 'bg-gradient-to-br from-[#E8F5E9] via-[#ffffff] to-[#ffffff]'}`}>
      <NavBar currentPage="landing" onNavigate={onNavigate} />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-6"
        role="main"
      >
  <div className="max-w-4xl mx-auto text-center mb-12 relative md:pr-40 lg:pr-48">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative"
          >
          </motion.div>
          
          <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#003D61]'}`}>
            ¡Bienvenido al <span className={isDarkMode ? 'text-[#6EC971]' : 'text-[#0582ca87]'}>Asistente Virtual</span>
          </h1>
          <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? 'text-[#B3E5FC]' : 'text-[#084062]'}`}>
            de Ingeniería en Software y Computación!
          </h2>
          <p className={`text-base ${isDarkMode ? 'text-[#B3E5FC]' : 'text-[#003554]'} mb-8 max-w-2xl mx-auto`}>
            Soy tu guía inteligente para consultas académicas, administrativas y todo lo relacionado con la carrera ISC - EPN
          </p>
          <img
            src={isDarkMode ? buhoDark : buhoLight}
            alt="Búho"
            className="hidden md:block absolute right-[-60px] top-1/2 transform -translate-y-1/2 md:w-72 lg:w-72"
            style={{ pointerEvents: 'none' }}
          />
          <button
            onClick={() => onNavigate('chat')}
            className={`${isDarkMode ? 'bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427]' : 'bg-gradient-to-r from-[#084062] to-[#0582CA] hover:from-[#0582CA] hover:to-[#084062]'} text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-[#6EC971]' : 'focus:ring-[#0582CA]'} mb-12 md:mb-16`}
            aria-label="Iniciar conversación con el asistente virtual"
          >
            ¡EMPEZAR CONVERSACIÓN!
          </button>
          <div className="h-8 md:h-5"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16" role="list">
          {features.map((item, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${isDarkMode ? 'bg-gradient-to-br from-[#003D61] to-[#084062]' : 'bg-gradient-to-br from-[#084062] to-[#083f62]'} pt-16 pb-6 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center text-center relative overflow-visible`}
              role="listitem"
            >
              <div
                aria-hidden="true"
                className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full md:w-32 md:h-32 w-16 h-16 ${isDarkMode ? 'bg-[#CCFFCE] text-[#003D61]' : 'bg-[#0E575B] text-white'} shadow-lg border-4 border-white`}
                style={{ zIndex: 2 }}
              >
                {React.cloneElement(item.icon, { size: 58, className: `${isDarkMode ? 'text-[#003D61]' : 'text-white'}` })}
              </div>
              <h3 className="text-white font-bold text-xl mb-3 mt-8">{item.title}</h3>
              <p className={`${isDarkMode ? 'text-[#E1F5FE]' : 'text-white/90'} text-sm`}>{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </motion.main>
    </div>
  );
};

export default LandingPage;
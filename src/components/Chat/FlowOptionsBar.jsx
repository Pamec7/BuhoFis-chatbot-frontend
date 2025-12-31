import React from "react";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const FlowOptionsBar = ({
  title,
  options,
  onPick,
  isLoading,
  onExitFlow,
  onRestartFlow,
  onStartFlow,
  onBackFlow,
  isFlowActive,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isDarkMode ? "bg-[#001a2e]/90 border-[#084062]" : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex flex-col">
            <p className={`text-sm font-semibold ${isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"}`}>
              {title || "Opciones guiadas"}
            </p>
            <p className={`text-xs ${isDarkMode ? "text-white/70" : "text-black/50"}`}>
              {isFlowActive ? "Modo flujo" : "Permite resolver consultas mediante decisiones estructuradas"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className={`text-xs ${isDarkMode ? "text-[#6EC971]" : "text-[#084062]"} flex items-center gap-2`}>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current" />
                Procesando...
              </div>
            )}

            {!isFlowActive ? (
              <button
                type="button"
                onClick={onStartFlow}
                disabled={isLoading}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  isDarkMode
                    ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] text-white hover:from-[#2d7a47] hover:to-[#195427] disabled:opacity-50"
                    : "bg-gradient-to-r from-[#084062] to-[#0582CA] text-white hover:from-[#0582CA] hover:to-[#084062] disabled:opacity-50"
                } shadow`}
              >
                Opciones guiadas
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onBackFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                      : "bg-black/10 text-[#003D61] hover:bg-black/20 disabled:opacity-50"
                  }`}
                  aria-label="Volver a la opción anterior"
                  title="Atrás"
                >
                  <ArrowLeft size={14} />
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={onRestartFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    isDarkMode
                      ? "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                      : "bg-black/10 text-[#003D61] hover:bg-black/20 disabled:opacity-50"
                  }`}
                >
                  Reiniciar
                </button>

                <button
                  type="button"
                  onClick={onExitFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    isDarkMode
                      ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] text-white hover:from-[#2d7a47] hover:to-[#195427] disabled:opacity-50"
                      : "bg-gradient-to-r from-[#084062] to-[#0582CA] text-white hover:from-[#0582CA] hover:to-[#084062] disabled:opacity-50"
                  } shadow`}
                >
                  Chat libre
                </button>
              </>
            )}
          </div>
        </div>

        {isFlowActive && Array.isArray(options) && options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPick(opt.id, opt.label)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isDarkMode
                    ? "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    : "bg-black/10 text-[#003D61] hover:bg-black/20 disabled:opacity-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowOptionsBar;

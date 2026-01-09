import React from "react";
import { ArrowLeft, RotateCcw, X } from "lucide-react";
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

  const containerClass = isDarkMode
    ? "bg-[#001a2e]/90 border-[#084062]"
    : "bg-white/90 border-gray-200";

  const titleClass = isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]";
  const subtitleClass = isDarkMode ? "text-white/70" : "text-black/50";

  const primaryBtn = isDarkMode
    ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] text-white hover:from-[#2d7a47] hover:to-[#195427] disabled:opacity-50"
    : "bg-gradient-to-r from-[#084062] to-[#0582CA] text-white hover:from-[#0582CA] hover:to-[#084062] disabled:opacity-50";

  const navBtn = isDarkMode
    ? "bg-gradient-to-r from-[#0b5e8e] to-[#165177] text-white hover:from-[#0e6aa0] hover:to-[#1b5f86] disabled:opacity-50 shadow-md border border-white/10"
    : "bg-[#003554] text-white hover:bg-[#084062] disabled:opacity-50";

  const optionChip = isDarkMode
    ? "bg-[#111827] border border-[#6b7280] text-[#e5e7eb] hover:bg-[#1f2937] disabled:opacity-50"
    : "bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 disabled:opacity-50";

  return (
    <div className={`sticky top-0 z-40 border-b backdrop-blur-md ${containerClass}`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex flex-col">
            <p className={`text-sm font-semibold ${titleClass}`}>{title || "Opciones guiadas"}</p>
            <p className={`text-xs ${subtitleClass}`}>
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
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${primaryBtn} shadow`}
              >
                Opciones guiadas
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBackFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${navBtn}`}
                  aria-label="Volver a la opción anterior"
                >
                  <ArrowLeft size={14} />
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={onRestartFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${navBtn}`}
                  aria-label="Reiniciar flujo"
                >
                  <RotateCcw size={14} />
                  Reiniciar
                </button>

                <button
                  type="button"
                  onClick={onExitFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${primaryBtn} shadow`}
                  aria-label="Salir a chat libre"
                >
                  <X size={14} />
                  Chat libre
                </button>
              </div>
            )}
          </div>
        </div>

        {isFlowActive && Array.isArray(options) && options.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPick(opt.id, opt.label)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${optionChip}`}
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

import React from "react";
import { useTheme } from "../../context/ThemeContext";

const FlowOptionsBar = ({
  title,
  options,
  onPick,
  isLoading,
  onExitFlow,
  onRestartFlow,
  onStartFlow, // 👈 NUEVO
}) => {
  const { isDarkMode } = useTheme();

  const hasOptions = Array.isArray(options) && options.length > 0;

  return (
    <div
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isDarkMode
          ? "bg-[#001a2e]/90 border-[#084062]"
          : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex flex-col">
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"
              }`}
            >
              {title || "Opciones guiadas"}
            </p>

            <p className={`text-xs ${isDarkMode ? "text-white/70" : "text-black/50"}`}>
              {hasOptions ? "Modo flujo: elige una opción" : "Modo chat libre (puedes activar el flujo cuando quieras)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div
                className={`text-xs ${
                  isDarkMode ? "text-[#6EC971]" : "text-[#084062]"
                } flex items-center gap-2`}
              >
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current"></span>
                Procesando...
              </div>
            )}

            {!hasOptions ? (
              <button
                onClick={onStartFlow}
                disabled={isLoading}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  isDarkMode
                    ? "bg-[#195427] text-white hover:bg-[#2d7a47] disabled:opacity-50"
                    : "bg-[#084062] text-white hover:bg-[#0582CA] disabled:opacity-50"
                }`}
                type="button"
              >
                Entrar a opciones guiadas
              </button>
            ) : (
              <>
                <button
                  onClick={onRestartFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    isDarkMode
                      ? "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                      : "bg-black/10 text-[#003D61] hover:bg-black/20 disabled:opacity-50"
                  }`}
                  type="button"
                >
                  Reiniciar
                </button>

                <button
                  onClick={onExitFlow}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                    isDarkMode
                      ? "bg-[#195427] text-white hover:bg-[#2d7a47] disabled:opacity-50"
                      : "bg-[#084062] text-white hover:bg-[#0582CA] disabled:opacity-50"
                  }`}
                  type="button"
                >
                  Chat libre
                </button>
              </>
            )}
          </div>
        </div>

        {/* Opciones: SOLO cuando existan */}
        {hasOptions && (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onPick(opt.id, opt.label)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isDarkMode
                    ? "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    : "bg-black/10 text-[#003D61] hover:bg-black/20 disabled:opacity-50"
                }`}
                type="button"
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

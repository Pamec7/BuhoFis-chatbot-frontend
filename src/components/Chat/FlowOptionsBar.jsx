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
  flowDepth = 0,
  backendMode = "unknown",
}) => {
  const { isDarkMode } = useTheme();

  const containerClass = isDarkMode
    ? "bg-gradient-to-r from-[#001322]/95 to-[#002a4a]/95 border-[#0b5e8e] shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
    : "bg-white/95 border-[#0582CA]/25 shadow-[0_10px_22px_rgba(0,0,0,0.12)]";

  const titleClass = isDarkMode ? "text-white" : "text-[#003554]";
  const subtitleClass = isDarkMode ? "text-white/75" : "text-[#003554]/75";

  const btnBase =
    "px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 border";

  const ringClass = isDarkMode
    ? "focus:ring-[#B3E5FC] focus:ring-offset-[#001322]"
    : "focus:ring-[#0582CA] focus:ring-offset-white";

  const greenBtn = isDarkMode
    ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] text-white hover:from-[#2d7a47] hover:to-[#195427] border-white/10"
    : "bg-gradient-to-r from-[#195427] to-[#2d7a47] text-white hover:from-[#2d7a47] hover:to-[#195427] border-[#195427]/10";

  const optionChip = isDarkMode
    ? "bg-[#CCFFCE] text-[#001a2e] hover:bg-[#B3E5FC] border border-white/10 shadow-[0_10px_18px_rgba(0,0,0,0.28)] disabled:opacity-50"
    : "bg-white text-[#003554] hover:bg-[#E3F2FD] border border-[#0582CA]/45 shadow-[0_10px_18px_rgba(0,0,0,0.10)] disabled:opacity-50";

  const statusBadgeBase = "text-[11px] px-2.5 py-1 rounded-full border flex items-center gap-2 shadow-sm";
  const statusBadge = isDarkMode
    ? backendMode === "online"
      ? `${statusBadgeBase} bg-[#195427]/30 text-[#CCFFCE] border-white/10`
      : backendMode === "offline"
      ? `${statusBadgeBase} bg-red-500/20 text-red-100 border-red-400/30`
      : `${statusBadgeBase} bg-white/10 text-white/90 border-white/10`
    : backendMode === "online"
    ? `${statusBadgeBase} bg-green-50 text-green-800 border-green-200`
    : backendMode === "offline"
    ? `${statusBadgeBase} bg-red-50 text-red-700 border-red-200`
    : `${statusBadgeBase} bg-gray-50 text-gray-700 border-gray-200`;

  const statusText =
    backendMode === "online" ? "Conectado" : backendMode === "offline" ? "Sin conexión" : "Verificando";

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
            <div className={statusBadge} title="Estado del backend">
              <span className="inline-block w-2 h-2 rounded-full bg-current" />
              {statusText}
            </div>

            {isLoading && (
              <div className={`text-xs ${isDarkMode ? "text-[#B3E5FC]" : "text-[#084062]"} flex items-center gap-2`}>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse bg-current" />
                Procesando...
              </div>
            )}

            {!isFlowActive ? (
              <button type="button" onClick={onStartFlow} disabled={isLoading} className={`${btnBase} ${greenBtn} ${ringClass}`}>
                Opciones guiadas
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {flowDepth > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={onBackFlow}
                      disabled={isLoading}
                      className={`${btnBase} ${greenBtn} ${ringClass} inline-flex items-center gap-2`}
                      aria-label="Volver a la opción anterior"
                    >
                      <ArrowLeft size={14} />
                      Atrás
                    </button>

                    <button
                      type="button"
                      onClick={onRestartFlow}
                      disabled={isLoading}
                      className={`${btnBase} ${greenBtn} ${ringClass} inline-flex items-center gap-2`}
                      aria-label="Reiniciar flujo"
                    >
                      <RotateCcw size={14} />
                      Reiniciar
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={onExitFlow}
                  disabled={isLoading}
                  className={`${btnBase} ${greenBtn} ${ringClass} inline-flex items-center gap-2`}
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
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${optionChip}`}
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

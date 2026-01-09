import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, AlertTriangle, AlertCircle, XCircle, Info, ExternalLink } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const badgeStyle = (variant, isDarkMode) => {
  if (variant === "error") {
    return isDarkMode
      ? "bg-red-500/15 text-red-200 border border-red-500/30"
      : "bg-red-50 text-red-800 border border-red-200";
  }
  if (variant === "warning") {
    return isDarkMode
      ? "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30"
      : "bg-[#E3F2FD] text-[#003554] border border-[#0582CA]/25";
  }
  if (variant === "info") {
    return isDarkMode
      ? "bg-blue-500/15 text-blue-200 border border-blue-500/30"
      : "bg-blue-50 text-blue-800 border border-blue-200";
  }
  return "";
};

const iconForVariant = (variant) => {
  if (variant === "error") return XCircle;
  if (variant === "warning") return AlertCircle;
  if (variant === "info") return Info;
  return null;
};

const MessageBubble = ({ message }) => {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeFileName =
    typeof message.fileName === "string" && message.fileName.trim().length > 0
      ? message.fileName.trim()
      : null;

  const sources = Array.isArray(message.sources) ? message.sources : [];
  const showFileMissing = message.type !== "user" && message.fileMissing && !safeFileName;

  const isAlert =
    message.type !== "user" &&
    (message.variant === "error" || message.variant === "warning" || message.variant === "info");

  const AlertIcon = isAlert ? iconForVariant(message.variant) : null;

  const bubbleClass =
    message.type === "user"
      ? isDarkMode
        ? "bg-gradient-to-br from-[#195427] to-[#2d7a47]"
        : "bg-gradient-to-br from-[#0582CA] to-[#084062]"
      : isAlert
      ? badgeStyle(message.variant, isDarkMode)
      : isDarkMode
      ? "bg-gradient-to-br from-[#0b5e8e] to-[#165177]"
      : "bg-gradient-to-br from-[#93ebaf] to-[#95eec4]";

  const textClass =
    message.type === "user"
      ? "text-white"
      : isAlert
      ? ""
      : isDarkMode
      ? "text-white"
      : "text-[#003D61]";

  const docMissingClass = isDarkMode
    ? "bg-yellow-500/10 text-yellow-200 border border-yellow-500/20"
    : "bg-white/60 text-[#003554] border border-black/10";

  const docMissingIconClass = isDarkMode ? "text-yellow-200" : "text-[#0582CA]";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
        tabIndex={0}
        role="article"
      >
        <article className={`relative max-w-[92%] sm:max-w-[75%] rounded-2xl p-4 shadow-md break-words ${bubbleClass}`}>
          {isAlert && (
            <div className="flex items-start gap-2 mb-2">
              {AlertIcon ? <AlertIcon size={18} className="mt-0.5" /> : null}
              <div className="flex-1">{message.title ? <p className="text-sm font-semibold">{message.title}</p> : null}</div>
            </div>
          )}

          <p className={`${textClass} text-base leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere`}>
            {message.content}
          </p>

          {message.detail ? (
            <p className={`mt-2 text-xs ${isAlert ? "opacity-80" : isDarkMode ? "text-white/70" : "text-black/60"}`}>
              Detalle: {message.detail}
            </p>
          ) : null}

          {safeFileName && (
            <p className={`mt-2 text-xs ${isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"}`}>
              Documento asociado: <span className="font-semibold">{safeFileName}</span>
            </p>
          )}

          {showFileMissing && (
            <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${docMissingClass}`} role="status" aria-live="polite">
              <AlertTriangle size={16} className={`mt-0.5 ${docMissingIconClass}`} />
              <div className="text-xs leading-snug">
                <p className="font-semibold">Documento no disponible</p>
                <p>El backend no envió el archivo asociado. Puede que aún no esté subido o hubo un error de conexión.</p>
              </div>
            </div>
          )}

          {message.type !== "user" && sources.length > 0 && (
            <div className={`mt-3 rounded-xl p-3 ${isDarkMode ? "bg-white/10" : "bg-black/5"}`}>
              <p className={`text-xs font-semibold ${isDarkMode ? "text-[#B3E5FC]" : "text-[#003554]"}`}>
                Fuentes / Documentos:
              </p>

              <ul className="mt-2 space-y-1">
                {sources.slice(0, 6).map((s, idx) => {
                  const label = s.file_name || s.file_id || `Fuente ${idx + 1}`;
                  const extra = s.page ? ` (p. ${s.page})` : "";
                  return (
                    <li key={`${label}-${idx}`} className="flex items-center justify-between gap-2">
                      <span className={`text-xs ${isDarkMode ? "text-white/90" : "text-[#003D61]"}`}>
                        {label}
                        {extra}
                      </span>

                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs flex items-center gap-1 ${
                            isDarkMode ? "text-[#CCFFCE]" : "text-[#084062]"
                          } hover:underline`}
                        >
                          Abrir <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              {sources.length > 6 && (
                <p className={`mt-2 text-[11px] ${isDarkMode ? "text-white/60" : "text-black/50"}`}>
                  +{sources.length - 6} fuentes más
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <button
              onClick={copyToClipboard}
              className={`${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/10"} p-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                isDarkMode ? "focus:ring-[#6EC971]" : "focus:ring-[#0582CA]"
              }`}
              aria-label="Copiar mensaje"
              type="button"
            >
              <Copy size={16} className={isDarkMode ? "text-[#CCFFCE]" : "text-[#003554]"} />
            </button>

            <div className={`text-xs ${message.type === "user" ? "text-white/70" : isDarkMode ? "text-white/70" : "text-black/60"}`}>
              {message.timestamp?.toLocaleTimeString?.([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </article>
      </motion.div>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div
              className={`px-5 py-3 rounded-2xl shadow-lg text-base font-semibold backdrop-blur-md bg-opacity-90 ${
                isDarkMode ? "bg-[#195427]/90 text-[#CCFFCE]" : "bg-[#0582CA]/90 text-white"
              }`}
            >
              TEXTO COPIADO ✅
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageBubble;

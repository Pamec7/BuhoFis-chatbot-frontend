import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "danger",
}) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, onConfirm]);

  const panelClass = isDarkMode
    ? "bg-[#001a2e] border border-white/10"
    : "bg-white border border-black/10";

  const titleClass = isDarkMode ? "text-white" : "text-[#003554]";
  const msgClass = isDarkMode ? "text-white/70" : "text-black/60";

  const dangerBtn = isDarkMode
    ? "bg-gradient-to-r from-[#7a1f1f] to-[#b02a2a] hover:from-[#b02a2a] hover:to-[#7a1f1f]"
    : "bg-gradient-to-r from-[#d11a2a] to-[#a50f1e] hover:from-[#a50f1e] hover:to-[#d11a2a]";

  const primaryBtn = isDarkMode
    ? "bg-gradient-to-r from-[#195427] to-[#2d7a47] hover:from-[#2d7a47] hover:to-[#195427]"
    : "bg-gradient-to-r from-[#084062] to-[#0582CA] hover:from-[#0582CA] hover:to-[#084062]";

  const confirmBtn = variant === "danger" ? dangerBtn : primaryBtn;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Confirmación"}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            aria-label="Cerrar"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className={`relative w-[92%] max-w-md rounded-2xl shadow-2xl ${panelClass}`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-xl p-2 ${
                    isDarkMode ? "bg-white/10" : "bg-black/5"
                  }`}
                  aria-hidden="true"
                >
                  <AlertTriangle
                    size={20}
                    className={isDarkMode ? "text-[#B3E5FC]" : "text-[#084062]"}
                  />
                </div>

                <div className="flex-1">
                  <p className={`text-base font-semibold ${titleClass}`}>{title}</p>
                  <p className={`mt-1 text-sm leading-relaxed ${msgClass}`}>{message}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDarkMode
                      ? "bg-white/10 text-white hover:bg-white/15 focus:ring-[#6EC971] focus:ring-offset-[#001a2e]"
                      : "bg-black/5 text-[#003554] hover:bg-black/10 focus:ring-[#0582CA] focus:ring-offset-white"
                  }`}
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDarkMode ? "focus:ring-[#6EC971] focus:ring-offset-[#001a2e]" : "focus:ring-[#0582CA] focus:ring-offset-white"
                  } ${confirmBtn}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

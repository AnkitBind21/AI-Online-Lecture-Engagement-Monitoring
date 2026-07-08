import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const borders = {
    success: "border-emerald-500/20",
    error: "border-red-500/20",
    info: "border-blue-500/20"
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border ${borders[type]} shadow-xl shadow-black/50 z-50`}
      >
        {icons[type]}
        <span className="text-sm font-medium text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

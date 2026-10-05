import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-[#D16014]" />
  };

  return (
    <div className="fixed top-24 right-5 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-2xl text-xs font-semibold text-gray-800 animate-bounce">
      {icons[type] || icons.info}
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Cerrar notificación" className="ml-2 rounded text-gray-500 hover:text-gray-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

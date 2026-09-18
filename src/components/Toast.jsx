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
    success: <CheckCircle2 className="w-5 h-5 text-[#659B5E]" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-[#D16014]" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00241B]/95 border border-[#F8FFE5]/20 backdrop-blur-xl shadow-2xl text-xs font-semibold text-[#F8FFE5] animate-slide-up">
      {icons[type] || icons.info}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-[#F8FFE5]/60 hover:text-[#F8FFE5]">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
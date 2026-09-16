import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#161616] border border-[#292929] rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <div className="p-2 rounded bg-[#E50914]/10 text-[#E50914] shrink-0">
              <AlertTriangle size={18} />
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs font-semibold text-[#A1A1A1] hover:text-white bg-[#111111] border border-[#292929] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-xs font-semibold text-white transition-colors cursor-pointer ${
              danger ? 'bg-[#E50914] hover:bg-[#B20710]' : 'bg-[#E50914] hover:bg-[#B20710]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

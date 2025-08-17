import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-neutral-800/80 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-recoleta text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 mb-6 text-sm">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
import React from 'react';
import { X, Trash2, Zap, Film } from 'lucide-react';
import { Roll } from '../types';

interface ConfirmDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDevelop: () => void;
  onTrash: () => void;
  roll: Roll;
}

const ConfirmDevelopmentModal: React.FC<ConfirmDevelopmentModalProps> = ({ isOpen, onClose, onDevelop, onTrash, roll }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-warm-800/80 border border-warm-700/50 rounded-2xl max-w-sm w-full p-6 shadow-depth text-center">
        <div className="mb-4">
          <div className="inline-block p-3 bg-warm-700/50 rounded-full mb-3">
            <Film className="w-8 h-8 text-brand-amber-start" />
          </div>
          <h2 className="text-2xl font-bold text-white">Roll Completed!</h2>
        </div>
        <p className="text-warm-300 mb-6 text-base">
          You've finished your roll of <span className="font-semibold text-white">{roll.film_type}</span>.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={onDevelop}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all transform hover:scale-105 active:scale-100"
          >
            <Zap className="w-5 h-5" />
            <span>Develop Photos</span>
          </button>
          <button
            onClick={onTrash}
            className="w-full px-4 py-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Trash Roll</span>
          </button>
        </div>
        <div className="mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-warm-400 hover:text-white font-semibold transition-colors">
            Decide Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDevelopmentModal;
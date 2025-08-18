import React from 'react';
import { Zap, X } from 'lucide-react';

interface SpeedUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: number;
}

const SpeedUpModal: React.FC<SpeedUpModalProps> = ({ isOpen, onClose, onConfirm, cost }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-transparent max-w-sm w-full p-6 text-center">
        <div className="animate-modal-enter">
          <div className="inline-block p-4 bg-warm-800/50 border border-warm-700/50 rounded-full mb-5 shadow-lg">
            <Zap className="w-10 h-10 text-brand-amber-start" />
          </div>
          <h2 className="text-3xl font-bold text-white">Speed Up Development?</h2>
          <p className="text-lg text-warm-300 mt-2 mb-8">
            Spend <span className="font-bold text-white">{cost} credits</span> to finish development instantly and view your photos now.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={onConfirm}
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all transform hover:scale-105 active:scale-100"
            >
              <span>Confirm & Spend Credits</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl bg-neutral-700/50 hover:bg-neutral-700 text-base font-bold text-white transition-colors"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedUpModal;
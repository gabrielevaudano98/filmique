import React from 'react';
import { Zap } from 'lucide-react';

interface SpeedUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost: number;
}

const SpeedUpModal: React.FC<SpeedUpModalProps> = ({ isOpen, onClose, onConfirm, cost }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-sm w-full p-6 animate-modal-enter text-center">
        <div className="animate-fade-in">
          <div className="inline-block p-4 bg-warm-800/50 border border-warm-700/50 rounded-full mb-5 shadow-lg">
            <Zap className="w-10 h-10 text-brand-amber-start" />
          </div>
          <h2 className="text-3xl font-bold text-white">Speed Up Development?</h2>
          <p className="text-lg text-warm-300 mt-2 mb-8">
            Spend <span className="font-bold text-white">{cost} credits</span> to finish developing this roll immediately.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-base font-bold text-white transition-colors"
            >
              <span>No, I'll Wait</span>
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all"
            >
              <Zap className="w-5 h-5" />
              <span>Pay {cost} Credits</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedUpModal;
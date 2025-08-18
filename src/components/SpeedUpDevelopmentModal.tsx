import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Roll } from '../types';

interface SpeedUpDevelopmentModalProps {
  roll: Roll;
  cost: number;
  onConfirm: () => void;
  onClose: () => void;
}

const SpeedUpDevelopmentModal: React.FC<SpeedUpDevelopmentModalProps> = ({ roll, cost, onConfirm, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-sm w-full p-6 animate-modal-enter text-center">
        <div className="animate-fade-in">
          <div className="inline-block p-4 bg-warm-800/50 border border-warm-700/50 rounded-full mb-5 shadow-lg">
            <Zap className="w-10 h-10 text-brand-amber-start" />
          </div>
          <h2 className="text-3xl font-bold text-white">Speed Up Development</h2>
          <p className="text-lg text-warm-300 mt-2 mb-8">
            Spend <span className="font-bold text-white">{cost} credits</span> to instantly develop your roll "{roll.title || roll.film_type}"?
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-base font-bold text-white transition-colors disabled:opacity-50"
            >
              <span>Cancel</span>
            </button>
            <button 
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-black bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              <span>{isLoading ? 'Processing...' : `Confirm & Spend ${cost}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedUpDevelopmentModal;
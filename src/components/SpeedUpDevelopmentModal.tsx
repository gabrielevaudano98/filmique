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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center animate-modal-enter"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">
          <Zap className="w-12 h-12 text-brand-amber-start mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white">Instant Development</h2>
        <p className="text-gray-300 mt-2 leading-relaxed">
          Spend <span className="font-bold text-white">{cost} credits</span> to finish developing
          <br />
          <span className="font-semibold text-amber-400">"{roll.title || roll.film_type}"</span> now?
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-base font-bold text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-black bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeedUpDevelopmentModal;
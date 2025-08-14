import React from 'react';
import { X, Trash2, Zap } from 'lucide-react';
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

  const developmentCost = 1 + Math.ceil(0.2 * roll.shots_used);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Roll Completed!</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 mb-2 text-sm">
          You've finished your roll of <span className="font-bold text-white">{roll.film_type}</span> with {roll.shots_used} photos.
        </p>
        <p className="text-gray-300 mb-6 text-sm">
          What would you like to do next?
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={onDevelop}
            className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Develop Roll ({developmentCost} credits)</span>
          </button>
          <button
            onClick={onTrash}
            className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>Trash Roll</span>
          </button>
        </div>
         <div className="mt-6 text-center">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white font-semibold transition-colors">
              Decide Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDevelopmentModal;
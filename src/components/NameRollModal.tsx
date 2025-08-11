import React, { useState } from 'react';
import { X, Check, Edit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../context/AppContext';

interface NameRollModalProps {
  roll: Roll;
  onClose: () => void;
}

const NameRollModal: React.FC<NameRollModalProps> = ({ roll, onClose }) => {
  const { updateRollTitle } = useAppContext();
  const [title, setTitle] = useState(roll.title || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isNamingRequired = !roll.title;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    setError('');
    const success = await updateRollTitle(roll.id, title.trim());
    setIsLoading(false);
    if (success) {
      onClose();
    } else {
      setError('This title is already in use. Please choose another one.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {roll.title ? 'Rename Roll' : 'Name Your Roll'}
          </h2>
          <button
            onClick={onClose}
            disabled={isNamingRequired}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-400 mb-4 text-sm">
            {isNamingRequired
              ? "Your roll is developed! Give it a name to see your photos."
              : "Give this roll a unique name to easily identify it later."}
          </p>
          <div className="relative">
            <Edit className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Beach Trip"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-amber-500 focus:border-amber-500"
              required
              maxLength={20}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1 pr-1">
            {title.length}/20
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isNamingRequired}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Name'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameRollModal;
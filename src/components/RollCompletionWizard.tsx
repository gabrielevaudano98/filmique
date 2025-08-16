import React, { useState } from 'react';
import { Clock, Archive, Edit } from 'lucide-react';
import { Roll } from '../types';

interface RollCompletionWizardProps {
  roll: Roll;
  onSendToStudio: (roll: Roll, title: string) => void;
  onPutOnShelf: (roll: Roll, title: string) => void;
}

const RollCompletionWizard: React.FC<RollCompletionWizardProps> = ({ roll, onSendToStudio, onPutOnShelf }) => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState<'studio' | 'shelf' | null>(null);

  const handleAction = (action: 'studio' | 'shelf') => {
    if (!title.trim()) return;
    setIsLoading(action);
    if (action === 'studio') {
      onSendToStudio(roll, title.trim());
    } else {
      onPutOnShelf(roll, title.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-sm w-full p-6 animate-modal-enter text-center">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-white">Name Your Roll</h2>
          <p className="text-lg text-warm-300 mt-2 mb-8">
            Give this roll a unique name for your shelf. You can change it later.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAction('studio'); }}>
            <div className="relative">
              <Edit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Summer Vacation '24" 
                className="w-full bg-warm-900/50 border-2 border-warm-700 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:ring-brand-amber-start focus:border-brand-amber-start transition-all" 
                required 
                maxLength={30} 
                autoFocus 
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                type="button"
                onClick={() => handleAction('shelf')}
                disabled={!title.trim() || !!isLoading}
                className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-base font-bold text-white transition-colors disabled:opacity-50"
              >
                <Archive className="w-5 h-5" />
                <span>{isLoading === 'shelf' ? 'Shelving...' : 'Put on Shelf'}</span>
              </button>
              <button 
                type="submit"
                disabled={!title.trim() || !!isLoading}
                className="flex-1 flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Clock className="w-5 h-5" />
                <span>{isLoading === 'studio' ? 'Sending...' : 'Send to Studio'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RollCompletionWizard;
import React, { useState, useEffect } from 'react';
import { Zap, Trash2, Film, Edit, Check, AlertTriangle, PartyPopper } from 'lucide-react';
import { Roll } from '../types';
import { useAppContext } from '../context/AppContext';

interface RollCompletionWizardProps {
  roll: Roll;
  onDevelop: (roll: Roll, title: string) => void;
  onTrash: (rollId: string) => void;
  onDecideLater: (roll: Roll, title: string) => void;
  onClose: () => void;
}

const RollCompletionWizard: React.FC<RollCompletionWizardProps> = ({ roll, onDevelop, onTrash, onDecideLater, onClose }) => {
  const [step, setStep] = useState<'decision' | 'naming' | 'confirm_trash'>('decision');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [action, setAction] = useState<'develop' | 'decide_later' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateRollTitle } = useAppContext();

  useEffect(() => {
    if (roll.title) setTitle(roll.title);
  }, [roll]);

  const handleDecision = (chosenAction: 'develop' | 'decide_later') => {
    setAction(chosenAction);
    setStep('naming');
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    setError('');
    
    const success = await updateRollTitle(roll.id, title.trim());
    
    if (success) {
      const updatedRoll = { ...roll, title: title.trim() };
      if (action === 'develop') {
        onDevelop(updatedRoll, title.trim());
      } else if (action === 'decide_later') {
        onDecideLater(updatedRoll, title.trim());
      }
    } else {
      setError('This title is already in use. Please choose another one.');
      setIsLoading(false);
    }
  };

  const handleTrashConfirm = () => {
    onTrash(roll.id);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'decision':
        return (
          <div className="text-center">
            <div className="inline-block p-4 bg-warm-700/50 rounded-full mb-4">
              <PartyPopper className="w-10 h-10 text-brand-amber-start" />
            </div>
            <h2 className="text-3xl font-bold text-white">That's a Wrap!</h2>
            <p className="text-lg text-warm-300 mt-2 mb-8">
              You've captured all {roll.shots_used} photos on your <span className="font-semibold text-white">{roll.film_type}</span> roll. What's next?
            </p>
            <div className="flex flex-col space-y-4">
              <button onClick={() => handleDecision('develop')} className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all transform hover:scale-105 active:scale-100">
                <Zap className="w-5 h-5" />
                <span>Develop Photos</span>
              </button>
              <div className="flex justify-center items-center space-x-8 pt-2">
                <button onClick={() => setStep('confirm_trash')} className="flex items-center space-x-2 text-red-400 hover:text-red-300 font-bold text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Trash Roll</span>
                </button>
                <button onClick={() => handleDecision('decide_later')} className="text-white opacity-80 hover:opacity-100 font-bold text-sm transition-colors">
                    Decide Later
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'naming':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-2">Name Your Roll</h2>
            <p className="text-lg text-warm-300 mb-8 text-center">Give your roll a unique name. You can change it later.</p>
            <form onSubmit={handleNameSubmit}>
              <div className="relative">
                <Edit className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Summer Vacation '24" className="w-full bg-warm-900/50 border-2 border-warm-700 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:ring-brand-amber-start focus:border-brand-amber-start transition-all" required maxLength={30} autoFocus />
              </div>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" onClick={() => setStep('decision')} className="px-5 py-3 rounded-xl bg-warm-700/50 hover:bg-warm-700/80 font-bold transition-colors">Back</button>
                <button type="submit" disabled={isLoading || !title.trim()} className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-amber-start to-brand-amber-end text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>{isLoading ? 'Saving...' : 'Save & Continue'}</span>
                </button>
              </div>
            </form>
          </div>
        );

      case 'confirm_trash':
        return (
          <div className="text-center">
            <div className="inline-block p-4 bg-red-900/50 rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Are you sure?</h2>
            <p className="text-lg text-warm-300 mt-2 mb-8">
              This will permanently delete all {roll.shots_used} photos. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setStep('decision')} className="flex-1 px-4 py-3 rounded-xl bg-warm-700/50 hover:bg-warm-700/80 text-white font-bold transition-colors">
                Cancel
              </button>
              <button onClick={handleTrashConfirm} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold transition-colors">
                Confirm Trash
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-sm w-full p-6 animate-modal-enter">
        <div key={step} className="animate-fade-in">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default RollCompletionWizard;
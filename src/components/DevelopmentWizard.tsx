import React, { useState } from 'react';
import { Clock, Printer, Edit, Send } from 'lucide-react';
import { Roll } from '../types';

interface DevelopmentWizardProps {
  roll: Roll;
  onStartDevelopment: (roll: Roll, title: string, isPrinted: boolean) => void;
}

const DevelopmentWizard: React.FC<DevelopmentWizardProps> = ({ roll, onStartDevelopment }) => {
  const [title, setTitle] = useState('');
  const [isPrinted, setIsPrinted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    if (!title.trim()) return;
    setIsLoading(true);
    onStartDevelopment(roll, title.trim(), isPrinted);
  };

  return (
    <div className="fixed inset-0 bg-warm-900/50 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
      <div className="bg-transparent max-w-sm w-full p-6 animate-modal-enter text-center">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-white">Roll Complete!</h2>
          <p className="text-lg text-warm-300 mt-2 mb-8">
            Name your roll and choose how you'd like to develop it.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAction(); }} className="space-y-6">
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

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setIsPrinted(false)} className={`p-4 rounded-xl border-2 transition-all ${!isPrinted ? 'bg-brand-amber-start/10 border-brand-amber-start' : 'bg-neutral-800 border-transparent hover:border-neutral-700'}`}>
                <Clock className="w-8 h-8 mx-auto text-brand-amber-start" />
                <p className="font-bold text-white mt-2">Digital Only</p>
                <p className="text-xs text-gray-400">3 Day Wait</p>
              </button>
              <button type="button" onClick={() => setIsPrinted(true)} className={`p-4 rounded-xl border-2 transition-all ${isPrinted ? 'bg-brand-amber-start/10 border-brand-amber-start' : 'bg-neutral-800 border-transparent hover:border-neutral-700'}`}>
                <Printer className="w-8 h-8 mx-auto text-brand-amber-start" />
                <p className="font-bold text-white mt-2">Digital + Print</p>
                <p className="text-xs text-gray-400">7 Day Wait</p>
              </button>
            </div>

            <button 
              type="submit"
              disabled={!title.trim() || isLoading}
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl shadow-lg shadow-brand-amber-start/20 text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? 'Sending...' : 'Start Development'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentWizard;
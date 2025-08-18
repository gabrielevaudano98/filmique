import React, { useState, useRef, useEffect } from 'react';
import { Lock, Key, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Roll } from '../types';

interface UnlockRollViewProps {
  roll: Roll;
}

const UnlockRollView: React.FC<UnlockRollViewProps> = ({ roll }) => {
  const { unlockRoll } = useAppContext();
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 4) return;
    
    setIsLoading(true);
    await unlockRoll(roll.id, fullCode);
    // No need to set loading to false, as the component will unmount on success
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <div className="bg-neutral-800/50 rounded-2xl p-8 max-w-sm w-full">
        <div className="inline-block p-4 bg-warm-800/50 border border-warm-700/50 rounded-full mb-5 shadow-lg">
          <Lock className="w-8 h-8 text-brand-amber-start" />
        </div>
        <h1 className="text-3xl font-bold text-white">Roll Locked</h1>
        <p className="text-warm-300 mt-2 mb-8">
          Your digital photos for "{roll.title || roll.film_type}" are ready. Enter the 4-digit code that came with your physical prints to unlock them.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-16 bg-warm-900/50 border-2 border-warm-700 rounded-lg text-white text-center text-4xl font-mono focus:ring-brand-amber-start focus:border-brand-amber-start transition-all"
                required
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 4}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-warm-900 focus:ring-brand-amber-start disabled:bg-neutral-600 disabled:opacity-70 disabled:shadow-none transition-all transform hover:scale-105 active:scale-100"
          >
            <Key className="w-5 h-5" />
            <span>{isLoading ? 'Unlocking...' : 'Unlock Roll'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnlockRollView;
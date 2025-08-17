import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface ExpandableSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  theme?: 'light' | 'dark';
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ searchTerm, onSearchTermChange, theme = 'dark' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    onSearchTermChange('');
    setIsExpanded(false);
  };

  const buttonClasses = isLight
    ? 'bg-white/50 border-neutral-300/80 text-neutral-800 hover:bg-white/80'
    : 'bg-neutral-800/60 border-white/10 text-white hover:bg-neutral-700/80';
  
  const inputClasses = isLight
    ? 'bg-white/50 border-neutral-300/80 text-neutral-900 placeholder-neutral-500 focus:ring-brand-amber-start'
    : 'bg-neutral-800/60 border-white/10 text-white placeholder-gray-400 focus:ring-brand-amber-start';

  return (
    <div className={`flex items-center justify-end transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-xs' : 'w-11'}`}>
      {isExpanded ? (
        <div className="relative w-full">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? 'text-neutral-500' : 'text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onBlur={() => { if (!searchTerm) setIsExpanded(false); }}
            placeholder="Search..."
            className={`w-full backdrop-blur-lg border rounded-xl pl-10 pr-10 py-2.5 focus:border-transparent focus:ring-2 transition-colors ${inputClasses}`}
          />
          {searchTerm && (
            <button onClick={handleClear} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-neutral-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center justify-center w-11 h-11 backdrop-blur-lg border rounded-xl transition-colors ${buttonClasses}`}
          aria-label="Search rolls"
        >
          <Search className={`w-5 h-5 ${isLight ? 'text-neutral-700' : 'text-gray-300'}`} />
        </button>
      )}
    </div>
  );
};

export default ExpandableSearch;
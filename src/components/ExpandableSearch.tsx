import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface ExpandableSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const ExpandableSearch: React.FC<ExpandableSearchProps> = ({ searchTerm, onSearchTermChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    onSearchTermChange('');
    setIsExpanded(false);
  };

  return (
    <div className={`flex items-center justify-end transition-all duration-300 ease-in-out ${isExpanded ? 'w-full max-w-xs' : 'w-11'}`}>
      {isExpanded ? (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onBlur={() => { if (!searchTerm) setIsExpanded(false); }}
            placeholder="Search..."
            className="w-full bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-amber-start focus:border-transparent"
          />
          {searchTerm && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-11 h-11 bg-neutral-800/60 backdrop-blur-lg border border-white/10 rounded-xl text-white hover:bg-neutral-700/80 transition-colors"
          aria-label="Search rolls"
        >
          <Search className="w-5 h-5 text-gray-300" />
        </button>
      )}
    </div>
  );
};

export default ExpandableSearch;
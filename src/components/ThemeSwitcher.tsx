import React from 'react';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useAppContext();

  const handleSetLight = () => setTheme('light');
  const handleSetDark = () => setTheme('dark');
  const handleToggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSetLight}
        aria-pressed={theme === 'light'}
        title="Use light theme"
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          theme === 'light' ? 'bg-neutral-200 text-[#111827] ring-brand-amber-start' : 'bg-transparent text-gray-400 hover:text-gray-700'
        }`}
      >
        <Sun className="w-4 h-4" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        onClick={handleSetDark}
        aria-pressed={theme === 'dark'}
        title="Use dark theme"
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-neutral-800 text-white ring-brand-amber-start' : 'bg-transparent text-gray-400 hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        onClick={handleToggle}
        title="Toggle theme"
        aria-label="Toggle theme"
        className="ml-1 inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors focus:outline-none"
      >
        <RefreshCw className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
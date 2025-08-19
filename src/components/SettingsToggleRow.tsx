import React from 'react';

interface SettingsToggleRowProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({ icon, color, title, subtitle, checked, onChange }) => (
  <div className="w-full flex items-center p-4 text-left min-h-[64px]">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-white font-medium text-base">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-amber-start"></div>
    </label>
  </div>
);

export default SettingsToggleRow;
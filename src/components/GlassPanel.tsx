import React from 'react';

interface GlassPanelProps {
  title: string;
  tint: 'warm' | 'cool';
  children: React.ReactNode;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ title, tint, children }) => {
  const tintClass = tint === 'warm' 
    ? 'from-brand-amber-end/5 via-brand-amber-end/10 to-transparent' 
    : 'from-blue-500/5 via-blue-500/10 to-transparent';

  return (
    <div className={`bg-gradient-to-b ${tintClass} border border-white/10 rounded-2xl shadow-lg backdrop-blur-xl`}>
      <h3 className="px-6 pt-5 text-lg font-semibold text-white">{title}</h3>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;
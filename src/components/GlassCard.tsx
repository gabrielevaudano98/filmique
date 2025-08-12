import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  stacked?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', stacked = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${stacked ? 'stacked' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default GlassCard;
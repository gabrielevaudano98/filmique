import React from 'react';

interface AccentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

const AccentButton: React.FC<AccentButtonProps> = ({ variant = 'primary', children, className = '', ...rest }) => {
  const base = 'pill-cta';
  const variantClass = variant === 'outline' ? 'outline' : '';
  return (
    <button
      {...rest}
      className={`${base} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default AccentButton;
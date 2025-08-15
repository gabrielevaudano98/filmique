import React from 'react';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{
        top: 'env(safe-area-inset-top, 0)',
        paddingTop: '12px',
        width: '100%', // Make it full width on smaller screens
        maxWidth: '500px', // Max width for larger screens
        paddingLeft: '16px', // Horizontal padding
        paddingRight: '16px', // Horizontal padding
        boxSizing: 'border-box', // Ensure padding is included in width
      }}
      toastOptions={{
        duration: 4000,
        style: {
          // Glossy, iOS 26-like styling
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(6,6,8,0.4))', // Subtle light source from top, fading to darker bottom
          color: '#f7f7f8', // neutral-100
          backdropFilter: 'blur(16px) saturate(180%)', // Stronger blur and saturation for glass effect
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)', // Slightly more prominent border
          borderRadius: '9999px', // Pill shape
          padding: '12px 24px', // More generous padding
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)', // Deeper outer shadow + inner rim light
          fontFamily: '"SF Pro Display", Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#2FD1B0', // accent-teal
            secondary: '#0f1113', // neutral-800
          },
        },
        error: {
          iconTheme: {
            primary: '#FF6B6B', // accent-coral
            secondary: '#0f1113', // neutral-800
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center">
              {icon}
              <div className="flex-1 text-center mx-2">{message}</div>
              {t.type !== 'loading' && (
                <button onClick={() => toast.dismiss(t.id)} className="p-1 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastProvider;
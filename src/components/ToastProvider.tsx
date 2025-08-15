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
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(27, 29, 32, 0.75)', // neutral-700 with transparency
          color: '#f7f7f8', // neutral-100
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          padding: '10px 16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          fontFamily: '"SF Pro Display", Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          maxWidth: '400px',
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
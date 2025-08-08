import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#27272a', // gray-800
          color: '#ffffff',
          border: '1px solid #3f3f46', // gray-700
        },
        success: {
          iconTheme: {
            primary: '#34d399', // green-400
            secondary: '#111827', // gray-900
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171', // red-400
            secondary: '#111827', // gray-900
          },
        },
      }}
    />
  );
};

export default ToastProvider;
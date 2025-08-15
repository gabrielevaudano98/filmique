import React from 'react';
import toast from 'react-hot-toast';
import { Info, AlertTriangle } from 'lucide-react';

export const showErrorToast = (message: string) => {
  toast.error(message || 'Something went wrong. Please try again.');
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showInfoToast = (message: string) => {
  toast(message, {
    icon: <Info className="w-5 h-5 text-blue-400" />,
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (id?: string) => {
  toast.dismiss(id);
};
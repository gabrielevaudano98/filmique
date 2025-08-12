import toast from 'react-hot-toast';

export const showErrorToast = (message: string) => {
  toast.error(message || 'Something went wrong. Please try again.');
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (id?: string) => {
  toast.dismiss(id);
};
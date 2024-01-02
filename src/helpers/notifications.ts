import { toast } from 'react-toastify';

const toastConfig = {
  autoClose: 6000,
  hideProgressBar: true,
  pauseOnHover: true,
  containerId: 'notification-center',
  closeOnClick: false,
};

export const notifyError = (message: string) =>
  toast.error(message, { ...toastConfig, toastId: message });

export const notifyWarning = (message: string) =>
  toast.warning(message, { ...toastConfig, toastId: message });

export const notifyGlobalError = (message: string) =>
  toast.error(message, {
    ...toastConfig,
    containerId: 'globalToast',
    toastId: message,
    autoClose: 8000,
  });

import { toast } from 'react-toastify';

const toastConfig = {
  autoClose: 4000,
  hideProgressBar: true,
  pauseOnHover: true,
  containerId: 'notification-center',
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
    autoClose: 6000,
  });

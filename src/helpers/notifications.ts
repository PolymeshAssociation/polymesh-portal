import { toast } from 'react-toastify';

const toastConfig = {
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

export const notifyError = (message: string) =>
  toast.error(message, { ...toastConfig, toastId: message });

export const notifyWarning = (message: string) =>
  toast.warning(message, { ...toastConfig, toastId: message });

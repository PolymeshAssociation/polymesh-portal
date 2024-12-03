import { toast, ToastContent, ToastOptions } from 'react-toastify';

const toastConfig = {
  autoClose: 6000,
  hideProgressBar: true,
  pauseOnHover: true,
  containerId: 'notification-center',
  closeOnClick: false,
};

export const notifyError = (
  message: ToastContent<unknown>,
  toastConfigOverrides?: ToastOptions<unknown>,
) =>
  toast.error(message, {
    ...toastConfig,
    toastId: typeof message === 'string' ? message : undefined,
    ...toastConfigOverrides,
  });

export const notifyWarning = (
  message: ToastContent<unknown>,
  toastConfigOverrides?: ToastOptions<unknown>,
) =>
  toast.warning(message, {
    ...toastConfig,
    toastId: typeof message === 'string' ? message : undefined,
    ...toastConfigOverrides,
  });

export const notifyGlobalError = (
  message: ToastContent<unknown>,
  toastConfigOverrides?: ToastOptions<unknown>,
) =>
  toast.error(message, {
    ...toastConfig,
    containerId: 'globalToast',
    toastId: typeof message === 'string' ? message : undefined,
    autoClose: 8000,
    ...toastConfigOverrides,
  });


import { Slide, toast, ToastContainer, ToastContent } from 'react-toastify';

import { ReactComponent as ErrorIcon } from 'icons/error.svg';
import { ReactComponent as InfoIcon } from 'icons/info.svg';
import { ReactComponent as SuccessIcon } from 'icons/success.svg';
import { ReactComponent as WarningIcon } from 'icons/warning.svg';

import 'react-toastify/dist/ReactToastify.css';

import styles from './ToastContainer.module.css';

export const successToast = (content: ToastContent) => {
  toast.success(content, {
    icon: <SuccessIcon className={styles.successIcon} />,
  });
};

export const errorToast = (content: ToastContent) => {
  toast.error(content, {
    icon: <ErrorIcon className={styles.errorIcon} />,
  });
};

export const warningToast = (content: ToastContent) => {
  toast.warning(content, {
    icon: <WarningIcon className={styles.warningIcon} />,
  });
};

export const infoToast = (content: ToastContent) => {
  toast.info(content, {
    icon: <InfoIcon className={styles.infoIcon} />,
  });
};

const Toast: React.FC = () => {
  return (
    <ToastContainer
      toastClassName={styles.toast}
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      transition={Slide}
      pauseOnFocusLoss
      pauseOnHover
    />
  );
};

export default Toast;

import Popup from 'reactjs-popup';

import Button from 'components/Button/Button';
import { ReactComponent as CrossIcon } from 'icons/close.svg';

import styles from './ConfirmationModal.module.css';

interface Props {
  title: string;
  text: string;
  trigger: React.ReactElement;
  confirmText?: string;
  rejectText?: string;
  onConfirm: () => void;
  onReject?: () => void;
}

const ConfirmationModal: React.FC<Props> = ({ title, text, trigger, onConfirm, confirmText, onReject, rejectText }) => {
  return (
    <Popup trigger={trigger} modal className="confirmationPopup">
      {(close: () => void) => (
        <>
          <h3 className={styles.title}>{title}</h3>
          <Button className={styles.closeButton} variant="ghost" onClick={close}>
            <CrossIcon width={24} height={24} />
          </Button>
          <p className={styles.text}>{text}</p>
          <div className={styles.buttons}>
            <Button
              className={styles.button}
              variant="secondary"
              onClick={() => {
                if (onReject) onReject();
                close();
              }}
            >
              {rejectText || 'No'}
            </Button>
            <Button
              className={styles.button}
              variant="warning"
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              {confirmText || 'Yes'}
            </Button>
          </div>
        </>
      )}
    </Popup>
  );
};

export default ConfirmationModal;

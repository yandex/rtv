import { forwardRef } from 'react';

import classnames from 'classnames';

import styles from './Button.module.css';

interface Props {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'warning';
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button' | undefined;
  onClick?: () => void;
  tooltipId?: string;
  tooltipText?: string | null;
}

const Button: React.FC<Props> = forwardRef<HTMLButtonElement, Props>(
  ({ children, variant = 'primary', onClick, className, disabled, type, tooltipId, tooltipText }, ref) => {
    return (
      <span data-tip={tooltipText} data-for={tooltipId}>
        <button
          className={classnames(className, {
            [styles.buttonPrimary]: variant === 'primary',
            [styles.buttonSecondary]: variant === 'secondary',
            [styles.buttonGhost]: variant === 'ghost',
            [styles.buttonWarning]: variant === 'warning',
            [styles.disabled]: disabled,
          })}
          ref={ref}
          disabled={disabled}
          onClick={onClick}
          type={type}
        >
          {children}
        </button>
      </span>
    );
  }
);

export default Button;

import classNames from 'classnames';

import { ReactComponent as SpinnerIcon } from 'icons/spinner.svg';

import styles from './Spinner.module.css';

type Variant = 'small' | 'medium' | 'large';

interface Props {
  className?: string;
  variant?: Variant;
}

const sizes: Record<Variant, number> = {
  small: 22,
  medium: 40,
  large: 88,
};

export function Spinner({ className, variant = 'small' }: Props) {
  const size = sizes[variant];
  return <SpinnerIcon width={size} height={size} className={classNames(styles.spinner, className)} />;
}

import classNames from 'classnames';

import { Alignment } from '../types';
import styles from './CellWrapper.module.css';

interface Props {
  className?: string;
  showSeparator?: boolean;
  alignment?: Alignment;
}

const CellWrapper: React.FC<Props> = ({ children, className, showSeparator = true, alignment = 'left' }) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      <div
        className={classNames(styles.content, {
          [styles.left]: alignment === 'left',
          [styles.center]: alignment === 'center',
          [styles.right]: alignment === 'right',
        })}
      >
        {children}
      </div>
      {showSeparator && <div className={styles.separator} />}
    </div>
  );
};

export default CellWrapper;

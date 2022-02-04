import { useLayoutEffect, useRef } from 'react';

import classNames from 'classnames';

import styles from './Expander.module.css';

interface Props {
  className?: string;
  open: boolean;
}

const Expander: React.FC<Props> = ({ open, className, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (rootRef.current && containerRef.current) {
      rootRef.current.style.height = open ? `${containerRef.current.scrollHeight}px` : '0px';
    }
  });

  return (
    <div
      ref={rootRef}
      className={classNames(className, styles.root, {
        [styles.open]: open,
      })}
    >
      <div ref={containerRef}>{children}</div>
    </div>
  );
};

export default Expander;

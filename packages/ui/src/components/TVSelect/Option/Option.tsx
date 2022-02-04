import { KnownTv } from 'rtv-client';

import styles from './Option.module.css';

interface Props {
  knownTv: KnownTv;
}

export default function Option({ knownTv }: Props) {
  return (
    <div className={styles.option}>
      <div className={knownTv.online ? styles.statusOn : styles.statusOff} />
      <span className={styles.tvText}>{knownTv.alias}, </span>
      <span className={styles.ipText}>{knownTv.ip}</span>
    </div>
  );
}

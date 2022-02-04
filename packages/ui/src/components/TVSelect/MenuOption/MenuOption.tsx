import { KnownTv } from 'rtv-client';

import useAuth from 'hooks/useAuth';
import { ReactComponent as OccupiedIcon } from 'icons/user.svg';

import styles from './MenuOption.module.css';

interface Props {
  knownTv: KnownTv;
}

export default function MenuOption({ knownTv }: Props) {
  const { username } = useAuth();
  const occupied = knownTv?.occupied && knownTv?.occupied !== username;

  return (
    <div className={styles.option}>
      <div className={knownTv.online ? styles.statusOn : styles.statusOff} />
      <div>
        <div className={styles.tvText}>{knownTv.alias}</div>
        <div className={styles.additionalInfo}>
          <span className={styles.ipText}>{knownTv.ip}</span>
          {occupied && (
            <span>
              <OccupiedIcon width={12} height={12} className={styles.occupiedIcon} />
              {knownTv.occupied}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

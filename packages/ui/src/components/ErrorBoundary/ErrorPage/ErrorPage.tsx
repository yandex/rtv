import Button from 'components/Button/Button';
import { ReactComponent as RefreshIcon } from 'icons/refresh.svg';
import { ReactComponent as SadIcon } from 'icons/sad.svg';

import styles from './ErrorPage.module.css';

export default function ErrorPage() {
  const onRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <SadIcon className={styles.sadIcon} />
      <h3 className={styles.title}>Something went wrong</h3>
      <span>Please refresh browser page</span>
      <Button className={styles.button} onClick={onRefresh}>
        <RefreshIcon className={styles.refreshIcon} />
        Refresh
      </Button>
    </div>
  );
}

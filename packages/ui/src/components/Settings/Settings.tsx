import classNames from 'classnames';
import { Link, useParams } from 'react-router-dom';

import AppSettings from 'components/AppSettings/AppSettings';
import TVSettings from 'components/TVSettings/TVSettings';
import UserInfo from 'components/UserInfo/UserInfo';
import { ReactComponent as ArrowLeftIcon } from 'icons/arrow-left.svg';
import { appVersion } from 'utils/version';

import styles from './Settings.module.css';

const Settings: React.FC = () => {
  const { tab = 'tv' } = useParams();
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <Link to="/" className={styles.back}>
            <ArrowLeftIcon width={24} height={24} className={styles.arrowLeftIcon} />
          </Link>
          <h2>Settings</h2>
        </div>
        <UserInfo />
      </div>
      <div className={styles.body}>
        <div className={styles.tabs}>
          <Link to="/settings/tv" className={classNames(styles.link, { [styles.active]: tab === 'tv' })}>
            TVs
          </Link>
          <Link to="/settings/app" className={classNames(styles.link, { [styles.active]: tab === 'app' })}>
            Applications
          </Link>
        </div>
        {tab === 'tv' && <TVSettings />}
        {tab === 'app' && <AppSettings />}
      </div>
      <div className={styles.footer}>{appVersion}</div>
    </div>
  );
};

export default Settings;

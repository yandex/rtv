import Popup from 'reactjs-popup';

import Avatar from 'components/Avatar/Avatar';
import Button from 'components/Button/Button';
import useAuth from 'hooks/useAuth';
import { ReactComponent as LogoutIcon } from 'icons/log-out.svg';

import styles from './UserInfo.module.css';

const UserInfo = () => {
  const { username, signOut } = useAuth();

  if (!username) return null;

  return (
    <Popup
      className="loginInfoPopup"
      trigger={
        <Button variant="ghost" className={styles.loginInfo}>
          <Avatar username={username} />
          {username}
        </Button>
      }
      closeOnDocumentClick={true}
      position="bottom right"
      arrow={false}
    >
      <Button variant="ghost" className={styles.logout} onClick={signOut}>
        Sign out
        <LogoutIcon width={16} height={16} className={styles.logoutIcon} />
      </Button>
    </Popup>
  );
};

export default UserInfo;

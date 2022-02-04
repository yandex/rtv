import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import Button from 'components/Button/Button';
import useAuth from 'hooks/useAuth';
import { ReactComponent as RTVLogoIcon } from 'icons/rtv-logo.svg';
import { appVersion } from 'utils/version';

import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [login, setLogin] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (login) {
      signIn?.(login);
      navigate(from, { replace: true });
    }
  };

  return (
    <div className={styles.root}>
      <form className={styles.form} onSubmit={onSubmit}>
        <RTVLogoIcon className={styles.icon} />
        <input
          className={styles.input}
          type="text"
          value={login}
          placeholder="Login"
          onChange={(e) => setLogin(e.target.value)}
        />
        <Button disabled={!login} type="submit">
          Sign in
        </Button>
        <span className={styles.version}>{appVersion}</span>
      </form>
    </div>
  );
}

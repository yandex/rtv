import { deleteCookie, getCookieValue, setCookieValue } from './helpers';

const userCookie = 'rtv-user';

export const signIn = (login: string) => {
  if (!login) {
    return;
  }
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 10);
  setCookieValue({
    name: userCookie,
    value: login,
    expires,
  });
};

export const signOut = () => {
  deleteCookie(userCookie);
};

export const getUsername = () => getCookieValue(userCookie);

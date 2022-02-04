/**
 * TV Application Parameters Controller
 */
const PREFIX = 'rtv-ui.params.';

const tvIpKey = `${PREFIX}tv-ip`;
const appIdKey = `${PREFIX}app-id`;
const appParamsKey = (appId: string) => `${PREFIX}app-params-${appId}`;

export const getTvIp = () => get(tvIpKey);
export const saveTvIp = (value: string) => save(tvIpKey, value);

export const getAppId = () => get(appIdKey);
export const saveAppId = (value: string) => save(appIdKey, value);

export const getCurrentAppParams = (): string => {
  const appId = getAppId();
  return (appId && getAppParams(appId)) || '';
};
export const getAppParams = (appId: string) => get(appParamsKey(appId));
export const saveAppParams = (appId: string, value: string) => save(appParamsKey(appId), value);

const get = (key: string) => localStorage.getItem(key) || undefined;
const save = (key: string, value: string) => localStorage.setItem(key, value);

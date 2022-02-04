/**
 * Helpers for tv lastUsed field
 */
import ms from 'ms';
import { values as config } from '../config';

type LastUsedInfo = {
  user: string;
  action: string;
  time: number;
};

const lastUsersOfTvs = new Map<string, LastUsedInfo | null>();

/**
 * Updates info about last use of tv
 * @param {string} tvIp - IP address of used TV
 * @param {string} user - User name
 * @param {string} action - User action
 */
export const updateTvLastUsed = (tvIp: string, user: string, action: string) => {
  lastUsersOfTvs.set(tvIp, {
    user,
    action,
    time: Date.now(),
  });
};

/**
 * Get last used
 * @param {string} tvIp - IP address of used TV
 */
export const getTvLastUsed = (tvIp: string) => lastUsersOfTvs.get(tvIp) || null;

export const whoIsUsingTv = (tvIp: string) => {
  const lastUsedInfo = getTvLastUsed(tvIp);
  if (!lastUsedInfo) {
    return null;
  }
  const isOccupied = Date.now() - lastUsedInfo.time <= config.tvIsOccupiedTimeout;
  return isOccupied ? lastUsedInfo.user : null;
};

/**
 * Free TV
 * @param {string} tvIp - IP address of used TV
 */
export const freeTv = (tvIp: string) => lastUsersOfTvs.set(tvIp, null);

export const formatLastUsedInfo = (info: LastUsedInfo | null) => {
  if (!info) {
    return 'unknown';
  }
  const dateDiff = Date.now() - info.time;
  return `${info.user} (${info.action} ${dateDiff < 1000 ? 'now' : ms(dateDiff)})`;
};

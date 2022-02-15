/**
 * Module for communicating with Playstation DevKit.
 */
import fetch from 'node-fetch';

import { getKnownTvs } from '../../api/tv/service';
import { NotNullOrUndefined } from '../../helpers';

const DEBUG_PORT = 1900;
const FETCH_DEBUG_SESSION_TIMEOUT = 3000;
/**
 * Platform name
 */
export const NAME = 'playstation';

/**
 * Wake up not supported
 */
export const WAKE_UP_PORT = null;

/**
 * Init Playstation platform on server start
 */
export const init = function () {
  // No-op for PS
};

/**
 * Discovers PS devices.
 *
 * @param {boolean}
 * @returns {Promise<Array>}
 */
export const discoverTVs = async function () {
  const allDevices = getKnownTvs().filter((tv) => tv.platform === 'playstation');
  const devices = await Promise.all(
    allDevices.map(async (tv) => {
      const isActive = await isActiveDebugSession(tv.ip);
      return isActive ? tv : undefined;
    })
  );

  return devices.filter(NotNullOrUndefined);
};

export const isReady = async function (ip: string, timeout?: number) {
  return isActiveDebugSession(ip, timeout);
};

/**
 * Get info about TV.
 *
 * @returns {Promise<Object>}
 */
export const getTVInfo = async function () {
  return {};
};
/**
 * Wait until TV is ready
 */
export const waitForReady = async function () {
  throw new Error('Not implemented');
};

/**
 * Returns developer panel url.
 */
export const getDevPanelUrl = async function () {
  throw new Error('Not implemented');
};

/**
 * Returns tv logs url.
 */
export const getLogsUrl = async function () {
  throw new Error('Not implemented');
};

/**
 * Installs app on TV.
 */
export const installApp = async function () {
  throw new Error('Not implemented. Please install manually');
};

/**
 * Get app state on TV.
 */
export const getAppState = async function (tvIp: string) {
  const isActive = await isActiveDebugSession(tvIp);
  return {
    running: isActive,
  };
};

/**
 * Launch app on TV.
 */
export const launchApp = function () {
  throw new Error('Not implemented. Please launch manually');
};

/**
 * Close app on TV.
 */
export const closeApp = function () {
  throw new Error('Not implemented. Please close manually');
};

/**
 * Debug app on TV.
 */
export const debugApp = async function (tvIP: string) {
  const isActive = await isActiveDebugSession(tvIP);
  if (!isActive) {
    throw new Error('Debug session not found. Please run manually PS application in debug mode.');
  }
  const wsUrl = `${tvIP}:${DEBUG_PORT}/devtools/page/1`;
  const inspectorUrl = `http://${tvIP}:${DEBUG_PORT}webkit/inspector/WebInspectorUI/Main.html?experiments=1&page=1`;
  const debugUrl = `${inspectorUrl}?ws=${wsUrl}`;
  return {
    wsUrl,
    inspectorUrl,
    debugUrl,
  };
};

/**
 * Uninstall app from TV.
 */
export const uninstallApp = function () {
  throw new Error('Not implemented');
};

/**
 * Gets list of installed apps.
 */
export const getAppList = async function () {
  throw new Error('Not implemented');
};

/**
 * launch browser with optional url.
 */
export const launchBrowser = async function () {
  throw new Error('Not implemented');
};

export const packApp = async function () {
  throw new Error('Not implemented');
};

export const saveTv = function () {
  // No-op for PS
};

export const deleteTv = function () {
  // No-op for PS
};

export const enableDevMode = async function () {
  throw new Error('Not implemented');
};

export const getRemoteControlWsInfo = async function () {
  throw new Error('Not implemented');
};

async function isActiveDebugSession(ip: string, timeout = FETCH_DEBUG_SESSION_TIMEOUT) {
  try {
    const response = await fetch(`http://${ip}:${DEBUG_PORT}`, {
      // TODO: use AbortController
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      timeout,
    });
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

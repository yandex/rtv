/**
 * Module for communicating with vidaa TVs.
 */
import fetch from 'node-fetch';

import { getKnownTvs } from '../../api/tv/service';
import { NotNullOrUndefined } from '../../helpers';
import { DevToolsJsonListItem } from '../shared/devtools';

// TODO: support different debug ports for diffferent models
const DEBUG_PORT = 9226;
const FETCH_DEBUG_SESSION_TIMEOUT = 3000;
const systemUrlsPattern = /file:\/\//;

/**
 * Platform name
 */
export const NAME = 'vidaa';

/**
 * Wake up not supported
 */
export const WAKE_UP_PORT = undefined;

/**
 * Init vidaa platform on server start
 */
export const init = function () {
  // No-op for Vidaa
};

/**
 * Discovers vidaa devices.
 *
 * @param {boolean}
 * @returns {Promise<Array>}
 */
export const discoverTVs = async function () {
  const allDevices = getKnownTvs().filter((tv) => tv.platform === 'vidaa');
  const devices = await Promise.all(
    allDevices.map(async (tv) => {
      const isActive = await isReady(tv.ip);
      return isActive ? tv : undefined;
    })
  );

  return devices.filter(NotNullOrUndefined);
};

export const isReady = async function (ip: string, timeout?: number) {
  const session = await getActiveDebugSession(ip, timeout);
  return Boolean(session);
};

/**
 * Get info about TV.
 *
 */
export const getTVInfo = async function () {
  return {};
};

/**
 * Wait for TV is ready
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
  const isActive = await isReady(tvIp);
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
  const session = await getActiveDebugSession(tvIP);
  if (!session) {
    throw new Error('Debug session not found. Please run manually Vidaa application.');
  }
  const inspectorUrl = `http://${tvIP}:${DEBUG_PORT}/devtools/inspector.html`;
  const wsUrl = session.webSocketDebuggerUrl.replace('ws://', '');
  return {
    wsUrl,
    inspectorUrl,
    debugUrl: `${inspectorUrl}?ws=${session.webSocketDebuggerUrl}`,
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

async function getActiveDebugSession(ip: string, timeout = FETCH_DEBUG_SESSION_TIMEOUT) {
  try {
    const response = await fetch(`http://${ip}:${DEBUG_PORT}/json/list?t=${Date.now()}`, {
      // TODO: use AbortController
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      timeout,
    });
    if (response.status !== 200) {
      return null;
    }
    const sessions = (await response.json()) as DevToolsJsonListItem[];

    return sessions.filter((session) => session.type === 'page' && !systemUrlsPattern.test(session.url))[0];
  } catch (e) {
    return null;
  }
}

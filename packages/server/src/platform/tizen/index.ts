/**
 * Module for communicating with tizen TV.
 */
import fs from 'fs-extra';
import Loggee from 'loggee';
import { getKnownTv } from '../../api/tv/service';
import * as network from '../../helpers/network';
import { tryExecCmd } from '../../helpers/cli';
import { waitForFunction } from '../../helpers/wait-for-function';
import { getAliasByAppId } from '../../api/app/service';
import { proxyUrlAsPath } from '../../proxy/helper';
import { TVInfo } from '../../api/tv/types';
import { MsfInfo } from './tv';
import * as discovery from './discovery';
import * as appPackager from './app-packager';
import TizenTV from './tv';
import TizenApp from './app';
import TizenWsRemoteControl from './ws-remote-control';
import * as wssTokenManager from './wss-token-manager';
import { parseTizen2AppList, parseTizen34AppList } from './app-list-parser';
import remoteKeys from './remote-keys';

const logger = Loggee.create('tizen api');

/**
 * Platform name
 */
export const NAME = 'tizen';

/**
 * Wake up port
 */
export const WAKE_UP_PORT = 8001;

/**
 * Init Tizen platform on server start
 */
export const init = function () {
  wssTokenManager.init();
};

/**
 * Discovers TVs.
 *
 * @param {boolean} [fullscan=false] - scan server subnet
 * @returns {Promise<Array>}
 */
export const discoverTVs = async function (fullscan: boolean) {
  const myIPs = network.getMyIPv4();
  const tvs = await discovery.run(fullscan);
  return tvs.map((info) => unifyTVInfo(info, myIPs));
};

/**
 * Get info about TV.
 *
 * @returns {Promise<Object>}
 */
export const getTVInfo = async function (tvIP: string) {
  logger.log(`Fetching info about: ${tvIP}`);
  const tv = new TizenTV(tvIP);
  const info = await tv.getMsfInfo();
  const myIPs = network.getMyIPv4();
  if (info) {
    const result = unifyTVInfo(info, myIPs);
    const sdbInfo = result.hasAccess ? await tv.getSdbInfo() : null;
    return {
      ...result,
      osVersion: sdbInfo && sdbInfo.version,
    };
  }
};

/**
 * Wait until TV is ready
 */
const TV_READY_TIMEOUT = 60000;
const TV_READY_INTERAL = 1000;

export const waitForReady = async function (ip: string) {
  const tv = new TizenTV(ip);

  return waitForFunction(async () => tv.isReady(), {
    interval: TV_READY_INTERAL,
    timeout: TV_READY_TIMEOUT,
  });
};

export const isReady = async function (ip: string, timeout?: number) {
  const tv = new TizenTV(ip);
  return tv.isReady(timeout);
};

/**
 * SDB CLI info.
 */
export const getSdbCliInfo = function () {
  return tryExecCmd('sdb version');
};

/**
 * Tizen CLI info.
 */
export const getTizenCliInfo = function () {
  return tryExecCmd('tizen version');
};

/**
 * Returns developer panel url.
 */
export const getDevPanelUrl = async function (tvIP: string) {
  const tv = new TizenTV(tvIP);
  const info = await tv.getSdbInfo();
  // render our custom dev panel for Tizen 2.3 because it returns 404
  if (info.version.includes('2.3.')) {
    return `/tizen/dev-panel?ip=${tvIP}`;
  }

  // always proxy this url because dev panel is only accessible from developerIP
  return proxyUrlAsPath(tv.devPanelUrl);
};

/**
 * Returns tv logs url.
 */
export const getLogsUrl = async function (tvIP: string) {
  // return our custom url because native logs don't support wss
  return `/tizen/logs?ip=${tvIP}`;
};

/**
 * Installs app on TV.
 */
export const installApp = async function (tvIP: string, wgtPath: string) {
  const result = await TizenApp.install(tvIP, wgtPath);
  await fs.remove(wgtPath);

  return result;
};

/**
 * Get app state on TV.
 */
export const getAppState = function (tvIP: string, appId: string) {
  return new TizenApp(tvIP, appId).getState();
};

/**
 * Launch app on TV.
 */
export const launchApp = function (tvIP: string, appId: string, params?: Record<string, string>) {
  return new TizenApp(tvIP, appId).launch(params);
};

/**
 * Close app on TV.
 */
export const closeApp = function (tvIP: string, appId: string) {
  return new TizenApp(tvIP, appId).close();
};

/**
 * Debug app on TV.
 */
export const debugApp = function (tvIP: string, appId: string) {
  return new TizenApp(tvIP, appId).debug();
};

/**
 * Uninstall app from TV.
 */
export const uninstallApp = function (tvIP: string, appId: string) {
  return new TizenApp(tvIP, appId).uninstall();
};

/**
 * Gets list of installed apps.
 */
export const getAppList = async function (tvIP: string) {
  const tv = new TizenTV(tvIP);
  const { major } = await tv.getSdbInfo();
  const rawAppList = await tryExecCmd(`sdb -s ${tvIP} shell 0 applist`);

  const appList = major === 2 ? parseTizen2AppList(rawAppList) : parseTizen34AppList(rawAppList);
  return appList.map((app) => ({
    ...app,
    alias: getAliasByAppId(app.appId, 'tizen'),
  }));
};

/**
 * launch browser with optional url.
 */
export const launchBrowser = async function (tvIP: string, url: string) {
  const channel = new TizenWsRemoteControl(tvIP);
  await channel.connect();
  try {
    if (url && !/^https?:\/\//.test(url)) {
      url = `http://${url}`;
    }
    const appId = 'org.tizen.browser';
    await channel.launchApp(appId, { metaTag: url || '' });
    return { appId, url, launched: true };
  } finally {
    await channel.disconnect();
  }
};

export const packApp = async function (inputPath: string, outputPath: string, options = {} as Record<string, unknown>) {
  return appPackager.packWgtApp(inputPath, outputPath, options);
};

export const saveTv = function () {
  // No-op for Tizen
};

export const deleteTv = function () {
  // No-op for Tizen
};

/**
 * Returns all info to open remote-control websocket.
 */
export const getRemoteControlWsInfo = async function (tvIP: string) {
  const remoteControl = new TizenWsRemoteControl(tvIP);
  const wsUrl = await remoteControl.getWsUrl();
  return {
    rawWsUrl: wsUrl,
    payloadPattern: remoteControl.getRemoteKeyPayload(),
    keys: remoteKeys,
  };
};

export const enableDevMode = async function () {
  throw new Error('Not implemented');
};

function unifyTVInfo(info: MsfInfo, myIPs: string[]): Omit<TVInfo, 'lastUsed' | 'osVersion'> {
  const { ip, name, modelName, developerIP, developerMode, resolution, model } = info.device;
  const modelYear = model.split('_')[0];
  const isDeveloperModeOn = developerMode === '1';
  // Tizen 2.3 (modelYear = 15) always shows developerMode = 0
  const hasAccess =
    (isDeveloperModeOn || modelYear === '15') &&
    myIPs.includes(developerIP) &&
    network.areInSameSubnet(ip, developerIP);
  const tvConfig = getKnownTv(ip) || {};
  const { alias = '', streamUrl = '', isVisible } = tvConfig;

  return {
    platform: 'tizen',
    ip,
    name,
    modelName,
    modelYear,
    resolution,
    developerMode: isDeveloperModeOn,
    developerIP,
    hasAccess,
    alias,
    streamUrl,
    isVisible,
  };
}

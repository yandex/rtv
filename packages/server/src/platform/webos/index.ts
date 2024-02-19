/**
 * Communicating with webOS TV via ares-* CLI and websockets.
 */
import fs from 'fs-extra';
import fetch from 'node-fetch';
import _ from 'lodash';
import Loggee from 'loggee';
import { tryExecCmd } from '../../helpers/cli';
import { getKnownTvById } from '../../api/tv/service';
import { getAliasByAppId } from '../../api/app/service';
import { waitForFunction } from '../../helpers/wait-for-function';
import { KnownTv } from '../../api/tv/types';
import * as discovery from './discovery';
import WebOSTV, { WebosTvParams } from './tv';
import WebOSApp from './app';
import WebOSAppDebugger from './app-debugger';
import WebosWsRemoteControl from './ws-remote-control';
import { packIpkApp } from './app-packager';
import remoteKeys from './remote-keys';
import { enableDevMode as runDevMode, extendDevMode, enableDevModeNewInterface as runDevModeNew } from './dev-mode';
import { WebosDeviceInfoExtended } from './discovery';

const logger = Loggee.create('webos');
const READY_TIMEOUT = 3000;
/**
 * Platform name
 */
export const NAME = 'webos';

/**
 * Wake up port
 */
export const WAKE_UP_PORT = 3000;

/**
 * Ares-* CLI info.
 */
export const getAresCliInfo = function () {
  return tryExecCmd('ares-setup-device --version');
};

/**
 * Discovers TVs.
 *
 * @returns {Promise<Array>}
 */
export const discoverTVs = async function () {
  const tvs = await discovery.run();
  return Promise.all(tvs.map((info) => unifyTVInfo(info)));
};

export const getTVInfo = async function (ip: string) {
  logger.log(`Fetching info about: ${ip}`);
  const name = await getNameByIp(ip);
  const tv = new WebOSTV(name);
  const info = await tv.getInfo();
  return unifyTVInfo({ ip, name, ...info });
};

/**
 * Wait until TV is ready
 */
const TV_READY_TIMEOUT = 60000;
const TV_READY_INTERAL = 1000;

export const waitForReady = async function (ip: string) {
  return waitForFunction(async () => isReady(ip), {
    interval: TV_READY_INTERAL,
    timeout: TV_READY_TIMEOUT,
  });
};

export const isReady = async function (ip: string, timeout = READY_TIMEOUT) {
  try {
    // WebOS TVs return 'Hello world' on this endpoint
    const response = await fetch(`https://${ip}:3001`, { timeout });
    return response.status === 200;
  } catch (e) {
    return false;
  }
};

/**
 * Returns developer panel url.
 */
export const getDevPanelUrl = async function () {
  throw new Error('Not supported for webOS');
};

/**
 * Returns developer panel url.
 */
export const getLogsUrl = function () {
  throw new Error('Not supported for webOS');
};

/**
 * Installs app on TV.
 */
export const installApp = async function (tvIp: string, packagePath: string) {
  const tvName = await getNameByIp(tvIp);
  const result = await WebOSApp.install(packagePath, tvName);
  await fs.remove(packagePath);

  return { result };
};

/**
 * Get app state on TV.
 */
export const getAppState = async function (tvIp: string, appId: string) {
  const tvName = await getNameByIp(tvIp);
  const appList = await getAppList(tvIp);
  const installed = appList.map((app) => app.appId).includes(appId);
  return installed ? new WebOSApp(tvName, appId).getState() : { installed: false, running: false };
};

/**
 * Launch app on TV.
 */
export const launchApp = async function (tvIp: string, appId: string, params?: Record<string, unknown>) {
  const tvName = await getNameByIp(tvIp);
  return new WebOSApp(tvName, appId).launch(params);
};

/**
 * Launch app on TV.
 */
export const closeApp = async function (tvIp: string, appId: string) {
  const tvName = await getNameByIp(tvIp);
  const app = new WebOSApp(tvName, appId);
  const result = await app.close();
  await new WebOSAppDebugger(app).cleanUp();
  return result;
};

/**
 * Debug app on TV.
 */
export const debugApp = async function (
  tvIp: string,
  appId: string,
  params?: Record<string, unknown>,
  options?: { attach: boolean }
) {
  const tvName = await getNameByIp(tvIp);
  const app = new WebOSApp(tvName, appId);
  return new WebOSAppDebugger(app).debug(params, options);
};

/**
 * Uninstall app from TV.
 */
export const uninstallApp = async function (tvIp: string, appId: string) {
  const tvName = await getNameByIp(tvIp);
  return new WebOSApp(tvName, appId).uninstall();
};

/**
 * Gets list of installed apps.
 */
export const getAppList = async function (tvIp: string) {
  const tvName = await getNameByIp(tvIp);
  const result = await tryExecCmd(`ares-install -d ${tvName} --list`);
  return result.split('\n').map((appId) => ({ appId, alias: getAliasByAppId(appId, 'webos') }));
};

/**
 * launch browser with optional url.
 */
export const launchBrowser = async function (tvIp: string, url: string) {
  const tvName = await getNameByIp(tvIp);
  return tryExecCmd(`ares-launch -d ${tvName} com.webos.app.browser ${url ? `-p "target=${url}"` : ''}`);
};

/**
 * get webos tv name by ip via ares sdk
 */
export const getNameByIp = async function (ip: string) {
  const tvsLists = await discovery.aresDevicesList();
  const tv = tvsLists.filter(({ deviceinfo }) => deviceinfo.ip === ip)[0];
  return tv && tv.name;
};

export const nameExists = async function (nameToFind: string) {
  const tvsLists = await discovery.aresDevicesList();
  return tvsLists.some(({ name }) => name === nameToFind);
};

export type WebosPackAppOptions = {
  resolution?: string;
  ip?: string;
  noMinify?: boolean;
};

export const packApp = async function (inputPath: string, outputPath: string, options: WebosPackAppOptions = {}) {
  let { resolution } = options;
  if (!resolution && options.ip) {
    const tvInfo = await getTVInfo(options.ip);
    resolution = tvInfo.resolution;
  }

  return packIpkApp(inputPath, outputPath, {
    ...options,
    resolution: resolution || '1920x1080',
  });
};

export const saveTv = async function (id: string, { ip, webOSPassphrase }: Omit<KnownTv, 'id' | 'platform'>) {
  const webosParams: WebosTvParams = {
    ip,
    webOSPassphrase,
  };

  const tv = new WebOSTV(id);
  const existingTv = getKnownTvById(id);
  if (existingTv) {
    const changedFields = _.pickBy(webosParams, (value, key) => value !== existingTv[key as keyof WebosTvParams]);
    return tv.modify(changedFields);
  }

  return tv.create(webosParams);
};

export const deleteTv = async function (id: string) {
  return new WebOSTV(id).delete();
};

/**
 * Returns all info to open remote-control websocket.
 * Uses intermediate websocket connection.
 * @see https://github.com/hobbyquaker/lgtv2
 */
export const getRemoteControlWsInfo = async function (tvIP: string) {
  const remoteControl = new WebosWsRemoteControl(tvIP);
  const wsUrl = await remoteControl.connect();
  await remoteControl.disconnect();
  return {
    rawWsUrl: wsUrl,
    payloadPattern: remoteControl.getRemoteKeyPayload(),
    keys: remoteKeys,
  };
};

export const isDevMode = async function (tvIP: string) {
  const tvName = await getNameByIp(tvIP);
  return new WebOSTV(tvName).isDevMode();
};

export const enableDevMode = async function (tvIP: string) {
  const tvName = await getNameByIp(tvIP);
  const extended = await extendDevMode(tvName);
  if (extended) {
    return 'Dev Mode extended';
  }

  const info = await getTVInfo(tvIP);
  const version = info.osVersion ? parseFloat(info.osVersion) : 0;
  const remoteControl = new WebosWsRemoteControl(tvIP);
  await remoteControl.connect();
  await (version > 6 ? runDevMode(remoteControl) : runDevModeNew(remoteControl));

  return 'Dev Mode enabled';
};

async function unifyTVInfo(tvInfo: WebosDeviceInfoExtended) {
  const { ip, name, modelName, modelYear, sdkVersion, firmwareVersion, boardType, resolution } = tvInfo;
  const developerMode = await isDevMode(ip);
  return {
    ip,
    name,
    developerMode,
    modelName,
    modelYear,
    osVersion: sdkVersion,
    firmwareVersion,
    boardType,
    resolution,
  };
}

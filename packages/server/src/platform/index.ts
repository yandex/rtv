/**
 * Platform API
 */
import fs from 'fs-extra';
import { formatLastUsedInfo, getTvLastUsed } from '../helpers/tv-last-used';
import { getAppByAlias, getAppByAppId, getAppById } from '../api/app/service';
import { getKnownTv, getKnownTvById } from '../api/tv/service';
import { KnownTv } from '../api/tv/types';
import * as tizen from './tizen';
import * as webos from './webos';
import * as playstation from './playstation';
import * as orsay from './orsay';
import * as vidaa from './vidaa';
import { remoteEval } from './shared/remote-eval';
import { WebosPackAppOptions } from './webos';
import { TizenPackAppOptions } from './tizen/app-packager';

export type Platform = 'webos' | 'tizen' | 'orsay' | 'playstation' | 'vidaa';

const PLATFORMS = {
  tizen,
  webos,
  playstation,
  orsay,
  vidaa,
};

/**
 * Get appropriate platform module by TV ip
 */
const getPlatform = (tvIP: string) => {
  const knownTv = getKnownTv(tvIP);
  if (!knownTv) {
    throw new Error(`Unknown TV ${tvIP}`);
  }

  const platform = platformByName(knownTv.platform);
  if (!platform) {
    throw new Error(`Unknown platform for ${knownTv.alias}: ${knownTv.platform}`);
  }

  return platform;
};

/**
 * Get platform module by TV id
 */
const getPlatformById = async (id: string) => {
  const knownTv = getKnownTvById(id);
  if (!knownTv) {
    throw new Error(`Unknown TV with id: ${id}`);
  }

  return platformByName(knownTv.platform);
};

/**
 * Get appropriate platform module by name
 */
const platformByName = (platformName: Platform) => PLATFORMS[platformName];

/**
 * Chech TV is online
 */
export const isReady = async (tvIp: string, timeout?: number) => {
  return getPlatform(tvIp).isReady(tvIp, timeout);
};

/**
 * Init platforms on start server
 */
export const init = () => {
  // currently no webos initialization, but it can be added later
  tizen.init();
};

export const supportsDevToolsProtocol = async function (tvIP: string) {
  const platform = getPlatform(tvIP);
  return platform.NAME !== 'orsay';
};

/**
 * Discovers TVs.
 *
 */
export const discoverTVs = async function () {
  //TODO: implement common discovery
  return [];
};

/**
 * Get info about TV.
 */
export const getTVInfo = async function (tvIP: string) {
  const knownTv = getKnownTv(tvIP);
  const tvInfo = await getPlatform(tvIP).getTVInfo(tvIP);
  return {
    ...knownTv,
    ...tvInfo,
    lastUsed: formatLastUsedInfo(getTvLastUsed(tvIP)),
  };
};

/**
 * Returns developer panel url.
 */
export const getDevPanelUrl = async function (tvIP: string) {
  return getPlatform(tvIP).getDevPanelUrl(tvIP);
};

/**
 * Returns logs url.
 */
export const getLogsUrl = async function (tvIP: string) {
  return getPlatform(tvIP).getLogsUrl(tvIP);
};

/**
 * Installs app on TV.
 */
export const installApp = async function (tvIP: string, packagePath: string, appId: string) {
  return getPlatform(tvIP).installApp(tvIP, packagePath, { appId });
};

/**
 * Get app state on TV.
 */
export const getAppState = async function (tvIP: string, appId: string) {
  const platform = getPlatform(tvIP);
  const ready = await platform.isReady(tvIP, 200);
  if (!ready) {
    throw new Error('TV is not responding');
  }

  return platform.getAppState(tvIP, appId);
};

/**
 * Launch app on TV.
 */
export const launchApp = async function (tvIP: string, appId: string, params?: Record<string, string>) {
  await getPlatform(tvIP).launchApp(tvIP, appId, params);
};

/**
 * Close app on TV.
 *
 * @param {string} tvIP - tv ip address
 * @param {string} appId - application ID
 * @returns {Promise<Object>}
 */
export const closeApp = async function (tvIP: string, appId: string) {
  await getPlatform(tvIP).closeApp(tvIP, appId);
};

/**
 * Debug app on TV.
 */
export const debugApp = async function (
  tvIP: string,
  appId: string,
  params?: Record<string, unknown>,
  options?: { attach: boolean; eval: string }
) {
  const platform = getPlatform(tvIP);
  const debugInfo = await platform.debugApp(tvIP, appId, params, options);
  const app = getAppByAppId(appId, platform.NAME) || getAppById(appId) || getAppByAlias(appId);

  const evalOnDebug = (options && options.eval) || (app && app.evalOnDebug);
  if (evalOnDebug) {
    await remoteEval(`ws://${debugInfo.wsUrl}`, evalOnDebug, params || {}, platform.NAME);
  }

  return {
    platform: platform.NAME as Platform,
    ...debugInfo,
  };
};

/**
 * Uninstall app from TV.
 */
export const uninstallApp = async function (tvIP: string, appId: string) {
  await getPlatform(tvIP).uninstallApp(tvIP, appId);
};

/**
 * Gets list of installed apps.
 */
export const getAppList = async function (tvIP: string) {
  return getPlatform(tvIP).getAppList(tvIP);
};

/**
 * launch browser with optional url.
 */
export const launchBrowser = async function (tvIP: string, url: string) {
  return getPlatform(tvIP).launchBrowser(tvIP, url);
};

/**
 * Enable TV remote control
 */
export const getRemoteControlWsInfo = async function (tvIP: string) {
  return getPlatform(tvIP).getRemoteControlWsInfo(tvIP);
};

export const enableDevMode = async function (tvIP: string) {
  return getPlatform(tvIP).enableDevMode(tvIP);
};

/**
 * Wait until TV is ready
 */
export const waitForReady = async function (tvIP: string) {
  return getPlatform(tvIP).waitForReady(tvIP);
};

export type PackAppOptions = Partial<WebosPackAppOptions & TizenPackAppOptions & { platform?: Platform; ip?: string }>;

/**
 * Pack app
 */
export const packApp = async function (inputPath: string, outputPath: string, options: PackAppOptions = {}) {
  let platform = options.platform ? platformByName(options.platform) : undefined;
  if (!platform && options.ip) {
    platform = getPlatform(options.ip);
  }
  if (!platform) {
    throw new Error('Platform not specified');
  }
  const packedAppPath = await platform.packApp(inputPath, outputPath, options);
  await fs.remove(inputPath);

  return packedAppPath;
};

/**
 * Get platform wake up port
 */
export const getWakeUpPort = async function (tvIP: string) {
  return getPlatform(tvIP).WAKE_UP_PORT;
};

/**
 * Create or modify TV
 */
export const saveTv = async function ({ id, platform, ...fields }: KnownTv) {
  return platformByName(platform).saveTv(id, fields);
};

/**
 * Delete TV
 */
export const deleteTv = async function (id: string) {
  return (await getPlatformById(id)).deleteTv(id);
};

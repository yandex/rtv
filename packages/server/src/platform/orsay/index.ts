/**
 * Module for communicating with Orsay TV.
 */
import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import Loggee from 'loggee';
import { NotNullOrUndefined, throwIf } from '../../helpers';
import { getKnownTv, getKnownTvs, saveKnownTv } from '../../api/tv/service';
import { getAppByAppId } from '../../api/app/service';
import { waitForFunction } from '../../helpers/wait-for-function';
import { values as config } from '../../config';
import { KnownTv } from '../../api/tv/types';
import OrsayTv, { MsfInfo } from './tv';
import OrsayApp from './app';

const logger = Loggee.create('orsay api');
/**
 * Platform name
 */
export const NAME = 'orsay';

/**
 * Wake up not supported
 */
export const WAKE_UP_PORT = null;

/**
 * Init Orsay platform on server start
 */
export const init = function () {
  //No-op for Orsay
};

/**
 * Discovers TVs.
 *
 * @param {boolean} [fullscan=false] - scan server subnet
 * @returns {Promise<Array>}
 */
export const discoverTVs = async function () {
  const allDevices = getKnownTvs().filter((tv) => tv.platform === 'orsay');
  const devices = await Promise.all(
    allDevices.map(async (tv) => {
      const isOn = await new OrsayTv(tv.ip).isReady();
      return isOn ? tv : undefined;
    })
  );

  return devices.filter(NotNullOrUndefined);
};

/**
 * Get info about TV.
 *
 * @returns {Promise<Object>}
 */
export const getTVInfo = async function (tvIP: string) {
  logger.log(`Fetching info about: ${tvIP}`);
  const tv = new OrsayTv(tvIP);
  const info = await tv.getMsfInfo();
  if (info) {
    return unifyTVInfo(info);
  }
};

/**
 * Wait until TV is ready
 */
const TV_READY_TIMEOUT = 60000;
const TV_READY_INTERAL = 1000;

export const waitForReady = async function (ip: string) {
  const tv = new OrsayTv(ip);

  return waitForFunction(async () => tv.isReady(), {
    interval: TV_READY_INTERAL,
    timeout: TV_READY_TIMEOUT,
  });
};

export const isReady = async function (ip: string, timeout?: number) {
  const tv = new OrsayTv(ip);
  return tv.isReady(timeout);
};

/**
 * Returns developer panel url.
 */
export const getDevPanelUrl = async function (tvIP: string) {
  return `/tizen/dev-panel?ip=${tvIP}`;
};

/**
 * Returns tv logs url.
 */
export const getLogsUrl = async function (tvIP: string) {
  // return our custom url because native logs don't support wss
  return `/tizen/logs?ip=${tvIP}`;
};

type InstallOptions = {
  appId?: string | undefined;
};
/**
 * Installs app on TV.
 */
export const installApp = async function (ip: string, pkgPath: string, { appId }: InstallOptions) {
  if (!appId) {
    throw new Error('AppId is not set. It is required for Orsay.');
  }

  const app = getAppByAppId(appId, 'orsay');
  throwIf(!app, `App ${appId} is not found for Orsay`);

  const tv = getKnownTv(ip);
  throwIf(!tv, `TV with IP ${ip} is not found`);

  if (!tv.pkgUrls) {
    tv.pkgUrls = {};
  }

  const pkgStats = await fs.stat(pkgPath);

  tv.pkgUrls[appId] = {
    downloadPath: `/uploads/${path.basename(pkgPath)}`,
    size: (pkgStats.size / 1024).toFixed(0),
  };
  saveKnownTv(tv);

  return { result: 'App is uploaded to server. Sync it manually on TV.' };
};

/**
 * Get app state on TV.
 */
export const getAppState = function (tvIP: string, appId: string) {
  return new OrsayApp(tvIP, appId).getState();
};

/**
 * Launch app on TV.
 */
export const launchApp = function (tvIP: string, appId: string, params?: Record<string, unknown>) {
  return new OrsayApp(tvIP, appId).launch(params);
};

/**
 * Close app on TV.
 */
export const closeApp = function (tvIP: string, appId: string) {
  return new OrsayApp(tvIP, appId).close();
};

/**
 * Debug app on TV.
 */
export const debugApp = function () {
  throw new Error('Not implemented');
};

/**
 * Uninstall app from TV.
 */
export const uninstallApp = async function (ip: string, appId: string) {
  const tv = getKnownTv(ip);
  await deleteAppFromTvStorage(appId, tv);

  return 'Please uninstall app manually.';
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

export const packApp = async function (path: string, out: string) {
  await new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = fs.createWriteStream(out);

    output.on('close', () => resolve(archive));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(path, false);
    archive.finalize();
  });

  return out;
};

export const saveTv = function () {
  // No-op for Orsay
};

export const deleteTv = function () {
  // No-op for Orsay
};

export const getRemoteControlWsInfo = async function () {
  throw new Error('Not implemented');
};

export const enableDevMode = async function () {
  throw new Error('Not implemented');
};

function unifyTVInfo(info: MsfInfo) {
  const { ip, name, modelName, resolution } = info.device;
  const tvConfig = getKnownTv(ip) || {};
  const { alias = '', streamUrl = '', isVisible } = tvConfig;

  return {
    platform: 'orsay',
    ip,
    name,
    modelName,
    resolution,
    developerMode: true,
    hasAccess: true,
    alias,
    streamUrl,
    isVisible,
  };
}

async function deleteAppFromTvStorage(appId: string, tv: KnownTv) {
  if (tv && tv.pkgUrls) {
    const appInfo = tv.pkgUrls[appId];
    if (appInfo) {
      const packagePath = path.join(config.workDirPath, appInfo.downloadPath);
      tv.pkgUrls[appId] = undefined;
      try {
        await fs.remove(packagePath);
      } catch (e) {
        logger.error(e);
      }
    }
  }
}

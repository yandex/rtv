/**
 * Discovery of webOS TVs.
 */
import fs from 'fs-extra';
import Loggee from 'loggee';
import { execCmd } from '../../helpers/cli';
import { values as config } from '../../config';
import { NotNullOrUndefined } from '../../helpers';
import WebOSTV, { WebosDeviceInfo } from './tv';

const logger = Loggee.create('webos discover');

export interface WebosDeviceInfoExtended extends WebosDeviceInfo {
  ip: string;
  name: string;
}

export const run = async function () {
  logger.log(`Retrieving TVs list from ares SDK...`);
  if (!(await fs.pathExists(config.aresPath))) {
    logger.log(`Ares SDK does not exist at aresPath: "${config.aresPath}". Skipping WebOS discovery.`);
    return [];
  }

  const devices = await aresDevicesList();
  logger.log(`Found TVs: ${devices.length}. Checking TVs availability...`);
  const tasks = devices.map(async ({ name, deviceinfo }) => {
    const tv = new WebOSTV(name);
    const info = await tv.getInfo();
    return info ? { ip: deviceinfo.ip, name: tv.name, ...info } : null;
  });

  const result = await Promise.all(tasks);
  const availableDevices = result.filter(NotNullOrUndefined);
  logger.log(`Available TVs: ${availableDevices.length}`);

  return availableDevices;
};

interface AresDeviceListFullItem {
  name: string;
  deviceinfo: {
    ip: string;
  };
}
/**
 * @returns Promise<Array>
 */
export const aresDevicesList = async function () {
  try {
    const result = await execCmd(`ares-setup-device --listfull`, {
      isSilent: true,
    });
    return JSON.parse(result) as AresDeviceListFullItem[];
  } catch (e) {
    logger.error(e);
    return [];
  }
};

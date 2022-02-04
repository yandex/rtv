/**
 * Discovery of Tizen TVs.
 */

import PromiseController from 'promise-controller';
import Loggee from 'loggee';
import * as network from '../../helpers/network';
import { noop, throwIf } from '../../helpers';
import { getKnownTvs } from '../../api/tv/service';
import TizenTV, { MsfInfo } from './tv';

const logger = Loggee.create('tizen discover');

const discovering = new PromiseController({
  timeout: 30 * 1000,
  timeoutReason: `Discovery timeout {timeout} ms.`,
});

/**
 * Discovery run
 *
 * @param {boolean} [fullscan=false] - scan server subnet
 * @returns {Promise<Array>}
 */
export const run = function (fullscan = false): Promise<MsfInfo[]> {
  return discovering.call(async () => {
    const myIPs = network.getMyIPv4();
    const ips = fullscan ? scanSubnet(myIPs) : getIpsFromConfig();
    const results = await Promise.all(ips.map((ip) => new TizenTV(ip).getMsfInfo().catch(noop)));
    const tvs = results.filter(Boolean) as MsfInfo[];
    logger.log(`Found TVs: ${tvs.length}`);
    return tvs;
  });
};

function scanSubnet(myIPs: string[]) {
  const ips = network.getSubnetIPs();
  const mask = myIPs.map((ip) => ip.replace(/\.\d+$/, '.*'));
  logger.log(`Discovering TVs in subnet: ${mask.join(', ')}`);
  throwIf(ips.length === 0, `No TVs found in server subnet. Server IP: ${myIPs.join(', ')}`);
  return ips;
}

function getIpsFromConfig() {
  const tvs = getKnownTvs();
  const ips = tvs.map((tv) => tv.ip);
  if (ips.length === 0) {
    logger.warn(`No TVs found in config`);
  }
  return ips;
}

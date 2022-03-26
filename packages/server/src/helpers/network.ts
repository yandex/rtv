/**
 * Network
 */
import os from 'os';
import { promise as ping } from 'ping';
import { execCmd } from './cli';

interface PlatformNetworkCommands {
  list: string;
  connect: string;
}

const PLATFORM_COMMANDS: Record<string, PlatformNetworkCommands | undefined> = {
  linux: {
    list: 'nmcli --fields name,type,active,device connection show',
    connect: 'nmcli --wait 10 device wifi connect {ssid} password {password}',
  },
  darwin: {
    list: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I',
    connect: 'networksetup -setairportnetwork {iface} {ssid} {password}',
  },
};

/**
 * Returns public ipv4.
 */
export const getMyIPv4 = function () {
  const adresses: string[] = [];
  Object.values(os.networkInterfaces()).forEach((ifaceAdresses) => {
    if (ifaceAdresses) {
      adresses.push(
        ...ifaceAdresses
          .filter((details) => details.family === 'IPv4' && !details.internal)
          .map((details) => details.address)
      );
    }
  });

  return adresses;
};

/**
 * List connected networks
 * See: https://github.com/friedrith/node-wifi
 */
export const getConnections = function () {
  const platformName = os.platform();
  const platformCommands = PLATFORM_COMMANDS[platformName];
  if (!platformCommands) {
    return '';
  }
  const cmd = platformCommands.list;
  return execCmd(cmd);
};

/**
 * Generates array of IPs using own IP with mask 255.255.255.0
 */
export const getSubnetIPs = function () {
  const myIPs = getMyIPv4();
  return myIPs.reduce((result: string[], myIP) => {
    const prefix = myIP.split('.').slice(0, 3).join('.');
    return result.concat([...Array(255).keys()].map((i) => `${prefix}.${i + 1}`));
  }, []);
};

/**
 * Checks whether two IPs are in same subnet with mask 255.255.255.0
 */
export const areInSameSubnet = function (ip1: string, ip2: string) {
  return ip1.split('.').slice(0, 3).join('.') === ip2.split('.').slice(0, 3).join('.');
};

/**
 * Check device is online (via ping)
 */
export const isOnline = async (tvIp: string, timeout?: number) => {
  try {
    const res = await ping.probe(tvIp, { timeout });
    return res.alive;
  } catch (_e) {
    return false;
  }
};

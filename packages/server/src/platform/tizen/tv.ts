/**
 * Tizen TV class.
 *
 * Note that CLI usage with Samsung TV has differences over pure Tizen CLI.
 * See: http://developer.samsung.com/tv/develop/getting-started/using-sdk/command-line-interface
 *
 * SDB sources: https://review.tizen.org/git/?p=sdk/target/sdbd.git
 * See also:
 * https://developer.tizen.org/dev-guide/2.4/org.tizen.devtools/html/common_tools/smart_dev_bridge.htm
 * https://github.com/Solid-Interactive/solid-book/blob/master/tv/samsung/README.md
 * https://github.com/haageduard/samsung_sdb_py
 *
 * Other sdb interesting commands:
 * sdb shell 0 showlog time|raw|brief
 * sdb shell 0 getduid
 * sdb shell 0 getduidgadget
 * sdb shell 0 uname
 * sdb shell 0 getvmname
 * sdb shell 0 getappinstallpath
 * sdb shell 0 rmfile /opt/usr/apps/tmp/App.wgt
 * sdb shell 0 kill pkgId (not appId!)
 * sdb shell 0 runcheck pkgId (not appId!)
 * sdb dlog (does not work - needs wait-for-device command)
 */

import fetch, { FetchError } from 'node-fetch';
import isDocker from 'is-docker';
import * as network from '../../helpers/network';
import { execCmd, tryExecCmd } from '../../helpers/cli';
import { parseVersion, throwIf } from '../../helpers';

const TV_BASE = 'http://{IP}:8001';
const API_BASE = `${TV_BASE}/api/v2/`;
const MSF_INFO_TIMEOUT = 3000;

export interface MsfInfo {
  id: string;
  name: string;
  version: string;
  device: {
    type: string;
    duid: string;
    model: string;
    modelName: string;
    description: string;
    networkType: string;
    ssid: string;
    ip: string;
    firmwareVersion: string;
    name: string;
    id: string;
    udn: string;
    resolution: string;
    countryCode: string;
    msfVersion: string;
    smartHubAgreement: string;
    wifiMac: string;
    developerMode: '0' | '1';
    developerIP: string;
  };
  type: string;
  uri: string;
}

export default class TizenTV {
  _ip: string;
  _msfBaseUrl: string;
  _wsUrl: string;
  _wssUrl: string;

  constructor(ip: string) {
    this._ip = ip;
    this._msfBaseUrl = API_BASE.replace('{IP}', this._ip);
    this._wsUrl = `ws://${this._ip}:8001/api/v2/`;
    this._wssUrl = `wss://${this._ip}:8002/api/v2/`;
  }

  get ip() {
    return this._ip;
  }

  get msfBaseUrl() {
    return this._msfBaseUrl;
  }

  get devPanelUrl() {
    return TV_BASE.replace('{IP}', this._ip);
  }

  /**
   * Native tv logs (available only for http origins)
   */
  get logsUrl() {
    return `${this.devPanelUrl}/logs`;
  }

  /**
   * Check TV is ready
   */
  async isReady(timeout?: number) {
    try {
      const msfInfo = await this.getMsfInfo(timeout); //, this.getSdbInfo()]);
      return msfInfo !== null;
    } catch (e) {
      return false;
    }
  }

  async getMsfInfo(timeout = MSF_INFO_TIMEOUT) {
    try {
      const response = await fetch(this._msfBaseUrl, {
        // TODO: use AbortController
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        timeout,
      });
      return response.ok ? ((await response.json()) as MsfInfo) : null;
    } catch (e) {
      throwIf(
        e instanceof FetchError && e.type === 'request-timeout',
        `TV (${this._ip}) does not respond in ${timeout} ms. Is it connected to network and turned on?`
      );
    }
  }

  async getSdbInfo() {
    await this.ensureSdbConnected();
    const output = await execCmd(`sdb -s ${this._ip} capability`);
    const info = parseCapabilities(output);

    const version = parseVersion(info.platform_version);

    return {
      ...info,
      ...version,
    };
  }

  async ensureSdbConnected() {
    const result = await tryExecCmd(`sdb connect ${this._ip}`);
    if (!/is already connected|connected to/.test(result)) {
      throw new Error(await this._createSdbConnectionErrorMsg());
    }
  }

  async _createSdbConnectionErrorMsg() {
    const tvInfo = await this.getMsfInfo();

    // Note: Tizen 2.3 always shows developerMode = 0
    if (tvInfo && tvInfo.device.developerMode !== '1') {
      return `Can not connect to ${this._ip} because developer mode is off.`;
    }

    // Note: inside docker own IP differs from host IP, so no need to check it for better error message
    // todo: try to get host IP from inside docker container?
    if (tvInfo && !isDocker()) {
      const myIPs = network.getMyIPv4();
      const developerIP = tvInfo.device.developerIP;
      if (!myIPs.includes(developerIP) || !network.areInSameSubnet(this._ip, developerIP)) {
        return (
          `Can not connect to ${this._ip} because client IPs (${myIPs.join(', ')}) ` +
          `is not developer IP (${developerIP}).`
        );
      }
    }

    return `Can not connect to ${this._ip} for unknown reason.`;
  }
}

function parseCapabilities(output: string) {
  return output.split('\n').reduce((res, line) => {
    const [key, value] = line.trim().split(':');
    res[key] = value;
    return res;
  }, {} as Record<string, string>);
}

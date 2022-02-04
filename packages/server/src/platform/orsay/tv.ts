/**
 * Orsay TV class.
 */
import fetch, { FetchError } from 'node-fetch';
import { throwIf } from '../../helpers';

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
  };
  type: string;
  uri: string;
}

export default class OrsayTV {
  _ip: string;
  _msfBaseUrl: string;

  constructor(ip: string) {
    this._ip = ip;
    this._msfBaseUrl = API_BASE.replace('{IP}', this._ip);
  }

  get ip() {
    return this._ip;
  }

  get msfBaseUrl() {
    return this._msfBaseUrl;
  }

  /**
   * Check TV is ready
   */
  async isReady(timeout?: number) {
    try {
      const msfInfo = await this.getMsfInfo(timeout);
      return msfInfo !== null;
    } catch (e) {
      return false;
    }
  }

  async getMsfInfo(timeout = MSF_INFO_TIMEOUT) {
    try {
      const response = await fetch(this._msfBaseUrl, {
        timeout,
      });
      if (!response.ok) {
        return null;
      }
      const info = (await response.json()) as MsfInfo;

      return info;
    } catch (e) {
      throwIf(
        e instanceof FetchError && e.type === 'request-timeout',
        `TV (${this._ip}) does not respond in ${timeout} ms. Is it connected to network and turned on?`
      );
      throw e;
    }
  }
}

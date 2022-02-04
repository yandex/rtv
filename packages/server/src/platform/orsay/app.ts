import fetch from 'node-fetch';
import Loggee from 'loggee';
import { throwIf } from '../../helpers';
import OrsayTV from './tv';

const logger = Loggee.create('orsay app');
const INSTALLED_APP_API_URL = '{msfBaseUrl}applications/{appId}';
const NOT_FOUND = /Not Found/;

export default class OrsayApp {
  _tv: OrsayTV;
  _appId: string;
  _msfUrl: string;

  constructor(tvIP: string, appId: string) {
    this._tv = new OrsayTV(tvIP);
    this._appId = appId;
    this._msfUrl = INSTALLED_APP_API_URL.replace('{msfBaseUrl}', this._tv.msfBaseUrl).replace('{appId}', appId);
  }

  get id() {
    return this._appId;
  }

  get tv() {
    return this._tv;
  }

  async getState() {
    try {
      const result = await this._msfRequest('GET');
      return {
        installed: true,
        name: result.name,
        running: result.running,
        version: result.version,
      };
    } catch (err) {
      if (err instanceof Error && NOT_FOUND.test(err.message)) {
        return {
          installed: false,
          running: false,
        };
      }
    }
  }

  /**
   *
   * @param {?Object} [params]
   * @returns {Promise}
   */
  async launch(params?: Record<string, unknown>) {
    await this.close();
    const bodyObj = this._getLaunchBody(params);
    return this._msfRequest('POST', bodyObj);
  }

  /**
   * Close app if running.
   * @returns {Promise<Boolean>} true if app was closed, false if app was not running
   */
  async close() {
    await this._msfRequest('DELETE');
    return true;
  }

  _getLaunchBody(params?: Record<string, unknown>) {
    return params ? { id: JSON.stringify(params) } : null;
  }

  /**
   * Perform msf request.
   * @returns {Promise<Object|null>}
   */
  async _msfRequest(method: string, bodyObj?: Record<string, unknown> | null) {
    const body = bodyObj ? JSON.stringify(bodyObj) : undefined;
    logger.log(method.toUpperCase(), this._msfUrl, body || '');
    const response = await fetch(this._msfUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await response.text();
    logger.log(`RESPONSE (${response.status}):`, text);
    const json = text ? JSON.parse(text) : null;
    throwIf(!response.ok, (json && json.message) || text);
    return json;
  }
}

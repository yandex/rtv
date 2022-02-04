/**
 * Connection to special system WebSocket channel "samsung.remote.control".
 * Allows to send remote control commands and make some operations with apps.
 */

import PromiseController from 'promise-controller';
import { toBase64 } from '../../helpers';
import TizenWsChannel, { Message } from './ws-channel';
import * as wssTokenManager from './wss-token-manager';
import TizenTV from './tv';

const REMOTE_CONTROL_CHANNEL_NAME = 'samsung.remote.control';
const GET_INSTALLED_APPS = 'ed.installedApp.get';
const LAUNCH_APP = 'ed.apps.launch';
const WS_SECURE_CONNECT_TIMEOUT = 20000;

const gettingInstalledAppsOptions = {
  timeout: 2000,
  timeoutReason: `Can't get installed apps within timeout {timeout} ms.`,
};

const launchingAppOptions = {
  timeout: 5000,
  timeoutReason: `Can't get launch apps within timeout {timeout} ms.`,
};

export default class TizenWsRemoteControl {
  _tizenWsChannel: TizenWsChannel;
  _tv: TizenTV;
  _gettingInstalledApps: PromiseController;
  _launchingApp: PromiseController;

  constructor(tvIP: string) {
    this._tizenWsChannel = new TizenWsChannel();
    this._tv = new TizenTV(tvIP);
    this._gettingInstalledApps = new PromiseController(gettingInstalledAppsOptions);
    this._launchingApp = new PromiseController(launchingAppOptions);
  }

  async _buildUrlParams() {
    const { major } = await this._tv.getSdbInfo();
    const isSecure = major > 2;

    return {
      baseUrl: isSecure ? this._tv._wssUrl : this._tv._wsUrl,
      channel: REMOTE_CONTROL_CHANNEL_NAME,
      options: isSecure ? this._getSecureOptions() : undefined,
    };
  }

  _getSecureOptions() {
    return {
      token: wssTokenManager.get(this._tv.ip),
      name: toBase64('rtv'),
    };
  }

  async connect() {
    const urlParams = await this._buildUrlParams();
    const isSecure = urlParams.baseUrl.startsWith('wss://');
    await this._tizenWsChannel.connect(
      urlParams,
      (message) => this._handleMessage(message),
      isSecure ? WS_SECURE_CONNECT_TIMEOUT : undefined
    );
  }

  async getWsUrl() {
    const urlParams = await this._buildUrlParams();
    return this._tizenWsChannel.buildUrl(urlParams);
  }

  async disconnect() {
    return this._tizenWsChannel.disconnect();
  }

  getInstalledApps() {
    return this._gettingInstalledApps.call(() => {
      this._tizenWsChannel.sendPacked({
        method: 'ms.channel.emit',
        params: {
          event: GET_INSTALLED_APPS,
          to: 'host',
          data: {},
        },
      });
    });
  }

  launchApp(appId: string, extraData: Record<string, unknown>) {
    return this._launchingApp.call(() => {
      const data = Object.assign({ appId, action_type: 'NATIVE_LAUNCH' }, extraData);
      this._tizenWsChannel.sendPacked({
        method: 'ms.channel.emit',
        params: {
          event: LAUNCH_APP,
          to: 'host',
          data,
        },
      });
    });
  }

  getRemoteKeyPayload() {
    return JSON.stringify({
      method: 'ms.remote.control',
      params: {
        Cmd: 'Click',
        DataOfCmd: '{{KEY}}',
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    });
  }

  _handleLaunch(data: Message) {
    const result = data.data;
    const launched = result === true || result === 200;
    if (launched) {
      this._launchingApp.resolve();
    } else {
      this._launchingApp.reject(new Error('Can not launch app.'));
    }
  }

  async _handleMessage(message: Message) {
    const event = message && message.event;
    if (event === TizenWsChannel.EVENT_CONNECT) {
      if (message.data.token && wssTokenManager.get(this._tv.ip) !== message.data.token) {
        wssTokenManager.set(this._tv.ip, message.data.token);
      }
    } else if (event === GET_INSTALLED_APPS) {
      this._gettingInstalledApps.resolve(message.data.data);
    } else if (event === LAUNCH_APP) {
      this._handleLaunch(message);
    }
  }
}

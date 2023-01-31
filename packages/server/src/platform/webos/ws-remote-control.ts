/**
 * Websocket remote control for Webos
 * @see https://github.com/hobbyquaker/lgtv2
 */
import { RequestOptions } from 'https';
import websocket from 'ws';
import WebSocketAsPromised from 'websocket-as-promised';
import PromiseController from 'promise-controller';
import { getKnownTv, saveKnownTv } from '../../api/tv/service';
import { KnownTv } from '../../api/tv/types';
import helloMessage from './remote-hello-msg.json';

const PAYLOAD_PATTERN = 'type:button\nname:{{KEY}}\n\n';
const COMMANDS = {
  POINTER_INPUT_SOCKET: 'ssap://com.webos.service.networkinput/getPointerInputSocket',
  INSERT_TEXT: 'ssap://com.webos.service.ime/insertText',
  LAUNCH_APP: 'ssap://com.webos.applicationManager/launch',
};
const CLIENT_KEY = 'client-key';

const registeringWsOptions = {
  timeout: 20000,
  timeoutReason: `Can't register websocket within timeout {timeout} ms.`,
};

type Message = {
  type: string;
  payload: Record<string, unknown>;
};

type InsertTextOptions = {
  replace: boolean;
};

export default class WebosWsRemoteControl {
  wsUrl: string;
  tv: KnownTv;
  _wsp: WebSocketAsPromised;
  _registerWsController: PromiseController;
  _pointerWsUrl: string | undefined;
  _pointerWs: WebSocketAsPromised | undefined;

  constructor(tvIp: string) {
    this.wsUrl = `ws://${tvIp}:3000`;
    this.tv = getKnownTv(tvIp);
    this._wsp = new WebSocketAsPromised(this.wsUrl, {
      createWebSocket: (url) => new websocket.WebSocket(url),
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (message) => JSON.parse(message.toString()),
      attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
      extractRequestId: (data) => data && data.id,
    });
    this._registerWsController = new PromiseController(registeringWsOptions);
  }

  async connect() {
    this._wsp.onUnpackedMessage.addListener((data) => this._handleMessage(data));

    await this._wsp.open();

    await this.register();
    this._pointerWsUrl = await this._getPointerWsUrl();

    return this._pointerWsUrl;
  }

  _handleMessage(message: Message) {
    if (message.type === 'registered') {
      this._registerWsController.resolve();
      this.tv.webOSClientKey = message.payload[CLIENT_KEY] as string;
      saveKnownTv(this.tv);
    }
  }

  async register() {
    return this._registerWsController.call(() => {
      if (this.tv.webOSClientKey) {
        helloMessage.payload[CLIENT_KEY] = this.tv.webOSClientKey;
      }
      this._wsp.sendPacked(helloMessage);
    });
  }

  async launchApp(appId: string) {
    return this._request(COMMANDS.LAUNCH_APP, { id: appId });
  }

  insertText(text: string, options?: InsertTextOptions) {
    return this._request(COMMANDS.INSERT_TEXT, { text, replace: options ? options.replace : true });
  }

  async sendKey(key: string) {
    if (!this._pointerWsUrl) {
      throw new Error('Not connected.');
    }

    if (!this._pointerWs) {
      this._pointerWs = new WebSocketAsPromised(this._pointerWsUrl, {
        createWebSocket: (url) => new websocket.WebSocket(url),
      });
      await this._pointerWs.open();
    }

    this._pointerWs.send(PAYLOAD_PATTERN.replace('{{KEY}}', key));
  }

  async _getPointerWsUrl() {
    const { payload } = await this._request(COMMANDS.POINTER_INPUT_SOCKET);
    return payload.socketPath as string;
  }

  getWsUrl() {
    return this._pointerWsUrl;
  }

  getRemoteKeyPayload() {
    return PAYLOAD_PATTERN;
  }

  async disconnect() {
    return this._wsp.close();
  }

  async _request(uri: string, payload?: Record<string, unknown>, options?: RequestOptions) {
    const data = {
      type: 'request',
      uri,
      payload,
    };

    return this._wsp.sendRequest(data, options);
  }
}

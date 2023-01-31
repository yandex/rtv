/**
 * Connection to Tizen SmartView WebSocket channel.
 * Used for messaging with apps.
 */
import { URL } from 'url';
import websocket from 'ws';
import WebSocketAsPromised from 'websocket-as-promised';
import PromiseController from 'promise-controller';

const WS_CONNECT_DEFAULT_TIMEOUT = 3000;
const WS_CHANNEL_URL = '{msfBaseUrl}channels/{channelName}';

type BuildUrlParams = {
  baseUrl: string;
  channel: string;
  options?: Record<string, string> | undefined;
};

export type Message = {
  event: string;
  data: {
    data?: unknown;
    token?: string;
  };
};

export default class TizenWsChannel {
  static EVENT_CONNECT = 'ms.channel.connect';
  _wsp?: WebSocketAsPromised;
  _connecting: PromiseController;
  /**
   *
   * @param {Object} urlParams
   * @param {Function} handler
   * @param {?number} timeout
   */
  async connect(urlParams: BuildUrlParams, handler: (data: Message) => void, timeout = WS_CONNECT_DEFAULT_TIMEOUT) {
    const url = this.buildUrl(urlParams);
    this._wsp = new WebSocketAsPromised(url, {
      createWebSocket: (url) => new websocket.WebSocket(url),
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (message) => JSON.parse(message.toString()),
      attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
      extractRequestId: (data) => data && data.id,
    });

    this._wsp.onUnpackedMessage.addListener((data) => this._handleConnect(data));
    this._wsp.onUnpackedMessage.addListener((data) => handler(data));

    this._connecting = new PromiseController({
      timeout,
      // todo: log WebSocket url: https://github.com/vitalets/websocket-as-promised/issues/14
      timeoutReason: `Can't connect to WebSocket within timeout {timeout} ms.`,
    });

    return this._connecting.call(
      // use void because connecting promise is resolved after 'ms.channel.connect' message.
      () => void (this._wsp ? this._wsp.open() : null)
    );
  }

  buildUrl({ baseUrl, channel, options }: BuildUrlParams) {
    const url = new URL(WS_CHANNEL_URL.replace('{msfBaseUrl}', baseUrl).replace('{channelName}', channel));
    if (options) {
      Object.keys(options).forEach((key) => url.searchParams.set(key, options[key]));
    }

    return url.href;
  }

  async disconnect() {
    return this._wsp ? this._wsp.close() : null;
  }

  sendPacked(data: unknown) {
    return this._wsp ? this._wsp.sendPacked(data) : null;
  }

  _handleConnect(message: Message) {
    const event = message && message.event;
    if (event === TizenWsChannel.EVENT_CONNECT) {
      this._connecting.resolve(message.data);
    }
  }
}

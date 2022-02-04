/**
 * Websocket connection for TV remote control
 */
import WS from 'isomorphic-ws';
import WebsocketAsPromised from 'websocket-as-promised';

const throwError = (str: string) => {
  throw new Error(str);
};

export class WsRemoteControl {
  private wsUrl: string;
  private payloadPattern: string;
  private keys: Record<string, string>;
  private wsp?: WebsocketAsPromised;

  constructor(wsUrl: string, payloadPattern: string, keys: Record<string, string>) {
    this.wsUrl = wsUrl;
    this.payloadPattern = payloadPattern;
    this.keys = keys;
  }

  async connect({ onClose }: { onClose?(): unknown }) {
    this.wsp = new WebsocketAsPromised(this.wsUrl, {
      // Here DOM WebSocket type from lib.dom conflicts with Node Websocket, declared in 'ws', so ignore it
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      createWebSocket: (url) => new WS(url),
    });
    if (onClose) {
      this.wsp.onClose.addOnceListener(onClose);
    }

    return this.wsp.open();
  }

  getKeys() {
    return this.keys;
  }

  sendKey(key: string) {
    if (!this.wsp) {
      return throwError('Not connected');
    }
    const knownKey = this.keys[key] || throwError(`Unknown key: ${key}`);

    return this.wsp.send(this.payloadPattern.replace('{{KEY}}', knownKey));
  }
}

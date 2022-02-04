/**
 * Client API
 */
import { IS_NODE } from './helpers/env';
import defaultConfig from './config';
import AppApi from './api/app';
import SystemApi from './api/system';
import TvApi from './api/tv';
import RoomApi from './api/room';

// hack to allow https requests from rtv-client
if (IS_NODE) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * RTV client config.
 */
export interface RTVClientConfig {
  /**
   * RTV server API address
   * Default: 'http://localhost:3000/api'
   */
  apiUrl: string;
  /**
   * Request timeout in milliseconds
   * Default: 20000
   */
  timeout: number;
  /**
   * Write operations throw error if TV was recently used by another user
   * Default: true
   */
  checkTvIsOccupied: boolean;
  /**
   * rtv-user name (shown in lastUsed field)
   * Defaults:
   *  - process.env.USER for Node.js
   *  - undefined for browser
   */
  user: string | undefined;
}

export interface RTVClientHandlers {
  /**
   * API request handler
   */
  onNeedUpdate?: (...args: any[]) => unknown;
  /**
   * Handler called when client version differs from server version
   */
  onRequest?: (...args: any[]) => unknown;
}

export default class RTVClient {
  config: Partial<RTVClientConfig>;
  app: AppApi;
  tv: TvApi;
  system: SystemApi;
  room: RoomApi;

  /**
   * Create rtv-client
   */
  constructor(config: Partial<RTVClientConfig>, { onNeedUpdate = noop, onRequest = noop }: RTVClientHandlers = {}) {
    this.config = { ...defaultConfig };
    this.mergeConfig(config);
    const handlers = {
      onNeedUpdate: onNeedUpdate || noop,
      onRequest: onRequest || noop,
    };

    this.app = new AppApi(this.config, handlers);
    this.tv = new TvApi(this.config, handlers);
    this.system = new SystemApi(this.config, handlers);
    this.room = new RoomApi(this.config, handlers);
  }

  mergeConfig(config: Partial<RTVClientConfig>) {
    Object.assign(this.config, config);
  }
}

export { KnownApp, AppState, KnownTv, TVInfo, Platform } from 'rtv-server';
export type { WsRemoteControl } from './remote-control/ws-remote-control';

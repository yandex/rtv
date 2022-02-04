/**
 * Browser App API. For Node.js use Node.js App API
 */
import {
  KnownApp,
  InstallAppResult,
  PackAppAdditionalParams,
  AppState,
  DebugAppInfo,
  DebugAppOptions,
  AppInfo,
} from 'rtv-server';

import { createFormData } from '../helpers/form-data';
import ApiBase from './common/api-base';

// Long commands like debug/install/launch need more time
const LONG_CMD_TIMEOUT = 60 * 1000;

export default class App extends ApiBase {
  /**
   * [Browser] Install app on the TV from pkg directory or .ipk/.wgt file.
   */
  async installApp(
    ip: string,
    file: any,
    { noMinify = undefined, appId = undefined }: { noMinify?: boolean; appId?: string } = {}
  ): Promise<InstallAppResult> {
    const formData = createFormData({
      ip,
      noMinify,
      appId,
    });

    formData.append('file', file, file.name);

    return this._request({
      path: 'app/install',
      options: {
        method: 'POST',
        body: formData,
        timeout: LONG_CMD_TIMEOUT,
      },
    });
  }

  /**
   * [Browser] Pack app from path on server and write to out file.
   * Platform is detected by out file extension: .wgt for tizen, .ipk for webOS.
   */
  async packApp(file: any, out: string, params: PackAppAdditionalParams = {}): Promise<any> {
    const platform = detectPlaftormByFileExt(out);
    const formData = createFormData({
      platform,
      ...params,
    });
    formData.append('file', file, file.name);

    const fileStream = await this._request({
      path: 'app/pack',
      options: {
        method: 'POST',
        body: formData,
        timeout: LONG_CMD_TIMEOUT,
      },
    });

    return fileStream;
  }

  /**
   * Get state of app on TV
   */
  async stateApp(ip: string, appId: string): Promise<AppState> {
    return this._request({
      path: 'app/state',
      queryObj: { ip, appId },
    });
  }

  /**
   * Launch app on TV
   */
  async launchApp(ip: string, appId: string, params: Record<string, unknown>): Promise<void> {
    return this._request({
      path: 'app/launch',
      options: {
        method: 'post',
        timeout: LONG_CMD_TIMEOUT,
      },
      queryObj: { ip, appId, params },
    });
  }

  /**
   * Debug app on TV
   */
  async debugApp(ip: string, appId: string, params: object, options: DebugAppOptions): Promise<DebugAppInfo> {
    if (options && options.eval) {
      options.eval = String(options.eval);
    }
    return this._request({
      path: 'app/debug',
      options: {
        method: 'post',
        timeout: LONG_CMD_TIMEOUT,
      },
      queryObj: { ip, appId, params, options },
    });
  }

  /**
   * Close app on TV
   */
  async closeApp(ip: string, appId: string): Promise<void> {
    return this._request({
      path: 'app/close',
      options: { method: 'post' },
      queryObj: { ip, appId },
    });
  }

  /**
   * Uninstall app from TV
   */
  async uninstallApp(ip: string, appId: string): Promise<void> {
    return this._request({
      path: 'app/uninstall',
      options: {
        method: 'post',
        timeout: LONG_CMD_TIMEOUT,
      },
      queryObj: { ip, appId },
    });
  }

  /**
   * TV application list
   */
  async getAppList(ip: string): Promise<AppInfo[]> {
    return this._request({
      path: 'app/list',
      queryObj: { ip },
    });
  }

  /**
   * Get known apps
   */
  async getKnownApps(): Promise<KnownApp[]> {
    return this._request({
      path: 'app/known',
    });
  }

  /**
   * Create or updates app.
   */
  async saveKnownApp(app: KnownApp): Promise<KnownApp> {
    return this._request({
      path: 'app/known',
      options: {
        method: 'post',
        body: JSON.stringify(app),
        headers: {
          'content-type': 'application/json',
        },
      },
    });
  }

  /**
   * Delete known app
   */
  async deleteKnownApp(id: string): Promise<void> {
    return this._request({
      path: `app/known/${id}`,
      options: {
        method: 'delete',
      },
    });
  }
}

const detectPlaftormByFileExt = (fileName: string) => {
  const parts = fileName.split('.');
  const extension = parts[parts.length - 1];
  switch (extension) {
    case 'wgt':
      return 'tizen';
    case 'ipk':
      return 'webos';
    case 'zip':
      return 'orsay';
    default:
      throw new Error(`Unknown file extension: ${extension}`);
  }
};

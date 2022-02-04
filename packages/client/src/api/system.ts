import { Env } from 'rtv-server';
import ApiBase from './common/api-base';

export default class System extends ApiBase {
  /**
   * Server env
   */
  async env(): Promise<Env> {
    return this._request({
      path: 'system/env',
    });
  }

  /**
   * Server status
   */
  async status(): Promise<Record<string, unknown>> {
    return this._request({
      path: 'system/status',
    });
  }
}

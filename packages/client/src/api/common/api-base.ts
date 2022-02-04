/**
 * Base class for API
 */
import request from '../../request';
import { RTVClientConfig } from '../../index';

export interface ApiBaseRequestParams {
  /**
   * url path, e.g. 'app/install'
   */
  path: string;
  /**
   * query object
   */
  queryObj?: Record<string, unknown>;
  /**
   * fetch options
   */
  options?: Record<string, unknown>;
}

class RtvRequestError extends Error {
  constructor(data: Record<string, unknown>) {
    super();
    Object.assign(this, data);
  }
}

export default class ApiBase {
  private _config;
  private _handlers;
  /**
   * API constructor
   */
  constructor(config: Partial<RTVClientConfig>, handlers = {}) {
    this._config = config;
    this._handlers = handlers;
  }

  /**
   * Request to API
   */
  async _request({ path, queryObj, options = {} }: ApiBaseRequestParams) {
    const response = await request({
      config: this._config,
      handlers: this._handlers,
      path,
      queryObj,
      options,
    });

    if (!response) {
      throw new Error('No response');
    }

    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition && /attachment/.test(contentDisposition)) {
      return response.body;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any;

    try {
      json = await response.json();
    } catch (e: unknown) {
      json = null;
    }

    if (!response.ok) {
      throw new RtvRequestError(json);
    }

    return json;
  }
}

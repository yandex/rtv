/**
 * Send request to RTV server.
 */
import semver from 'semver';
import * as qs from 'query-string';
import fetch from 'isomorphic-fetch';

const clientVersion = process.env.npm_package_version as string;

export interface RequestParams {
  config: {
    apiUrl?: string;
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;
    /**
     * Write operations throw error if TV was recently used by another user
     *
     * @default true
     */
    checkTvIsOccupied?: boolean;
    /**
     * rtv-user name (shown in lastUsed field)
     */
    user?: string;
  };

  handlers: RequestHandlers;
  path: string;
  queryObj?: Record<string, unknown>;
  options?: RequestOptions;
}

export interface RequestHandlers {
  onRequest?(info: string): unknown;
  onNeedUpdate?(data: { serverVersion: string; clientVersion: string }): unknown;
}

export interface RequestOptions {
  method?: string;
  timeout?: number;
  headers?: Record<string, string>;
  body?: any;
}

export default async function ({ config, handlers, path, options, queryObj }: RequestParams) {
  return new Request({ config, handlers, path, options, queryObj }).fetch();
}

class Request {
  private _timeout: number | undefined;
  private _apiUrl: string | undefined;
  private _handlers: RequestHandlers | undefined;
  private _checkTvIsOccupied: boolean | undefined;
  private _rtvUser: string | undefined;
  private _response: Awaited<ReturnType<typeof fetch>> | undefined;
  private _url = '';
  private _headers: Record<string, string> = {};
  private _options: RequestOptions = {};

  constructor({ config, handlers, path, options, queryObj }: RequestParams) {
    this._timeout = config.timeout;
    this._apiUrl = config.apiUrl;
    this._handlers = handlers;
    this._checkTvIsOccupied = config.checkTvIsOccupied;
    this._rtvUser = config.user;
    this._setUrl(path, queryObj);
    this._setHeaders(options ? options.headers : undefined);
    this._setOptions(options);
  }

  async fetch() {
    this._logUrl();
    await this._fetchResponse();
    this._checkOutdatedVersions();
    return this._response;
  }

  _setUrl(path: string, queryObj = {}) {
    queryObj = stringifyValues(queryObj);
    const query = Object.keys(queryObj).length ? `?${qs.stringify(queryObj, { sort: false })}` : '';
    this._url = `${this._apiUrl}/${path}${query}`;
  }

  _setHeaders(headers: Record<string, string | undefined> | undefined) {
    Object.assign(this._headers, headers, {
      'x-rtv-client-version': clientVersion,
    });
    if (this._rtvUser) {
      this._headers['x-rtv-user'] = this._rtvUser;
    }
    if (this._checkTvIsOccupied) {
      this._headers['x-rtv-check-last-used'] = 'true';
    }
  }

  _setOptions(options: RequestOptions | undefined) {
    this._options = Object.assign(
      {
        timeout: this._timeout,
        headers: this._headers,
        credentials: 'include',
      },
      options
    );
  }

  async _fetchResponse() {
    this._response = await fetch(this._url, this._options);
  }

  _checkOutdatedVersions() {
    if (!this._response || !this._response.headers) {
      return;
    }
    const serverVersion = this._response.headers.get('x-rtv-server-version');
    if (serverVersion && this._handlers && this._handlers.onNeedUpdate) {
      checkOutdated(serverVersion, this._handlers.onNeedUpdate);
    }
  }

  _logUrl() {
    if (this._handlers && this._handlers.onRequest) {
      const method = this._options.method || 'get';
      this._handlers.onRequest(`${method.toUpperCase()} ${this._url}`);
    }
  }
}

const stringifyValues = (obj: Record<string, unknown>) =>
  Object.keys(obj).reduce((res, key) => {
    if (obj[key] !== undefined) {
      res[key] = typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key];
    }
    return res;
  }, {} as Record<string, unknown>);

const checkOutdated = (
  serverVersion: string,
  onNeedUpdate: (versions: { serverVersion: string; clientVersion: string }) => unknown
) => {
  if (semver.gt(clientVersion, serverVersion) || semver.lt(clientVersion, serverVersion)) {
    onNeedUpdate({ serverVersion, clientVersion });
  }
};

/**
 * Middleware for aliases in requests
 */
import { Request, Response, NextFunction } from 'express';
import { get, set } from 'lodash';
import { getKnownTv } from '../tv/service';
import { getAppIdByAlias } from '../app/service';

type AliasConfig = Record<string, unknown> | (() => Record<string, unknown>);
type AliasesConfig = Record<string, AliasConfig>;
/**
 * Replace req fields according to alias config
 * @param {object} aliasConfig
 * aliasConfig: {
 *  'path.to.field': {
 *    alias1: value1,
 *    alias2: () => value2
 *  }
 * }
 */
export const alias = (aliasConfig: AliasesConfig | null) => async (req: Request, res: Response, next: NextFunction) => {
  if (aliasConfig) {
    Object.keys(aliasConfig).forEach((path) => {
      const aliasesOrFunction = aliasConfig[path];
      const aliases = typeof aliasesOrFunction === 'function' ? aliasesOrFunction() : aliasesOrFunction;
      if (aliases) {
        const alias = get(req, path);
        if (aliases[alias] !== undefined) {
          set(req, path, aliases[alias]);
        }
      }
    });
  }

  next();
};

export const queryIpAlias = (aliasConfig: AliasConfig) => alias({ 'query.ip': aliasConfig });

export const appIdAlias = (ipPath = 'query.ip', appIdPath = 'query.appId') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const ip = get(req, ipPath);
    const tv = getKnownTv(ip);
    const appAlias = get(req, appIdPath);
    if (tv && tv.platform && appAlias) {
      const appId = getAppIdByAlias(appAlias, tv.platform);
      if (appId) {
        set(req, appIdPath, appId);
      }
    }

    next();
  };
};

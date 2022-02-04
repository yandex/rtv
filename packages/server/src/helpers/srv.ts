/**
 * Server helpers
 */
import url from 'url';
import { Request, Response, NextFunction } from 'express';
import { version } from '../pkg';
import { values as config } from '../config';

/**
 * Returns server origin, e.g. 'localhost' -> 'http://localhost:3000'
 */
export const getServerOrigin = function (req: Request) {
  const origin = req.get('origin');
  if (origin) {
    return origin;
  }
  const protocol = config.httpsPort ? 'https' : 'http';
  const port = protocol === 'https' ? config.httpsPort : config.port;
  return url.format({
    protocol,
    hostname: req.hostname,
    port,
  });
};

export const getServerOriginWs = function (req: Request) {
  return getServerOrigin(req).replace('http://', 'ws://').replace('https://', 'wss://');
};

/**
 * Add server version middleware
 */
export const addServerVersion = function (req: Request, res: Response, next: NextFunction) {
  res.setHeader('x-rtv-server-version', version);
  next();
};

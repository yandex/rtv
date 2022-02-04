/**
 * Proxy helper functions
 */
import { IncomingMessage } from 'http';
import url from 'url';
import { Request, Response } from 'express';
import cookie from 'cookie';

const COOKIE_REFERER = '_rtv_referer';

/**
 * Returns proxied path.
 * Don't return full url because it depends on server hostname of request.
 *
 * http://87.250.238.244:7011/abc/index.html?x=1
 * -->
 * /proxy/http/87.250.238.244/7011/abc/index.html?x=1
 */
export const proxyUrlAsPath = function (targetUrl: string) {
  const { protocol, hostname, port, pathname, search } = url.parse(targetUrl);
  if (!protocol) {
    throw new Error(`Protocol not set for ${targetUrl}`);
  }
  const newPathname = `/proxy/${protocol.replace(':', '')}/${hostname}/${port}${pathname}`;
  return url.format({
    pathname: newPathname,
    search,
  });
};

/**
 * /proxy/http/87.250.238.244/7011/abc?x=1
 * -->
 * http://87.250.238.244:7011/abc?x=1
 */
export const unproxyPathAsUrl = function (path: string) {
  if (isProxiedPath(path)) {
    const [protocol, hostname, port, ...rest] = path.replace('/proxy/', '').split('/');
    return `${protocol}://${hostname}:${port}/${rest.join('/')}`;
  }

  return path;
};

export const isProxiedPath = function (pathname: string) {
  return pathname.indexOf('/proxy/') === 0;
};

/**
 * Check request referer: if it is proxied url, then returns resolved request url based on referer.
 */
export const detectProxyRequestByReferer = function (req: IncomingMessage) {
  const referer = req.headers.referer || getRefererFromCookie(req);
  const parsedReferer = referer ? url.parse(referer) : null;
  if (!parsedReferer || !parsedReferer.pathname) {
    return null;
  }
  const isProxiedReferer = isProxiedPath(parsedReferer.pathname);
  if (isProxiedReferer && req.url) {
    const basePath = extractBasePath(parsedReferer.pathname);
    return url.resolve(`${basePath}/`, req.url.slice(1));
  }

  return null;
};

/**
 * WebSocket Upgrade request does not contain referer.
 * That why root WebSocket urls from proxied page can't be proxied.
 * The solution is to set domain cookie for the very short time and check on server side.
 */
export const storeRefererInCookie = (res: Response, req: Request) => {
  const maxAge = 5 * 1000;
  res.cookie(COOKIE_REFERER, req.originalUrl, { maxAge, httpOnly: true });
};

/**
 * Gets host part from proxy path
 * Example:
 * /proxy/http/87.250.238.244/7011/abc/index.html?x=1
 * -->
 * 87.250.238.244
 */
export const getProxiedHost = (req: Request) => req.path.split('/')[2];

function getRefererFromCookie(req: IncomingMessage) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[COOKIE_REFERER];
}

/**
 * Base path is '/proxy/protocol/host/port' from full path.
 * Example:
 * /proxy/http/87.250.238.244/7011/abc/index.html?x=1
 * -->
 * /proxy/http/87.250.238.244/7011
 */
function extractBasePath(pathname: string) {
  return pathname.split('/').slice(0, 5).join('/');
}

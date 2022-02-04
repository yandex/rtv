/**
 * rtv-user helper
 */
import { URL } from 'url';
import { IncomingMessage } from 'http';
import { Request } from 'express';
import cookie from 'cookie';

export const RTV_USER = 'rtv-user';

const RTV_USER_COOKIE = 'rtv-user';
const RTV_USER_HEADER = 'x-rtv-user';

/**
 * Get rtv-user from URL
 * @param {URL} url - URL
 * */
export const getRtvUserFromUrl = (url: URL) => url.searchParams.get(RTV_USER);

/**
 * Get rtv-user from Request
 * @param {http.IncomingMessage} req - Request instance
 * */
export const getRtvUserFromRequest = (req: IncomingMessage): string | undefined => {
  const cookies = cookie.parse(req.headers.cookie || '');
  return (req.headers[RTV_USER_HEADER] as string) || cookies[RTV_USER_COOKIE];
};

/**
 * Get rtv-user from Express.Request
 * @param {Express.Request} req - Express Request instance
 * */
export const getRtvUserFromExpressRequest = (req: Request) =>
  req.query[RTV_USER] || req.get(RTV_USER_HEADER) || req.cookies[RTV_USER_COOKIE];

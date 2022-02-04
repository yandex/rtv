/**
 * Proxy requests to TV browser. used for debugging apps via Chrome dev tools.
 * Example:
 * http://localhost:3000/proxy/http/87.250.238.244/7011/abc?x=1
 * -->
 * http://87.250.238.244:7011/abc?x=1
 */
import http, { ServerResponse } from 'http';
import querystring from 'querystring';
import { URL } from 'url';
import { Duplex } from 'stream';
import Loggee from 'loggee';
import { Router } from 'express';
import httpProxy from 'http-proxy';
import { updateTvLastUsed } from '../helpers/tv-last-used';
import { getRtvUserFromUrl, getRtvUserFromRequest } from '../helpers/rtv-user';
import { trackBy } from '../api/middleware/tv-last-used';
import { getProxiedHost, unproxyPathAsUrl, storeRefererInCookie } from './helper';
import { addConnection, deleteConnection } from './connections';

const logger = Loggee.create('proxy');

interface ProxyRouter extends Router {
  proxyWs: (target: string, req: http.IncomingMessage, socket: Duplex, head: Buffer) => void;
}

export const router = Router() as ProxyRouter;
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ignorePath: true,
});

router.use(trackBy(getProxiedHost, { action: 'proxy' }));

router.use(function (req, res) {
  const target = unproxyPathAsUrl(req.originalUrl);
  logger.log(`Proxy: ${req.method} ${req.originalUrl} --> ${target}`);
  const selfHandleResponse = false;
  if (req.accepts('html')) {
    storeRefererInCookie(res, req);
  }
  proxy.web(req, res, { target, selfHandleResponse });
});

router.proxyWs = function (target: string, req: http.IncomingMessage, socket: Duplex, head: Buffer) {
  logger.log(`Proxy WS: ${req.url} --> ${target}`);

  const targetUrl = new URL(querystring.unescape(target));
  const rtvUser = getRtvUserFromUrl(targetUrl) || getRtvUserFromRequest(req);
  // cut query params because TVs close websockets with query params
  targetUrl.search = '';

  if (rtvUser) {
    socket.on('data', () => updateTvLastUsed(targetUrl.hostname, rtvUser, 'ws:' + targetUrl.pathname));
  }
  proxy.ws(req, socket, head, { target: targetUrl.href, secure: false });
};

proxy.on('error', (err, _req, res) => {
  logger.log(err);
  const response = res as ServerResponse;
  if (response.headersSent === false) {
    response.statusCode = 500;
  }
  res.end(`Proxy error: ${err.message}`);
});

proxy.on('proxyReq', function (proxyReq) {
  // Set Connection to keep-alive. Otherwise (close) leads to empty response body.
  const connection = proxyReq.getHeader('Connection');
  if (connection === 'close') {
    proxyReq.setHeader('Connection', 'keep-alive');
  }
});

proxy.on('open', function (proxySocket) {
  addConnection(proxySocket);
});

proxy.on('close', function (res, socket) {
  deleteConnection(socket);
});

import path from 'path';
import https from 'https';
import http from 'http';
import { Duplex } from 'stream';
import fs from 'fs-extra';
import express, { Request, Response, NextFunction } from 'express';
import Loggee from 'loggee';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import cors from 'cors';
import { values as config } from './config';
import api from './api';
import web from './web';
import devtools from './devtools';
import { router as proxy } from './proxy';
import { isProxiedPath, detectProxyRequestByReferer, unproxyPathAsUrl } from './proxy/helper';
import * as platform from './platform';
import { initDb } from './helpers/db';
import { startWebsocketServer } from './api/streams/service';
import { StreamServer } from './api/streams/StreamServer';

const logger = Loggee.create();

// hack to enable wss connections https://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '10mb', strict: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(redirectRootRequestsWithProxyReferer);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../public'));

app.use('/', web);
app.use('/api', api);
app.use('/proxy', proxy);
app.use('/devtools', devtools);
app.use('/uploads', express.static(path.join(config.workDirPath, 'uploads')));

let httpServer: http.Server | undefined;
let httpsServer: https.Server | undefined;
let streamServer: StreamServer | undefined;

export const start = async function () {
  await init();
  httpServer = startHttp();
  if (config.httpsPort) {
    httpsServer = startHttps();
  }
  if (config.streamsPort) {
    streamServer = startWebsocketServer();
  }
};

export const close = function () {
  if (httpServer) {
    httpServer.close((err) => console.log(err));
  }
  if (httpsServer) {
    httpsServer.close((err) => console.log(err));
  }
  if (streamServer) {
    streamServer.close();
  }
};

async function init() {
  initDb();
  platform.init();
}

function startHttp() {
  const server = http.createServer(app);
  initServer(server);
  server.listen(config.port, () => logger.log(`HTTP server is listening on port ${getPort(server)}`));

  return server;
}

function startHttps() {
  const options = {
    key: config.httpsKey ? fs.readFileSync(config.httpsKey, { encoding: 'utf8' }) : undefined,
    cert: config.httpsCert ? fs.readFileSync(config.httpsCert, { encoding: 'utf8' }) : undefined,
    requestCert: false,
    rejectUnauthorized: false,
  };
  const server = https.createServer(options, app);
  initServer(server);
  server.listen(config.httpsPort, () => logger.log(`HTTPS server is listening on port ${getPort(server)}`));

  return server;
}

function getPort(server: http.Server | https.Server): string {
  const address = server.address();
  if (!address) {
    return '';
  }

  return typeof address === 'object' ? address.port.toString() : address;
}

function initServer(server: http.Server | https.Server) {
  // Keep the socket open for streaming
  // https://github.com/phoboslab/jsmpeg/blob/master/websocket-relay.js#L88
  server.headersTimeout = 0;
  server.on('upgrade', onUpgrade);
}

/**
 * Often proxied pages perform requests starting from server root (e.g. '/resource').
 * Such requests are not caught by proxy as page url is like 'http://tvserver:3000/proxy/http/87.250.238.244/7011/abc'.
 * The middleware below checks `referer` header of requests and if request comes from proxied page - redirect it
 * to correct proxy url.
 * Used HTTP status is 307 to proxy also POST requests.
 * See: https://softwareengineering.stackexchange.com/questions/99894/why-doesnt-http-have-post-redirect
 */
function redirectRootRequestsWithProxyReferer(req: Request, res: Response, next: NextFunction) {
  const proxyPathByReferer = !isProxiedPath(req.url) && detectProxyRequestByReferer(req);
  if (proxyPathByReferer) {
    logger.log(`Redirect (by referer): ${req.method} ${req.url} --> ${proxyPathByReferer}`);
    res.redirect(307, proxyPathByReferer);
  } else {
    next();
  }
}

function onUpgrade(req: http.IncomingMessage, socket: Duplex, head: Buffer) {
  if (req.headers.upgrade === 'websocket') {
    proxyWebSocketRequest(req, socket, head);
  }
}

/**
 * WebSocket Upgrade request does not contain referer, but proxy stores referer in cookie with very short lifetime.
 */
function proxyWebSocketRequest(req: http.IncomingMessage, socket: Duplex, head: Buffer) {
  if (!req.url) {
    throw new Error('Request url is empty!');
  }
  const proxyPath = isProxiedPath(req.url) ? req.url : detectProxyRequestByReferer(req);
  if (proxyPath) {
    const target = unproxyPathAsUrl(proxyPath);
    logger.log(`Upgrade (websocket): ${req.url} --> ${target}`);
    proxy.proxyWs(target, req, socket, head);
  } else {
    logger.warn(`Unproxied Upgrade request`);
  }
}

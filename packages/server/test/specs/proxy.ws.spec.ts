import http from 'http';
import { promisify } from 'util';
import websocket from 'websocket';

import { httpPort } from '../constants';

const W3CWebSocket = websocket.w3cwebsocket;
const WSServer = websocket.server;
// TODO: fix on Node 10: socket connection like ::ffff:127.0.0.1:5000 -> ::ffff:127.0.0.1:54538 hangs after all tests
describe.skip('proxy ws', () => {
  let server: http.Server;
  let wsServer: websocket.server;

  before(async () => {
    server = http.createServer();
    wsServer = new WSServer({
      httpServer: server,
      autoAcceptConnections: true,
    });

    const listen = promisify((port: number, cb: () => void) => server.listen(port, cb));
    await listen(1234);
    console.log('server start');
    wsServer.on('close', () => console.log('ws server close'));
    wsServer.on('connect', () => console.log('ws server connect'));
  });

  after(async () => {
    wsServer.shutDown();
    const close = promisify(server.close);
    await close();
    console.log('server closed');
  });

  it('should proxy ws', (done) => {
    const client = new W3CWebSocket(`ws://localhost:${httpPort}/proxy/http/localhost/1234`);
    client.onopen = () => done();
  });
});

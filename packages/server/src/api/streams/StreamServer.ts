/**
 * Multi-channel websocket stream server
 */
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import Loggee from 'loggee';
import { values as config } from '../../config';

const logger = Loggee.create('streams');
const streamUrlRegExp = /\/streams\/\d+/;

type ChannelWebSocket = WebSocket & { channelId?: number };

interface StreamWebsocketServer extends WebSocketServer {
  clients: Set<ChannelWebSocket>;
}

export class StreamServer {
  private _wsServer: StreamWebsocketServer;
  private _connectionCount = 0;

  constructor() {
    this._wsServer = new WebSocketServer({
      port: config.streamsPort || 8081,
      perMessageDeflate: false,
    });
    this._wsServer.on('connection', (socket, upgradeReq) => this._onClientConnected(socket, upgradeReq));
  }

  broadcastChannel(channelId: number, data: unknown) {
    this._wsServer.clients.forEach((client) => {
      if (client.channelId === channelId && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  close() {
    this._wsServer.close();
  }

  _onClientConnected(socket: ChannelWebSocket, upgradeReq: IncomingMessage) {
    this._connectionCount++;
    const req = upgradeReq;
    logger.log(
      `New WS client: ${req.socket.remoteAddress} ${req.headers['user-agent']}, ` + `(${this._connectionCount} total)`
    );
    socket.on('close', () => this._onClientDisconnected());
    if (upgradeReq && upgradeReq.url && streamUrlRegExp.test(upgradeReq.url)) {
      // Get channelId from URL /api/streams/:id
      const idStr = upgradeReq.url.split('/').filter(Boolean).pop();
      socket.channelId = idStr ? parseInt(idStr) : 0;
    }
  }

  _onClientDisconnected() {
    this._connectionCount--;
    logger.log(`Disconnected WebSocket (${this._connectionCount} total)`);
  }
}

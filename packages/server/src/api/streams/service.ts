import { IncomingMessage } from 'http';
import Loggee from 'loggee';
import { StreamServer } from './StreamServer';

const logger = Loggee.create('streams');

let streamServer: StreamServer;

export const startWebsocketServer = () => {
  streamServer = new StreamServer();

  return streamServer;
};

export const createStream = (channelId: number, req: IncomingMessage) => {
  logger.log(`Stream "${channelId}" connected: ${req.socket.remoteAddress}:${req.socket.remotePort}`);
  req.on('data', (data: unknown) => {
    if (streamServer) {
      streamServer.broadcastChannel(channelId, data);
    }
  });
  req.on('end', () => logger.log(`Stream "${channelId}" closed`));
};

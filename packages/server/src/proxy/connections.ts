/**
 * Store active proxied WebSocket connecitons
 */
import { Socket } from 'net';

const activeWebSockets = new Map();

export const getAllConnections = () => Array.from(activeWebSockets.values());

export const addConnection = (socket: Socket) => {
  const target = getSocketTarget(socket);
  activeWebSockets.set(target, { target, created: Date.now() });
};

export const deleteConnection = (socket: Socket) => {
  const target = getSocketTarget(socket);
  activeWebSockets.delete(target);
};

function getSocketTarget(socket: Socket) {
  return `${socket.remoteAddress}:${socket.remotePort}`;
}

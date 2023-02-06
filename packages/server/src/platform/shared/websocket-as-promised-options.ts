import { WebSocket } from 'ws';

export const createWebSocket = (url: string) => new WebSocket(url);
export const extractMessageData = (event: unknown) => event;

export const packMessage = (data: unknown) => JSON.stringify(data);
export const unpackMessage = (message: string | ArrayBuffer | Blob) => JSON.parse(message.toString());

export const attachRequestId = (data: unknown, requestId: number | string) => Object.assign({ id: requestId }, data);
export const extractRequestId = (data: { id: number | string }) => data && data.id;

/**
 * API response protocol
 */
import fs from 'fs';
import { Request, Response } from 'express';
import Loggee from 'loggee';
import { ValidationError } from './middleware/validator';

const logger = Loggee.create('protocol');
/**
 * Sends response as JSON.
 */
export const sendResponse = function (
  data: string | Record<string, unknown> | Record<string, unknown>[] | undefined | null,
  _req: Request,
  res: Response
) {
  // ensure data is object to allow JSON.parse on client
  data = toJson(data);
  sendJson(data, res);
};

/**
 * Send file
 */
export const sendFile = async function (path: string, _req: Request, res: Response, { deleteAfterSend = false }) {
  res.download(path, (err) => {
    logError(err);
    if (deleteAfterSend) {
      fs.unlink(path, logError);
    }
  });
};

/**
 * Sends error: response with 500 status and message
 */
export const sendError = function (error: (Error & { type?: string }) | string, _req: Request, res: Response) {
  const isString = typeof error === 'string';
  const code = error instanceof ValidationError ? 422 : 500;
  res.status(code);
  const message = `Error: ${isString ? error : error.message}`;
  sendJson({ message, type: isString ? '' : error.type }, res);
};

/**
 * Sends 404.
 */
export const send404 = function (message: string, _req: Request, res: Response) {
  res.status(404);
  sendJson({ message }, res);
};

export const sendXml = function (xml: string, res: Response) {
  res.set('Content-Type', 'text/xml');
  res.send(xml);
};

function toJson(data: string | Record<string, unknown> | Record<string, unknown>[] | undefined | null) {
  // convert undefined to null, as undefined is stripped from JSON.stringify
  data = data === undefined ? null : data;
  return typeof data !== 'object' ? { result: data } : data;
}

function sendJson(obj: Record<string, unknown> | Record<string, unknown>[] | undefined | null, res: Response) {
  res.send(JSON.stringify(obj, undefined, 2));
}

function logError(err: Error | null) {
  if (err) {
    logger.error(err);
  }
}

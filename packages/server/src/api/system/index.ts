/**
 * Handlers for system routes
 */
import os from 'os';
import { Request, Response } from 'express';
import * as tizen from '../../platform/tizen';
import * as webos from '../../platform/webos';
import * as network from '../../helpers/network';
import { values as config } from '../../config';
import * as connections from '../../proxy/connections';
import { sendResponse } from '../protocol';

export const getEnvInfo = async (req: Request, res: Response) => {
  const result = {
    ip: network.getMyIPv4().join(', '),
    platform: os.platform(),
    node: process.version,
    sdb: await tizen.getSdbCliInfo(),
    tizen: await tizen.getTizenCliInfo(),
    ares: await webos.getAresCliInfo(),
    network: await network.getConnections(),
  };
  sendResponse(result, req, res);
};

export const getConfig = function (req: Request, res: Response) {
  sendResponse(config, req, res);
};

export const getStatus = function (req: Request, res: Response) {
  const websockets = JSON.stringify(connections.getAllConnections());
  sendResponse({ websockets }, req, res);
};

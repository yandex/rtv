import { Request, Response } from 'express';
import { values as config } from '../../config';
import { sendResponse } from '../protocol';

export const list = (req: Request, res: Response) => {
  if (config.externalRoomsUrl) {
    return res.redirect(config.externalRoomsUrl);
  }
  const rooms = config.rooms || [];
  sendResponse(rooms, req, res);
};

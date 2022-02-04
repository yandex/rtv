import { Request, Response } from 'express';
import { createStream } from './service';

export const create = (req: Request, res: Response) => {
  const channelId = parseInt(req.params.id);
  if (res.socket) {
    res.socket.setTimeout(0);
    createStream(channelId, req);
  }
};

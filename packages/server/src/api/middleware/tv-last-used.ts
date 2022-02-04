/**
 * Middleware to log tv last used actions
 */
import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import { updateTvLastUsed, whoIsUsingTv } from '../../helpers/tv-last-used';
import { getRtvUserFromExpressRequest } from '../../helpers/rtv-user';

class TvIsOccupiedError extends Error {
  type: string;

  constructor(message: string) {
    super(message);
    this.type = 'tv-is-occupied';
  }
}

interface TraceByOptions {
  action?: string | undefined;
}
/**
 * @param {function} getIp - function which gets ip from req
 * @param {object} options - options
 */
export const trackBy = (getIp: (req: Request) => string, options: TraceByOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tvIp = getIp(req);
    if (!tvIp) {
      return next();
    }

    const user = getRtvUserFromExpressRequest(req) || req.ip;
    if (req.get('x-rtv-check-last-used')) {
      ensureTvIsNotOccupied(tvIp, user);
    }
    const action = options.action || req.baseUrl.split('/').pop() + req.path;
    updateTvLastUsed(tvIp, user, action);

    next();
  };
};

const ensureTvIsNotOccupied = (tvIp: string, user: string) => {
  const tvUser = whoIsUsingTv(tvIp);
  if (tvUser && tvUser !== user) {
    throw new TvIsOccupiedError(`${tvIp} is occupied by ${tvUser}`);
  }
};

export const trackByQuery = trackBy((req) => get(req, 'query.ip'));

export const trackByBody = trackBy((req) => get(req, 'body.ip'));

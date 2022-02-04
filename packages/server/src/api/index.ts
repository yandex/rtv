import { Router, Request, Response, NextFunction } from 'express';
import Loggee from 'loggee';
import { addServerVersion } from '../helpers/srv';
import { getRtvUserFromExpressRequest } from '../helpers/rtv-user';
import tvRouter from './tv/routes';
import appRouter from './app/routes';
import systemRouter from './system/routes';
import streamsRouter from './streams/routes';
import roomsRouter from './room/routes';
import { sendError, send404 } from './protocol';

const logger = Loggee.create('api');
const router = Router();

const NO_AUTH_PATHS = ['/tv/widgetlist'];

router.use(logRequest);
router.use(ensureApiAuth);
router.use(addServerVersion);
router.use('/tv', tvRouter);
router.use('/app', appRouter);
router.use('/system', systemRouter);
router.use('/streams', streamsRouter);
router.use('/room', roomsRouter);
router.use(notFoundHandler);
router.use(errorHandler);

function notFoundHandler(req: Request, res: Response) {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  logger.warn(message);
  send404(message, req, res);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(error.stack);
  sendError(error, req, res);
}

function logRequest(req: Request, res: Response, next: NextFunction) {
  logger.log(`${req.method} ${req.url}`);
  next();
}

function ensureApiAuth(req: Request, res: Response, next: NextFunction) {
  if (NO_AUTH_PATHS.some((path) => req.path.startsWith(path)) || getRtvUserFromExpressRequest(req)) {
    return next();
  }

  res.sendStatus(401);
}

export default router;

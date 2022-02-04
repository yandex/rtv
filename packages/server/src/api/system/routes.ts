/**
 * Routes for system
 */
import express from 'express';
import * as systemController from '../system';

const router = express.Router();

router.get('/env', systemController.getEnvInfo);

router.get('/config', systemController.getConfig);

router.get('/status', systemController.getStatus);

export default router;

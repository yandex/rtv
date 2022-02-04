/**
 * Web routes
 */
import express from 'express';
import { trackByQuery } from '../../api/middleware/tv-last-used';
import { getIpAliases } from '../../api/tv/service';
import { queryIpAlias } from '../../api/middleware/aliases';
import { validateQuery, ipSchema } from '../../api/middleware/validator';
import * as webController from '../tizen';

export const router = express.Router();

router.get(
  '/dev-panel',
  queryIpAlias(getIpAliases),
  validateQuery(ipSchema),
  trackByQuery,
  webController.renderDevPanel
);

router.get('/logs', queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, webController.renderLogs);

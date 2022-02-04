/**
 * Routes for tv
 */
import express from 'express';

import { queryIpAlias } from '../middleware/aliases';
import { validateQuery, validateBody, validateParams, idSchema, ipSchema } from '../middleware/validator';
import { trackByQuery } from '../middleware/tv-last-used';
import { DEPRECATED } from '../middleware/deprecated';
import { tv as tvSchema } from './validator';
import { getIpAliases } from './service';
import * as tvController from './';

const router = express.Router();

router.get('/list', tvController.getTvList);

router.get('/known', tvController.getKnownTvs);

router.post('/known', validateBody(tvSchema), tvController.saveKnownTv);

router.delete('/known/:id', validateParams(idSchema), tvController.deleteKnownTv);

router.get('/info', queryIpAlias(getIpAliases), validateQuery(ipSchema), tvController.getTvInfo);

router.get(
  '/dev-panel',
  queryIpAlias(getIpAliases),
  validateQuery(ipSchema),
  trackByQuery,
  tvController.getDevPanelUrl
);

router.get('/logs', queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, tvController.getLogsUrl);

router.post(
  '/remote-control',
  queryIpAlias(getIpAliases),
  validateQuery(ipSchema),
  trackByQuery,
  tvController.getRemoteControlWsInfo
);

router
  .route('/browser')
  .get(DEPRECATED, queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, tvController.launchBrowser)
  .post(queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, tvController.launchBrowser);

router
  .route('/up')
  .get(DEPRECATED, queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, tvController.wakeUpTv)
  .post(queryIpAlias(getIpAliases), validateQuery(ipSchema), trackByQuery, tvController.wakeUpTv);

router.post('/dev-mode/enable', validateQuery(ipSchema), tvController.enableDevMode);

router.post('/free', queryIpAlias(getIpAliases), validateQuery(ipSchema), tvController.freeTv);

router.get('/widgetlist', tvController.getWidgetlist);

export default router;

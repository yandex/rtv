/**
 * Routes for app
 */
import express from 'express';
import upload from '../middleware/file-uploader';
import { alias, queryIpAlias, appIdAlias } from '../middleware/aliases';
import { validateQuery, validateBody, validateParams, ipSchema, idSchema } from '../middleware/validator';
import { DEPRECATED } from '../middleware/deprecated';
import { getIpAliases } from '../tv/service';
import { trackByQuery, trackByBody } from '../middleware/tv-last-used';
import { app as appSchema } from './validator';
import * as appController from './';

const router = express.Router();

router.post(
  '/install',
  upload,
  alias({ 'body.ip': getIpAliases }),
  appIdAlias('body.ip', 'body.appId'),
  validateBody(ipSchema),
  trackByBody,
  appController.installApp
);

router.post('/pack', upload, appController.packApp);

router
  .route('/launch')
  .get(
    DEPRECATED,
    queryIpAlias(getIpAliases),
    appIdAlias(),
    validateQuery(ipSchema),
    trackByQuery,
    appController.launchApp
  )
  .post(queryIpAlias(getIpAliases), appIdAlias(), validateQuery(ipSchema), trackByQuery, appController.launchApp);

router
  .route('/close')
  .get(
    DEPRECATED,
    queryIpAlias(getIpAliases),
    appIdAlias(),
    validateQuery(ipSchema),
    trackByQuery,
    appController.closeApp
  )
  .post(queryIpAlias(getIpAliases), appIdAlias(), validateQuery(ipSchema), trackByQuery, appController.closeApp);

router
  .route('/debug')
  .get(
    DEPRECATED,
    queryIpAlias(getIpAliases),
    appIdAlias(),
    validateQuery(ipSchema),
    trackByQuery,
    appController.debugApp
  )
  .post(queryIpAlias(getIpAliases), appIdAlias(), validateQuery(ipSchema), trackByQuery, appController.debugApp);

router.get('/state', queryIpAlias(getIpAliases), appIdAlias(), validateQuery(ipSchema), appController.getAppState);

router
  .route('/uninstall')
  .get(
    DEPRECATED,
    queryIpAlias(getIpAliases),
    appIdAlias(),
    validateQuery(ipSchema),
    trackByQuery,
    appController.uninstallApp
  )
  .post(queryIpAlias(getIpAliases), appIdAlias(), validateQuery(ipSchema), trackByQuery, appController.uninstallApp);

router.get('/list', queryIpAlias(getIpAliases), validateQuery(ipSchema), appController.getAppList);

router.get('/known', appController.getKnownApps);

router.post('/known', validateBody(appSchema), appController.saveKnownApp);

router.delete('/known/:id', validateParams(idSchema), appController.deleteKnownApp);

export default router;

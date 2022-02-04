/**
 * Web pages for rtv server
 */
import path from 'path';
import express from 'express';
import { pathExistsSync } from 'fs-extra';
import { router as tizenRoutes } from './tizen/routes';

const router = express.Router();

const uiStaticRoot = path.join(__dirname, '../../../ui/build');
if (pathExistsSync(uiStaticRoot)) {
  const UI_PATHS = ['/', '/login', '/settings/tv', '/settings/app'];
  const rtvUi = express.static(uiStaticRoot);

  UI_PATHS.forEach((path) => router.use(path, rtvUi));
}

router.use('/tizen', tizenRoutes);

export default router;

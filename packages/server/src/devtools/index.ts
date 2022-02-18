/**
 * Web pages for rtv server
 */
import path from 'path';
import express from 'express';

const router = express.Router();

// Chrome devtools for Tizen 3.0 based on Chromium 47.0.2526.69
router.use('/', express.static(path.join(__dirname, '../../public/devtools/front_end_47.0.2526.69')));
// Webkit devtools for Tizen 2.4
router.use('/webkit', express.static(path.join(__dirname, '../../public/devtools/front_webkit')));
// Chrome devtools for Tizen 4.0 based on Chromium 56.0.2924.122 and Tizen 5.0 based on Chromium 63
router.use('/tizen4', express.static(path.join(__dirname, '../../public/devtools/front_end_56.0.2924.122')));

// Chrome devtools for webOS 3.* and lower based on Chromium 38.0.2125.122
// from https://github.com/stamoern/webos-devtools/tree/webos-3
router.use('/webos3', express.static(path.join(__dirname, '../../public/devtools/front_end_38.0.2125.122')));
// Chrome devtools for webOS 4.* based on Chromium 54.0.2792.0
// from https://github.com/stamoern/webos-devtools/tree/webos-4
router.use('/webos4', express.static(path.join(__dirname, '../../public/devtools/front_end_54.0.2792.0')));

router.use('/tizen6', express.static(path.join(__dirname, '../../public/devtools/frontend_tizen_6')));

router.use('/webos6', express.static(path.join(__dirname, '../../public/devtools/frontend_webos_6')));

export default router;

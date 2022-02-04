/**
 * Routes for streams
 */
import express from 'express';
import * as streamController from '.';

const router = express.Router();

router.post('/:id', streamController.create);

export default router;

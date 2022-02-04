/**
 * Routes for room
 */
import express from 'express';
import { list } from './';

const router = express.Router();

router.get('/list', list);

export default router;

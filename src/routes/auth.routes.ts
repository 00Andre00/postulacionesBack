import { Router } from 'express';
import { loginHandler, meHandler } from '../controllers/auth.controller';
import { requiereAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginHandler);
router.get('/me', requiereAuth, meHandler);

export default router;
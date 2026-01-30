import { Router } from 'express';
import { signup, signin, requestPasswordReset, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
